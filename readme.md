# First of all, we thank you for your purchase and willingness of using Tailnews in your projects! #

Tailnews is Tailwind News Template, this template is easy to development.

### How to start with Tailnews? ###

It's simple and easy, just open `docs/index.html` and Tailnews documentation will guide you with detailed step by step information.

### License ###

Tailnews is licensed under Tailnet License and you can find more detailed information about it in https://tailwindtemplate.net/license/

### Free updates and support ###

After purchasing a Tailnews Template copy, you get the right for a lifetime entitlement to download updates for FREE! Need help? For any questions or concerns, reach us out at support@tailwindtemplate.net

### Have idea for next update? ###

If you have any idea for next update or find bugs in template, We is very happy if you give idea or suggestion to support@tailwindtemplate.net

### Meridian Data Lab Signal Engine ###

- Signal Engine config is in `src/js/meridian-config.js` under `signalEngine`.
- Default setup enables mock mode so the Data Lab workflow works without backend setup.
- Mock response source is `src/data/mock-signal-report.json`.
- To switch to live API:
	- Set `useMock` to `false`.
	- Keep `fallbackToMock` as `true` for local safety or set to `false`.
	- Set `reportEndpoint` to your API URL.
	- If required, set `apiKeyHeader` and `apiKey`.
- Data Lab page controls:
	- Send To Signal Engine: sends filters, summary and rows payload.
	- Generate PDF Report: exports live/mock response (or current table rows if no response exists).
	- Mode toggle: switch between Mock and Live directly in the Data Lab UI (saved in browser localStorage).

### Local Signal Engine Stub ###

- Run local API stub:
	- `npm run signal:stub`
- Health check endpoint:
	- `npm run signal:health` or `http://localhost:4177/health`
- Stub report endpoint:
	- `http://localhost:4177/api/signal-engine/report`
- To test live roundtrip from Data Lab, set in `src/js/meridian-config.js`:
	- `useMock: false`
	- `reportEndpoint: "http://localhost:4177/api/signal-engine/report"`
	- Optional: keep `fallbackToMock: true` for fail-safe behavior.