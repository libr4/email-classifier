import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Alert, Badge, Box, Chip, Container, Divider, IconButton, Snackbar, Stack, Tooltip, Typography } from "@mui/material";
import { theme } from "theme";
import { HeaderBar } from "components/HeaderBar";
import { UserBubble } from "components/UserBubble";
import { ShimmerBubble } from "components/ShimmerBubble";
import { BotBubble } from "components/BotBubble";
import { Composer } from "components/Composer";
import type { BotBubbleResult, FilePreview, Healthz, MessagePair } from "types";
import { MAX_ATTACH, MAX_CHARS, makePreview, runDevSelfTests, sanitizeText, uuid, isTxtFile, readFileSafe } from "utils/text";
import { fetchHealth, postClassify, postClassifyBatch } from "utils/api";
import { useSessionState } from "hooks/useSessionState";

export default function App() {
  const [health, setHealth] = useState<Healthz | null>(null);
  const [offline, setOffline] = useState(false);
  const [pairs, setPairs] = useSessionState<MessagePair[]>("autou_pairs_v1", []);
  const [typed, setTyped] = useState("");
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [toast, setToast] = useState<{ open: boolean; msg: string; sev: "success" | "info" | "warning" | "error" }>({ open: false, msg: "", sev: "info" });
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

  useEffect(() => { fetchHealth().then((h) => { setHealth(h); setOffline(false); }).catch(() => setOffline(true)); }, []);
  useEffect(() => { scrollToBottom(); }, [pairs]);
  useEffect(() => {
    if ((import.meta as any).env?.MODE !== "production") { 
    runDevSelfTests();
  }
}, []);


  const totalItemPairs = useMemo(() => pairs.reduce((acc, p) => acc + p.bots.filter((b) => !('loading' in b && b.loading)).length, 0), [pairs]);

  const attachFiles = async (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    const newList = Array.from(selected);
    if (files.length + newList.length > MAX_ATTACH) { setToast({ open: true, msg: "Máximo de 10 arquivos .txt por envio.", sev: "warning" }); return; }
    const accepted: FilePreview[] = [];
    for (const f of newList) {
      if (!isTxtFile(f)) { setToast({ open: true, msg: `Apenas arquivos .txt são aceitos: ${f.name}`, sev: "error" }); continue; }
      const raw = await readFileSafe(f);
      const sanitized = sanitizeText(raw);
      if (sanitized.length > MAX_CHARS) { setToast({ open: true, msg: `Arquivo ultrapassa 20.000 caracteres: ${f.name}`, sev: "error" }); continue; }
      accepted.push({ name: f.name, text: sanitized, preview: makePreview(sanitized) });
    }
    if (accepted.length === 0) return;
    setFiles((prev) => [...prev, ...accepted]);
  };

  const onDrop = (ev: React.DragEvent) => { ev.preventDefault(); const dt = ev.dataTransfer; if (!dt?.files) return; attachFiles(dt.files); };
  const onDragOver = (ev: React.DragEvent) => { ev.preventDefault(); };

  const clearChat = () => { setPairs([]); setToast({ open: true, msg: "Conversa limpa.", sev: "success" }); };
  const removeFile = (idx: number) => { setFiles((prev) => prev.filter((_, i) => i !== idx)); };

  const handleSend = async () => {
    if (offline) { setToast({ open: true, msg: "Sem conexão com o servidor.", sev: "error" }); return; }
    const items: { kind: "typed" | "file"; value: string; name?: string }[] = [];
    const typedSanitized = sanitizeText(typed);
    if (typedSanitized.trim().length > 0) {
      if (typedSanitized.length > MAX_CHARS) { setToast({ open: true, msg: "O texto digitado ultrapassa 20.000 caracteres.", sev: "error" }); return; }
      items.push({ kind: "typed", value: typedSanitized });
    }
    for (const f of files) { items.push({ kind: "file", value: f.text, name: f.name }); }
    if (items.length === 0) return;

    const existingPairs = totalItemPairs;
    if (existingPairs + items.length > 10) { setToast({ open: true, msg: "Limite de 10 itens nesta conversa. Limpe o histórico para continuar.", sev: "warning" }); return; }

    const pairIds: string[] = items.map(() => uuid() as string);
    const now = Date.now();
    const newPairs: MessagePair[] = items.map((it, idx) => {
      const user = it.kind === "typed"
        ? { id: uuid(), typedText: it.value, files: [], ts: now }
        : { id: uuid(), typedText: undefined, files: [{ name: items[idx].name || `arquivo_${idx + 1}.txt`, text: it.value, preview: makePreview(it.value) }], ts: now };
      const placeholder = { id: uuid(), loading: true as const, ts: now };
      return { id: pairIds[idx], user, bots: [placeholder] };
    });
    setPairs((prev) => [...prev, ...newPairs]);

    setSending(true);
    try {
      if (items.length === 1) {
        const single = await postClassify(items[0].value);
        const pid = pairIds[0];
        setPairs((prev) => prev.map((p) => {
          if (p.id !== pid) return p;
          const resultBubble: BotBubbleResult = { id: p.bots[0].id, loading: false, ts: Date.now(), result: single };
          return { ...p, bots: [resultBubble] };
        }));
      } else {
        const texts = items.map((i) => i.value);
        const results = await postClassifyBatch(texts);
        for (let i = 0; i < results.length; i++) {
          await new Promise((res) => setTimeout(res, i === 0 ? 0 : 80));
          const r = results[i];
          const pid = pairIds[i];
          setPairs((prev) => prev.map((p) => {
            if (p.id !== pid) return p;
            const nextBots = p.bots.slice();
            nextBots[0] = { id: nextBots[0].id, loading: false, ts: Date.now(), result: r } as BotBubbleResult;
            return { ...p, bots: nextBots };
          }));
        }
      }
      setTyped(""); setFiles([]);
    } catch (e: any) {
      setToast({ open: true, msg: e?.message || "Erro ao classificar", sev: "error" });
      setPairs((prev) => prev.filter((p) => !pairIds.includes(p.id)));
    } finally {
      setSending(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <HeaderBar health={health} onClear={clearChat} />
      {offline && (<Box sx={{ px: 2 }}><Alert severity="error" sx={{ borderRadius: 0 }}>Sem conexão com o servidor no momento.</Alert></Box>)}

      <Container maxWidth="md" sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
        {/* Chat area */}
        <Box onDrop={onDrop} onDragOver={onDragOver} sx={{ flex: 1, overflowY: "auto", py: 2 }}>
          {pairs.length === 0 ? (
            <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 4 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1, color: "text.secondary" }}>
                  Cole ou anexe emails para descobrir se são produtivos ou não
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pressione Enter para classificar. Arraste e solte arquivos .txt ou use o ícone de clipe.
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              {pairs.map((pair) => (
                <Box key={pair.id}>
                  <UserBubble msg={pair.user} />
                  {pair.bots.map((b) => ('loading' in b && b.loading) ? (
                    <ShimmerBubble key={b.id} />
                  ) : (
                    <BotBubble key={b.id} b={b as BotBubbleResult} telemetry={health?.telemetry || "off"} />
                  ))}
                </Box>
              ))}
              <div ref={chatEndRef} />
            </>
          )}
        </Box>

        <Divider />

        <Composer
          files={files}
          typed={typed}
          sending={sending}
          MAX_ATTACH={MAX_ATTACH}
          onAttach={attachFiles}
          onRemoveFile={removeFile}
          onChangeText={setTyped}
          onSend={handleSend}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) { e.preventDefault(); if (!sending) handleSend(); }
          }}
        />
      </Container>

      <Snackbar open={toast.open} autoHideDuration={2400} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.sev} onClose={() => setToast((t) => ({ ...t, open: false }))} variant="filled">{toast.msg}</Alert>
      </Snackbar>

      <style>{`
        .shimmer { position: relative; overflow: hidden; background: #eee; }
        .shimmer:before { content: ''; position: absolute; top: 0; left: -150px; height: 100%; width: 150px; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%); animation: shimmer 1s infinite; }
        @keyframes shimmer { 0% { left: -150px; } 100% { left: 100%; } }
      `}</style>
    </ThemeProvider>
  );
}
