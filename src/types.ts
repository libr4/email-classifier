export type TelemetryState = "ready" | "not_ready" | "off";
export type Label = "Produtivo" | "Improdutivo";
export type ReasonCode = "WRONG_INTENT" | "TONE" | "MISSING_INFO" | "LOW_CONF" | "OTHER";

export interface Healthz {
  status: "ok";
  model_version: string;
  embedding_model: string;
  threshold: number;
  telemetry: TelemetryState;
}

export interface ClassifyOut {
  classification_id: string;
  label: Label;
  score_produtivo: number;
  threshold_used: number;
  suggestion: string | null;
}

export interface FilePreview {
  name: string;
  text: string;
  preview: string;
}

export interface UserMessage {
  id: string;
  typedText?: string;
  files: FilePreview[];
  ts: number;
}

export interface BotBubbleBase {
  id: string;
  ts: number;
}

export interface BotBubbleLoading extends BotBubbleBase {
  loading: true;
}

export interface BotBubbleResult extends BotBubbleBase {
  loading: false;
  result: ClassifyOut;
  feedback?: {
    status: "idle" | "pending" | "sent" | "error";
    helpful?: boolean;
    reason_code?: ReasonCode;
  };
}

export type BotBubble = BotBubbleLoading | BotBubbleResult;

export interface MessagePair {
  id: string;
  user: UserMessage;
  bots: BotBubble[];
}
