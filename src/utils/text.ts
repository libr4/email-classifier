export const MAX_ATTACH = 10;
export const MAX_CHARS = 20000;
export const SCORE_DECIMALS = 3;

export const uuid = () => crypto.randomUUID();

export const sanitizeText = (input: string) => {
  let t = input.replace(/\r\n?/g, "\n");
  t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");
  return t;
};

export const formatScore = (v: number) => v.toFixed(SCORE_DECIMALS);

export const isTxtFile = (f: File) =>
  f.type === "text/plain" || f.name.toLowerCase().endsWith(".txt");

export const readFileSafe = async (file: File): Promise<string> => {
  const text = await file.text();
  return text;
};

export const makePreview = (t: string) => (t.length > 120 ? t.slice(0, 120) + "…" : t);

// Dev self-tests (optional)
export function runDevSelfTests() {
  try {
    console.assert(sanitizeText("a\r\nb\r") === "a\nb\n", "CR/LF normalization");
    console.assert(!sanitizeText("\x00a").includes("\x00"), "NUL removed");
    console.assert(formatScore(0.123456) === "0.123", "formatScore rounding");
    console.log("DEV self-tests passed");
  } catch (e) {
    console.warn("DEV self-tests failed", e);
  }
}
