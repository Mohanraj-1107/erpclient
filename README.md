# ERP Core Frontend

ERP Core Frontend is a React-based admin dashboard for the ERP Core backend (Spring Boot). It provides organization-centric management of products, inventory, customers, suppliers, purchases, and sales.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Server State | TanStack Query v5 |
| HTTP Client | Axios (with `withCredentials: true`) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Dates | date-fns |
| Font | Inter (Google Fonts) |

**Frontend URL:** `http://localhost:5173`  
**Backend API URL:** `http://localhost:8080/erp/api`

---

## Project Structure

```
erpclient/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── postcss.config.js
├── README.md
├── plan.md
├── Architecture.md
├── public/
│   └── vite.svg
├── dist/
└── src/
    ├── main.tsx              # Entry point (BrowserRouter + QueryClientProvider)
    ├── App.tsx               # Route definitions
    ├── index.css             # Tailwind v4 imports + ERP theme
    ├── types/index.ts        # Shared TypeScript types
    │
    ├── api/                  # API client layer
    │   └── axiosInstance.ts  # Axios instance (withCredentials, 401→refresh interceptor)
    │
    ├── components/           # Reusable UI components
    │   ├── ui/               # Base UI (Button, Input, Select, Badge, Card, Table, Label, FormField)
    │   ├── layout/           # Layout (Sidebar, Topbar, Layout)
    │   ├── forms/            # Form components
    │   └── common/           # Common (EmptyState, Pagination, LoadingSpinner, Toast)
    │
    ├── pages/                # Page components (route-level)
    │   ├── Login.tsx         # Login page
    │   └── Dashboard.tsx     # Dashboard page
    │   ├── products/         # ProductList.tsx, ProductCreate.tsx, ProductEdit.tsx
    │   ├── inventory/        # InventoryList.tsx, InventoryLowStock.tsx, StockAdjust.tsx
    │   ├── customers/        # CustomerList.tsx, CustomerCreate.tsx, CustomerEdit.tsx
    │   ├── suppliers/        # SupplierList.tsx, SupplierCreate.tsx, SupplierEdit.tsx
    │   ├── purchases/        # PurchaseList.tsx, PurchaseCreate.tsx, PurchaseComplete.tsx, PurchaseCancel.tsx
    │   └── sales/            # SaleList.tsx, SaleCreate.tsx, SaleConfirm.tsx, SaleCancel.tsx
    │
    ├── hooks/                # Custom React hooks
    │   ├── useAuth.ts        # Authentication state & token refresh
    │   └── useApi.ts         # Generic API wrapper hook
    │
    └── lib/                  # Utility functions
        └── utils.ts          # cn(), date helpers, formatting
```

`@/` maps to `./src` in both Vite (`vite.config.ts`) and TypeScript (`tsconfig.app.json`).

---

## Route Structure

| Route | Page | Auth Required | Backend Endpoint |
|-------|------|---------------|------------------|
| `/` | Redirect to `/login` | No | — |
| `/login` | Login | No | `POST /v1/login` |
| `/dashboard` | Dashboard | Yes | — |
| `/products` | Product List | Yes | `GET /v1/products` |
| `/products/create` | Create Product | Yes | `POST /v1/products` |
| `/products/:id/edit` | Edit Product | Yes | `PATCH /v1/products/{id}` |
| `/inventory` | Inventory List | Yes | `GET /v1/inventory` |
| `/inventory/low-stock` | Low Stock Alert | Yes | `GET /v1/inventory/low-stock` |
| `/inventory/:id/add` | Add Stock | Yes | `POST /v1/inventory/{id}/add` |
| `/inventory/:id/remove` | Remove Stock | Yes | `POST /v1/inventory/{id}/remove` |
| `/customers` | Customer List | Yes | `GET /v1/customers` |
| `/customers/create` | Create Customer | Yes | `POST /v1/customers` |
| `/suppliers` | Supplier List | Yes | `GET /v1/suppliers` |
| `/suppliers/create` | Create Supplier | Yes | `POST /v1/suppliers` |
| `/purchases` | Purchase List | Yes | `GET /v1/purchases` |
| `/purchases/create` | Create Purchase | Yes | `POST /v1/purchases` |
| `/purchases/:id/complete` | Complete Purchase | Yes | `POST /v1/purchases/{id}/complete` |
| `/purchases/:id/cancel` | Cancel Purchase | Yes | `POST /v1/purchases/{id}/cancel` |
| `/sales` | Sale List | Yes | `GET /v1/sales` |
| `/sales/create` | Create Sale | Yes | `POST /v1/sales` |
| `/sales/:id/confirm` | Confirm Sale | Yes | `POST /v1/sales/{id}/confirm` |
| `/sales/:id/cancel` | Cancel Sale | Yes | `POST /v1/sales/{id}/cancel` |

Module pages under `products/`, `inventory/`, `customers/`, `suppliers/`, `purchases/`, and `sales/` are pending implementation (see Development Plan below).

---

## Getting Started

```bash
# Navigate to the frontend project
cd /Users/mohan-23529/myspace/erpclient

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Lint
npm run lint
```

---

## Authentication

- Tokens are **HttpOnly cookies** (`access_token`, `refresh_token`).
- Axios uses `withCredentials: true` for cookie handling.
- On `401`, the interceptor calls `POST /v1/refresh` to rotate tokens, then retries the original request.
- On refresh failure, redirects to `/login`.

---

## Backend CORS Requirement

The Spring Boot backend must allow the frontend origin:

```java
registry.addMapping("/erp/api/**")
    .allowedOrigins("http://localhost:5173")
    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    .allowedHeaders("*")
    .allowCredentials(true);
```

The `JwtFilter` must allow `OPTIONS` preflight requests without JWT validation.

---

## UI Style Guide (Tailwind CSS v4)

| Element | Specification |
|---------|---------------|
| Sidebar | 250px, `bg-blue-600`, fixed, vertical nav |
| Topbar | 64px, `bg-white`, sticky |
| Main Content | `bg-slate-50`, `p-6`, max-width `1200px` |
| Cards | `rounded-xl border border-slate-200 bg-white shadow-sm`, `p-6` |
| Inputs | `w-full px-3 py-2 border border-slate-200 rounded-md` |
| Buttons | `px-4 py-2 text-sm font-medium rounded-md`, blue primary |
| Tables | `text-sm`, `border-b`, hover `hover:bg-slate-50/50` |
| Badges | `px-2.5 py-0.5 text-xs font-semibold rounded-md` |

### Color Palette

| Name | Hex | Tailwind Class |
|------|-----|----------------|
| Primary | `#2563EB` | `bg-blue-600`, `text-blue-600` |
| Success | `#10B981` | `bg-emerald-100`, `text-emerald-700` |
| Warning | `#F59E0B` | `bg-amber-100`, `text-amber-700` |
| Error | `#EF4444` | `bg-red-100`, `text-red-700` |
| Background | — | `bg-slate-50` |
| Surface | — | `bg-white` |
| Text Primary | — | `text-slate-900` |
| Text Secondary | — | `text-slate-500` |

### Application Themes

The application ships with six switchable themes. **Existing Default Theme** is the original theme and remains the default; its brand colors are reproduced by the default token values and are never modified. Themes are selected from the topbar (or the login screen), applied immediately through `data-theme` on `<html>`, and persisted in `localStorage` under `erp.theme`.

| Theme | Navbar / Sidebar | Navbar Text / Icons | Navbar Border | Page Background | Surface | Primary | Primary Hover | Secondary Bg / Text / Border | Border / Divider | Input Border | Primary Text | Secondary Text |
|-------|------------------|---------------------|---------------|-----------------|---------|---------|---------------|-------------------------------|------------------|--------------|--------------|----------------|
| Existing Default Theme | `#FFFFFF` | `#0F172A` | — | `#F8FAFC` | `#FFFFFF` | `#4F46E5` | `#4338CA` | `#F1F5F9` / `#334155` / — | `#E2E8F0` | `#E2E8F0` | `#0F172A` | `#64748B` |
| Harbor Teal | `#EAF4F3` | `#0F3D3A` | `#CBE1DE` | `#F7F9F9` | `#FFFFFF` | `#0E7C72` | `#0B655D` | `#FFFFFF` / `#0F3D3A` / `#BFD9D5` | `#E2E9E8` / `#EDF2F1` | `#CBD5D4` | `#1C2B2A` | `#5B6E6D` |
| Meridian Blue | `#EEF3FA` | `#1F3657` | `#D3DFEE` | `#F6F8FB` | `#FFFFFF` | `#2F5EA8` | `#27508F` | `#FFFFFF` / `#1F3657` / `#C6D4E6` | `#E3E9F1` / `#EEF2F7` | `#CCD6E4` | `#1C2838` | `#5D6B80` |
| Sage Field | `#EDF2EC` | `#27362A` | `#D6E0D4` | `#F8FAF7` | `#FFFFFF` | `#4A7C59` | `#3C6749` | `#FFFFFF` / `#2F4634` / `#CBDAC9` | `#E4EAE2` / `#EFF3EE` | `#CDD8CB` | `#26332A` | `#5F6E62` |
| Graphite Indigo | `#F2F3F8` | `#2A2E3C` | `#DCDEE9` | `#FAFAFC` | `#FFFFFF` | `#4A56B8` | `#3E49A0` | `#FFFFFF` / `#343A4D` / `#D2D5E0` | `#E6E7EE` / `#EFF0F5` | `#D3D6E0` | `#23262F` | `#62677A` |
| Warehouse Stone | `#F1EFEB` | `#322C25` | `#DFDAD2` | `#FAF9F7` | `#FFFFFF` | `#A15A33` | `#874A29` | `#FFFFFF` / `#3A332B` / `#DBD4CA` | `#E8E4DD` / `#F0EDE8` | `#D6CFC5` | `#2B251E` | `#6B6358` |

Each new theme also defines an active-nav tint (`#D5EAE7` / `#DCE8F8` / `#DCE9DB` / `#E4E6F6` / `#EDE2D7`), a hover background, a selected-table-row tint, an input focus ring at 25% primary opacity, and per-theme success/error/info toast surfaces. All five use light chrome navigation (tinted navbar with dark text) rather than dark sidebars.

Business status colors are intentionally identical across the five new themes; the protected default theme keeps its original (legacy) status palette:

| Status | Background | Text | Border |
|--------|------------|------|--------|
| In Stock | `#ECFAF0` | `#11693D` | `#BBE6CB` |
| Warning / Low Stock | `#FEF6E7` | `#8A5A08` | `#F4DEAC` |
| Out of Stock | `#FDF1F0` | `#A3302A` | `#F2C9C5` |
| On Order / Information | `#EDF4FC` | `#1B5894` | `#C4DCF3` |

Theme configuration lives in `src/lib/themes.ts`, the provider/selector in `src/components/theme/`, and the CSS custom properties in `src/index.css`. Shared UI components consume semantic tokens such as `bg-theme-primary`, `border-theme-border`, and `text-theme-text-muted`. The active theme also re-maps the existing Tailwind `indigo` (brand) and `slate` (neutral) scales, so older page-level utility classes inherit the theme automatically.

---

## Development Plan

See `plan.md` for the full development plan and task tracker.

### Completed
- Project setup (Vite + React 19 + TypeScript + Tailwind CSS v4)
- Path alias `@/` → `./src`
- Axios instance with cookies + 401 refresh interceptor
- Router (`/login` route, root redirects to `/login`)
- TanStack Query `QueryClientProvider`
- Tailwind theme + ERP color palette
- Login page (centered branding, org email/password, show/hide toggle, error alerts, loading state)
- Dashboard page (blue sidebar nav, white content area, stats cards, quick actions, avatar dropdown with org info + signout)

### In Progress / Pending
- Base UI components (`src/components/ui/`)
- Layout components (`src/components/layout/`)
- Auth hook (`src/hooks/useAuth.ts`)
- Core modules: Product → Inventory → Customer → Supplier → Purchase → Sale
- Polish: pagination, search/filter, toasts, confirmation dialogs, empty states, loading skeletons

---

## Commands Reference

```bash
# Start dev server
npm run dev          # http://localhost:5173

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

*Scope: Frontend only*  
*Last updated: 2026-10-24*
