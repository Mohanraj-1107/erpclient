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

The application ships with six switchable themes. **Existing Default Theme** is the original theme and remains the default; its brand colors are reproduced by the default token values. Themes are selected from the topbar (or the login screen), applied immediately through `data-theme` on `<html>`, and persisted in `localStorage` under `erp.theme`.

| Theme | Navbar / Sidebar | Navbar Text / Icons | Page Background | Surface | Primary | Primary Hover | Secondary | Borders | Primary Text | Secondary Text |
|-------|------------------|---------------------|-----------------|---------|---------|---------------|-----------|---------|--------------|----------------|
| Existing Default Theme | `#FFFFFF` | `#0F172A` | `#F8FAFC` | `#FFFFFF` | `#4F46E5` | `#4338CA` | `#F1F5F9` | `#E2E8F0` | `#0F172A` | `#64748B` |
| Teal Professional | `#173F3A` | `#F7FAF9` | `#F3F6F5` | `#FFFFFF` | `#376F68` | `#2F5D57` | `#E8F0ED` | `#DDE5E1` | `#24332F` | `#687873` |
| Navy Corporate | `#1C2D42` | `#F4F6F9` | `#F3F5F8` | `#FFFFFF` | `#3F5F85` | `#36526F` | `#E8EDF4` | `#DCE2E9` | `#202B38` | `#697789` |
| Slate & Indigo | `#252F42` | `#E8ECF4` | `#F4F5F9` | `#FFFFFF` | `#5865A8` | `#4C5891` | `#EAECF7` | `#E0E3EC` | `#252B38` | `#6D7384` |
| Forest Green | `#263F32` | `#F4F8F4` | `#F4F6F2` | `#FFFFFF` | `#4D755B` | `#43664F` | `#E9EFE8` | `#DFE5DC` | `#28342B` | `#707A70` |
| Charcoal & Copper | `#292B2F` | `#F5F3F1` | `#F5F4F2` | `#FFFFFF` | `#A96343` | `#93543A` | `#F1E8E2` | `#E4E0DC` | `#292A2C` | `#74716F` |

Input borders are slightly stronger than surface borders in the five new themes and are defined per theme in `src/lib/themes.ts` and `src/index.css`. The topbar of each new theme is a subtle translucent wash of the navigation color (`backdrop-blur`-ready). Business status colors are intentionally shared by all six themes:

| Status | Background | Text | Border |
|--------|------------|------|--------|
| Warning / Low Stock | `#FEF3C7` | `#92400E` | `#FCD34D` |
| Information / On Order | `#DBEAFE` | `#1E40AF` | `#93C5FD` |
| In Stock | `#DCFCE7` | `#166534` | `#86EFAC` |
| Out of Stock | `#FEE2E2` | `#991B1B` | `#FCA5A5` |

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
