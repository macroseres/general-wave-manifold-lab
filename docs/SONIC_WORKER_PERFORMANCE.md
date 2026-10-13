# Sonic surface worker integration

The sonic extraction now runs in the existing dedicated Web Worker, not during React rendering. Both sheets reuse the same minus mesh, with Y reflection for the plus sheet, preserving the existing geometry algorithm. Worker-owned LRU cache stores mesh buffers and copies on transfer. The main thread ignores stale response IDs and clears geometry on parameter-key mismatch; visibility changes do not request new calculations. Audit scripts remain opt-in.

## Validation
Run `npm run check`, then verify in the browser: initial load, rapid parameter changes, toggling S-/S+, switching back to previously computed parameters, and worker errors. Compare geometry against the prior release. Worker calculations are still CPU-intensive and do not inherently shorten extraction time; they avoid blocking UI.
