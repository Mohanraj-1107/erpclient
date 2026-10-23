# ERP Core Frontend — Development Plan

This file tracks the frontend development plan, current status, and next steps for the React client at `/Users/mohan-23529/myspace/erpclient`. Use this to resume work in any future session.

---

## 1. Project Overview

**ERP Core Frontend** is a React-based admin dashboard for the ERP Core backend.

| Item | Value |
|------|-------|
| **Project Path** | `/Users/mohan-23529/myspace/erpclient/` |
| **Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router v7 |
| **Server State** | TanStack Query v5 |
| **HTTP Client** | Axios (with `withCredentials: true`) |
| **Forms** | React Hook Form + Zod |
| **Icons** | Lucide React |
| **Frontend URL** | `http://localhost:5173` |
| **Backend API URL** | `http://localhost:8080/erp/api` |

---

## 2. Current Status (Completed)

### Completed Work

| Item | Status | Details |
|------|--------|---------|
| Project setup | ✅ Complete | Vite + React 19 + TypeScript + Tailwind CSS v4 |
| Path alias `@/` | ✅ Complete | Maps to `./src` in Vite and TypeScript |
| Axios instance | ✅ Complete | `src/api/axiosInstance.ts` with `withCredentials: true` and 401→refresh interceptor |
| Router | ✅ Complete | `src/App.tsx` with `BrowserRouter`, `/login` route, root redirects to `/login` |
| State provider | ✅ Complete | TanStack Query `QueryClientProvider` in `main.tsx` |
| Tailwind theme | ✅ Complete | `src/index.css` with ERP blue/slate color palette |
| Login page | ✅ Complete | `src/pages/Login.tsx` — clean two-column layout, email/password fields, show/hide toggle, error alerts, loading state, auto-redirect on success |

### Files in `src/`

```
src/
├── main.tsx              # Entry point (BrowserRouter + QueryClientProvider)
├── App.tsx               # Router: /login route
├── index.css             # Tailwind v4 imports + ERP theme
├── types/index.ts        # Shared TypeScript types
├── api/
│   └── axiosInstance.ts  # Axios client with cookies + 401 refresh
└── pages/
    └── Login.tsx         # Login page
```

### Verification
- `npx tsc --noEmit` — No TypeScript errors ✅
- `npm run dev` — Starts on `http://localhost:5173` ✅

---

## 3. Build Sequence (Module by Module)

Build frontend modules in this exact order:

### Phase 1: Foundation (Login — Done)

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1 | Vite + React + TypeScript setup | `package.json`, `vite.config.ts`, `tsconfig.json` | ✅ Done |
| 2 | Tailwind CSS v4 + ERP theme | `src/index.css` | ✅ Done |
| 3 | Axios instance with cookies | `src/api/axiosInstance.ts` | ✅ Done |
| 4 | Router setup | `src/App.tsx`, `src/main.tsx` | ✅ Done |
| 5 | Login page | `src/pages/Login.tsx` | ✅ Done |

### Phase 2: Foundation (Still Needed)

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 6 | Base UI components | `src/components/ui/` (Button, Input, Select, Badge, Card, Table, Label, FormField) | ⬜ Pending |
| 7 | Layout components | `src/components/layout/` (Sidebar, Topbar, Layout) | ⬜ Pending |
| 8 | Auth hook | `src/hooks/useAuth.ts` | ⬜ Pending |
| 9 | Dashboard page | `src/pages/Dashboard.tsx` | ⬜ Pending |

### Phase 3: Core Modules (Build in this order)

| # | Module | Pages | Backend Endpoints |
|---|--------|-------|-------------------|
| 10 | Product | List, Create, Edit | `GET /v1/products`, `POST /v1/products`, `PATCH /v1/products/{id}`, `DELETE /v1/products/{id}` |
| 11 | Inventory | List, Low Stock, Add Stock, Remove Stock | `GET /v1/inventory`, `GET /v1/inventory/{id}`, `POST /v1/inventory/{id}/add`, `POST /v1/inventory/{id}/remove`, `GET /v1/inventory/low-stock` |
| 12 | Customer | List, Create, Edit | `GET /v1/customers`, `POST /v1/customers`, `PATCH /v1/customers/{id}`, `DELETE /v1/customers/{id}` |
| 13 | Supplier | List, Create, Edit | `GET /v1/suppliers`, `POST /v1/suppliers`, `PATCH /v1/suppliers/{id}`, `DELETE /v1/suppliers/{id}` |
| 14 | Purchase | List, Create, Complete, Cancel | `GET /v1/purchases`, `POST /v1/purchases`, `POST /v1/purchases/{id}/complete`, `POST /v1/purchases/{id}/cancel`, `DELETE /v1/purchases/{id}` |
| 15 | Sale | List, Create, Confirm, Cancel | `GET /v1/sales`, `POST /v1/sales`, `POST /v1/sales/{id}/confirm`, `POST /v1/sales/{id}/cancel`, `DELETE /v1/sales/{id}` |

### Phase 4: Polish

| # | Task | Details |
|---|------|---------|
| 16 | Pagination | Add `page`/`size` to all list pages |
| 17 | Search/filter | Add search input to list pages |
| 18 | Toast notifications | Success/error toasts |
| 19 | Confirmation dialogs | For delete actions |
| 20 | Empty states | "No data found" states |
| 21 | Loading skeletons | While data fetches |

---

## 4. Route Structure

| Route | Page Component | Backend Endpoint | Auth Required |
|-------|---------------|-----------------|---------------|
| `/login` | `Login.tsx` | `POST /v1/login` | No |
| `/` | Redirect to `/login` | — | No |
| `/dashboard` | `Dashboard.tsx` | — | Yes |
| `/products` | `products/ProductList.tsx` | `GET /v1/products` | Yes |
| `/products/create` | `products/ProductCreate.tsx` | `POST /v1/products` | Yes |
| `/products/:id/edit` | `products/ProductEdit.tsx` | `PATCH /v1/products/{id}` | Yes |
| `/inventory` | `inventory/InventoryList.tsx` | `GET /v1/inventory` | Yes |
| `/inventory/low-stock` | `inventory/InventoryLowStock.tsx` | `GET /v1/inventory/low-stock` | Yes |
| `/inventory/:id/add` | `inventory/StockAdjust.tsx` | `POST /v1/inventory/{id}/add` | Yes |
| `/inventory/:id/remove` | `inventory/StockAdjust.tsx` | `POST /v1/inventory/{id}/remove` | Yes |
| `/customers` | `customers/CustomerList.tsx` | `GET /v1/customers` | Yes |
| `/customers/create` | `customers/CustomerCreate.tsx` | `POST /v1/customers` | Yes |
| `/suppliers` | `suppliers/SupplierList.tsx` | `GET /v1/suppliers` | Yes |
| `/suppliers/create` | `suppliers/SupplierCreate.tsx` | `POST /v1/suppliers` | Yes |
| `/purchases` | `purchases/PurchaseList.tsx` | `GET /v1/purchases` | Yes |
| `/purchases/create` | `purchases/PurchaseCreate.tsx` | `POST /v1/purchases` | Yes |
| `/purchases/:id/complete` | `purchases/PurchaseComplete.tsx` | `POST /v1/purchases/{id}/complete` | Yes |
| `/purchases/:id/cancel` | `purchases/PurchaseCancel.tsx` | `POST /v1/purchases/{id}/cancel` | Yes |
| `/sales` | `sales/SaleList.tsx` | `GET /v1/sales` | Yes |
| `/sales/create` | `sales/SaleCreate.tsx` | `POST /v1/sales` | Yes |
| `/sales/:id/confirm` | `sales/SaleConfirm.tsx` | `POST /v1/sales/{id}/confirm` | Yes |
| `/sales/:id/cancel` | `sales/SaleCancel.tsx` | `POST /v1/sales/{id}/cancel` | Yes |

---

## 5. Backend API Contract (What Frontend Expects)

### Base URL
```
http://localhost:8080/erp/api
```

### Authentication
- Tokens are **HttpOnly cookies** (`access_token`, `refresh_token`)
- Axios must use `withCredentials: true`
- On 401, call `POST /v1/refresh` to rotate tokens, then retry original request
- On refresh failure, redirect to `/login`

### Error Response Format
```json
{
  "errorMessage": "string",
  "errorCode": 400,
  "path": "/erp/api/v1/...",
  "timestamp": "2026-10-22T10:00:00Z"
}
```

### Common HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Backend CORS Requirement
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

## 6. UI Style Guide (Tailwind CSS v4)

### Color Palette

| Name | Usage | Hex | Tailwind Class |
|------|-------|-----|----------------|
| Primary | Primary buttons, active links | `#2563EB` | `bg-blue-600`, `text-blue-600` |
| Primary Hover | Button hover | `#1D4ED8` | `hover:bg-blue-700` |
| Success | Stock added, confirmations | `#10B981` | `bg-emerald-100`, `text-emerald-700` |
| Warning | Low stock, drafts | `#F59E0B` | `bg-amber-100`, `text-amber-700` |
| Error | Delete, errors, cancelled | `#EF4444` | `bg-red-100`, `text-red-700` |
| Background | Page background | — | `bg-slate-50` |
| Surface | Cards, modals | — | `bg-white` |
| Border | Dividers, inputs | — | `border border-slate-200` |
| Text Primary | Headings | — | `text-slate-900` |
| Text Secondary | Descriptions | — | `text-slate-500` |

### Layout Specs

| Element | Spec |
|---------|------|
| Sidebar | 250px, `bg-slate-900`, fixed |
| Topbar | 64px, `bg-white`, sticky |
| Main Content | `bg-slate-50`, `p-6`, max-width `1200px` |
| Cards | `rounded-xl border border-slate-200 bg-white shadow-sm`, `p-6` |
| Inputs | `w-full px-3 py-2 border border-slate-200 rounded-md` |
| Buttons | `px-4 py-2 text-sm font-medium rounded-md`, blue primary |
| Tables | `text-sm`, `border-b`, hover `hover:bg-slate-50/50` |
| Badges | `px-2.5 py-0.5 text-xs font-semibold rounded-md` |

---

## 7. Component Build Order

Build `src/components/ui/` in this order:

1. `button.tsx` — Primary, secondary, destructive, ghost variants
2. `input.tsx` — Text input
3. `select.tsx` — Dropdown select
4. `badge.tsx` — Status badges
5. `label.tsx` — Form labels
6. `table.tsx` — Table, TableHeader, TableBody, TableRow, TableCell, TableHead
7. `form-field.tsx` — Label + input + error wrapper
8. `card.tsx` — Card, CardHeader, CardTitle, CardContent, CardFooter
9. `index.ts` — Barrel export

Then build `src/components/layout/`:
1. `Sidebar.tsx` — Navigation menu
2. `Topbar.tsx` — Org name, user, logout
3. `Layout.tsx` — Shell with sidebar + topbar + content

---

## 8. Commands

```bash
# Navigate to frontend
cd /Users/mohan-23529/myspace/erpclient

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

## 9. How to Resume Work (Next Session)

1. `cd /Users/mohan-23529/myspace/erpclient`
2. `npm run dev` — verify login page loads at `http://localhost:5173`
3. Build base UI components in `src/components/ui/`
4. Build layout components in `src/components/layout/`
5. Add routes to `src/App.tsx`
6. Build module pages one at a time (Product → Inventory → Customer → Supplier → Purchase → Sale)
7. Run `npx tsc --noEmit` before committing
8. Run `npm run build` to verify production build

---

## 10. Files Currently in Project

```
/Users/mohan-23529/myspace/erpclient/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── postcss.config.js
├── Architecture.md
├── plans.md              (this file)
├── public/
│   └── vite.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/index.ts
    ├── api/axiosInstance.ts
    └── pages/Login.tsx
```

---

*Document version: 1.0*  
*Last updated: 2026-10-23*  
*Scope: Frontend only*
