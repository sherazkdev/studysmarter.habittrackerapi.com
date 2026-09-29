# Study Smarter — requirements & API reference

| File | Purpose |
|------|---------|
| **`study-smarter-api-endpoints.pdf`** | Printable API guide (same theme as [studysmarter.habittrackerapi.com](https://studysmarter.habittrackerapi.com)) |
| **`api-reference.html`** | Source for the PDF (open in browser or regenerate) |
| **`archive/legacy-flutter-gemini-client.dart.txt`** | Original Flutter/Gemini client reference (app now calls this HTTP API) |

Regenerate PDF after editing HTML (requires [Google Chrome](https://www.google.com/chrome/) or Chromium):

```bash
npm run docs:pdf
```

On Linux without Chrome: `npx puppeteer browsers install chrome` then remove `channel: "chrome"` or set `PUPPETEER_EXECUTABLE_PATH`.
