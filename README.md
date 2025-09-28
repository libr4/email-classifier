# AutoU Email Classifier — Chat Client (Vite + React + TS)

Chat-style client for the FastAPI backend. Paste or attach `.txt` (max 10 per send), get classification and Portuguese reply suggestions. Keeps up to 10 item-pairs per session; clears on tab close.

## Quick start
```bash
npm install
npm run dev
```

Optionally set API base:
```bash
cp .env.example .env
# edit VITE_API_BASE_URL as needed
```

## Folder structure
```
src/
  components/
    BotBubble.tsx
    Composer.tsx
    HeaderBar.tsx
    ShimmerBubble.tsx
    UserBubble.tsx
  hooks/
    useSessionState.ts
  utils/
    api.ts
    text.ts
  types.ts
  theme.ts
  App.tsx
  main.tsx
```

## Notes
- Interleaved UI: input → reply per item (batch sends create one pair per item).
- Attachments: `.txt` only, ≤ 10 per send. Oversized items (> 20,000 chars) are blocked at attach time; no truncation.
- Feedback: 👍/👎 with reason (enum) when telemetry is ready; disabled otherwise.
- Empty state appears when there are no messages.
- Session stored in `sessionStorage` (auto-clears when tab closes).
- Header is fully responsive with centered title; shows `Threshold` and a clear button.
