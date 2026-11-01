# AGENTS.md

ERP Core Frontend — React 19 + Vite 8 + TypeScript + Tailwind CSS v4 admin dashboard for a Spring Boot backend. Frontend only; no backend code lives here.

## Commands

- `npm run dev` — dev server at http://localhost:5173
- `npx tsc --noEmit` — typecheck (fastest verification); `npm run build` also typechecks via `tsc -b` before `vite build`
- `npm run lint` — ESLint (flat config, ignores `dist`)
- There are **no tests** in this repo. Verification = typecheck + lint.

## Backend dependency (no test mocks)

- ALL API calls hit the running Spring Boot backend at `http://localhost:8080/erp/api`. Without it, every page errors.
- Backend must send CORS headers for `http://localhost:5173` with `allowCredentials(true)` and let OPTIONS preflight through its JWT filter. There is no Vite dev proxy.
- Override the API base with `VITE_API_BASE` env var (e.g. `.env.local`, gitignored via `*.local`).

## Auth flow (touch with care)

- Auth is HttpOnly cookies, so `withCredentials: true` is required everywhere.
- `src/api/axiosInstance.ts`: on 401 it calls `POST /v1/refresh` (single-flight shared promise), then retries the original request; on refresh failure it clears stored org id and hard-redirects to `/login`. Endpoints matching `/v1/login|refresh|logout` are excluded from this interceptor.
- All real endpoints are prefixed `/v1/...`. Org id is persisted via `src/lib/authStorage.ts`.

## Patterns that differ from the docs

- `README.md` / `Architecture.md` / `plan.md` claim React Hook Form + Zod and date-fns. **These are not in package.json.** Forms are plain controlled `useState` with hand-rolled validation (see `src/components/forms/ProductForm.tsx`). Don't invent RHF/Zod usage.
- Docs also reference `public/vite.svg`, `postcss.config.js`, `useAuth.ts`, and `useApi.ts` — none exist. Trust the code over the docs.
- Tailwind v4 runs through `@tailwindcss/vite` (CSS-first theme in `src/index.css`); no `tailwind.config.js`.

## Structure & conventions

- Entry: `src/main.tsx` (QueryClientProvider + ThemeProvider + ToastProvider + BrowserRouter); routes all in `src/App.tsx`. Unimplemented routes fall through to `ComingSoon`; the **sales module is not built yet**.
- Layers: `src/pages/*` (route-level, TanStack Query) → feature components (`src/components/<module>/`, `forms/`, `layout/`, `theme/`, `common/`) → primitives (`src/components/ui/`).
- API functions live as service objects (`productApi`, `supplierApi`, ...) in `src/api/<module>.ts`, typed from `src/types/<module>.ts` (`index.ts` re-exports).
- Path alias `@/` → `./src` (set in both `vite.config.ts` and `tsconfig.app.json`).
- Pagination is `PageResponse<T>` (`content`, `last`, ...); some lookups (e.g. `productApi` list-all) page through up to size=200 repeatedly.
- Purchase create payload shape: `{ supplierId, items: [{ productId, quantity, unitPrice, taxRate, discountRate }] }`.
