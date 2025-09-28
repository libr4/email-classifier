import type { ClassifyOut, Healthz, ReasonCode } from "types";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchHealth(): Promise<Healthz> {
  const r = await fetch(`${API_BASE}/healthz`);
  if (!r.ok) throw new Error("Falha ao consultar /healthz");
  return r.json();
}

export async function postClassify(text: string): Promise<ClassifyOut> {
  const r = await fetch(`${API_BASE}/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) {
    const msg = await r.text();
    throw new Error(msg || "Falha ao classificar");
  }
  return r.json();
}

export async function postClassifyBatch(texts: string[]): Promise<ClassifyOut[]> {
  const r = await fetch(`${API_BASE}/classify_batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts }),
  });
  if (!r.ok) {
    const msg = await r.text();
    throw new Error(msg || "Falha ao classificar lote");
  }
  const data = await r.json();
  return data.results as ClassifyOut[];
}

export async function postFeedback(
  classification_id: string,
  helpful: boolean,
  reason_code?: ReasonCode
): Promise<void> {
  const r = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ classification_id, helpful, reason_code: reason_code ?? null }),
  });
  if (!r.ok && r.status !== 503) {
    const msg = await r.text();
    throw new Error(msg || "Falha ao enviar feedback");
  }
}
