# ERP Core — Frontend Architecture

This document defines the frontend project structure, layered architecture, coding standards, and build sequence for the React client at `/Users/mohan-23529/myspace/erpclient`. Build the frontend module by module following this guide.

---

## 1. Project Overview

**ERP Core Frontend** is a React-based admin dashboard that consumes the Spring Boot backend API at `http://localhost:8080/erp/api`.

- **Framework:** React 19 with Vite 8
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **State:** TanStack Query (server state) + React state (UI state)
- **HTTP:** Axios with `withCredentials: true` (HttpOnly cookies)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Date:** date-fns

**Base API URL:** `http://localhost:8080/erp/api`  
**Frontend URL:** `http://localhost:5173`

---

## 2. Project Structure

```
erpclient/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── postcss.config.js
├── public/
│   └── vite.svg
└── src/
    ├── main.tsx              # Entry point (BrowserRouter + QueryClientProvider)
    ├── App.tsx               # Route definitions
    ├── index.css             # Tailwind v4 imports + custom theme
    ├── types/index.ts        # Shared TypeScript types
    │
    ├── api/                  # API client layer
    │   ├── axiosInstance.ts  # Axios instance (withCredentials, interceptors)
    │   └── auth.ts           # Auth API functions
    │
    ├── components/           # Reusable UI components
    │   ├── ui/               # Base UI (Button, Input, Select, Badge, Card, Table, Label, FormField)
    │   ├── layout/           # Layout (Sidebar, Topbar, Layout)
│   │   ├── forms/            # Form components (ProductForm, CustomerForm, etc.)
│   │   └── common/           # Common (EmptyState, Pagination, LoadingSpinner, Toast)
│   │
    ├── pages/                # Page components (route-level)
    │   ├── Login.tsx
    │   ├── Dashboard.tsx
    │   ├── products/         # ProductList.tsx, ProductCreate.tsx, ProductEdit.tsx
    │   ├── inventory/        # InventoryList.tsx, InventoryLowStock.tsx, StockAdjust.tsx
    │   ├── customers/        # CustomerList.tsx, CustomerCreate.tsx, CustomerEdit.tsx
    │   ├── suppliers/        # SupplierList.tsx, SupplierCreate.tsx, SupplierEdit.tsx
    │   ├── purchases/        # PurchaseList.tsx, PurchaseCreate.tsx, PurchaseEdit.tsx
    │   └── sales/            # SaleList.tsx, SaleCreate.tsx, SaleEdit.tsx
    │
    ├── hooks/                # Custom React hooks
    │   ├── useAuth.ts        # Authentication state & token refresh
    │   └── useApi.ts         # Generic API wrapper hook
    │
    └── lib/                  # Utility functions
        └── utils.ts          # cn(), date helpers, formatting
```

---

## 3. Layered Architecture (Frontend)

```
┌─────────────────────────────────────────┐
│  Layer 4: Pages (Route Components)      │
│  src/pages/*                            │
│  └── Full-page views (Login, List, etc) │
├─────────────────────────────────────────┤
│  Layer 3: Feature Components            │
│  src/components/forms/*                 │
│  src/components/layout/*                │
├─────────────────────────────────────────┤
│  Layer 2: Base UI Components            │
│  src/components/ui/*                    │
│  └── Button, Input, Table, Badge, etc.  │
├─────────────────────────────────────────┤
│  Layer 1: API & Logic Layer             │
│  src/api/*            ← Axios functions │
│  src/hooks/*          ← Custom hooks    │
│  src/lib/*            ← Utilities       │
└─────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Directory | Responsibility |
|-------|-----------|---------------|
| Pages | `src/pages/*` | Route-level views, data fetching with TanStack Query, layout composition |
| Feature Components | `src/components/forms/`, `src/components/layout/` | Module-specific forms and layout shells |
| Base UI | `src/components/ui/` | Primitive, reusable, unstyled logic components (Button, Input, Table) |
| API | `src/api/*` | Axios instance, endpoint functions, request/response types |
| Hooks | `src/hooks/*` | Auth state, data fetching wrappers, form logic |
| Lib | `src/lib/*` | Pure utility functions (className merging, date formatting) |

---

## 4. Coding Standards

### 4.1 Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ProductList`, `LoginForm` |
| Pages | PascalCase | `ProductList.tsx`, `CustomerCreate.tsx` |
| Page folders | lowercase | `src/pages/products/ProductList.tsx` |
| API functions | camelCase in service object | `productApi.list()`, `productApi.create()` |
| TypeScript types | PascalCase | `CreateProductRequest`, `ProductResponse` |
| Utility functions | camelCase | `cn()`, `formatDate()` |
| CSS classes | Tailwind utilities only | No custom CSS files |

### 4.2 Component Structure

All components are **functional components** using React hooks. No class components.

```tsx
// Example: Simple component pattern
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MyComponent({ onSave }: { onSave: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Component</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField label="Name">
          <Input placeholder="Enter name" />
        </FormField>
        <Button variant="primary" onClick={onSave}>Save</Button>
      </CardContent>
    </Card>
  );
}
```

### 4.3 API Function Pattern

All API calls go through `src/api/axiosInstance.ts` which includes `withCredentials: true` for HttpOnly cookie handling and a 401 → refresh token interceptor.

```ts
// src/api/products.ts
import api from '@/api/axiosInstance';

export interface Product {
  productId: number;
  productName: string;
  // ...
}

export const productApi = {
  list: (page = 0, size = 20) => api.get(`/products?page=${page}&size=${size}`),
  get: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.patch(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};
```

### 4.4 Form Pattern

Use **React Hook Form + Zod** for all forms:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  productName: z.string().min(1, 'Name is required'),
  purchasePrice: z.number().positive('Price must be positive'),
});

export function ProductCreate() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { productName: '', purchasePrice: 0 },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await productApi.create(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField label="Product Name">
        <Input {...form.register('productName')} />
        {form.formState.errors.productName && (
          <span className="text-xs text-destructive">{form.formState.errors.productName.message}</span>
        )}
      </FormField>
      <Button type="submit">Save</Button>
    </form>
  );
}
```

### 4.5 Path Alias

`@/` maps to `./src` in both Vite (`vite.config.ts`) and TypeScript (`tsconfig.app.json`).

```ts
import api from '@/api/axiosInstance';
import { Button } from '@/components/ui/button';
```

---

## 5. UI Style Guide

### 5.1 Color Palette

| Name | Usage | Hex | Tailwind Class |
|------|-------|-----|----------------|
| **Primary** | Primary buttons, active links, headers | `#2563EB` | `bg-blue-600`, `text-blue-600` |
| **Primary Hover** | Button hover states | `#1D4ED8` | `hover:bg-blue-700` |
| **Secondary** | Secondary actions | `#64748B` | `text-slate-500` |
| **Success** | Stock added, confirmations | `#10B981` | `text-emerald-600`, `bg-emerald-100` |
| **Warning** | Low stock, drafts | `#F59E0B` | `text-amber-600`, `bg-amber-100` |
| **Error** | Delete, errors, cancelled | `#EF4444` | `text-red-600`, `bg-red-100` |
| **Info** | Information banners | `#3B82F6` | `text-blue-500` |

### 5.2 Neutral Colors

| Name | Usage | Tailwind Class |
|------|-------|----------------|
| Background | Page background | `bg-slate-50` |
| Surface | Cards, modals | `bg-white` |
| Border | Dividers, inputs | `border border-slate-200` |
| Text Primary | Headings, labels | `text-slate-900` |
| Text Secondary | Descriptions | `text-slate-500` |
| Text Muted | Placeholders | `text-slate-400` |

### 5.3 Layout Standards

| Element | Specification |
|---------|---------------|
| **Sidebar** | 250px wide, `bg-slate-900`, white text, fixed height |
| **Topbar** | 64px high, `bg-white`, `border-b border-slate-200`, sticky |
| **Main Content** | `bg-slate-50`, padding `p-6`, max-width `1200px` centered |
| **Cards** | `rounded-xl border border-slate-200 bg-white shadow-sm`, padding `p-6` |
| **Inputs** | `w-full px-3 py-2 border border-slate-200 rounded-md` |
| **Buttons** | `px-4 py-2 text-sm font-medium rounded-md`, blue primary |
| **Tables** | `text-sm`, `border-b`, hover row `hover:bg-slate-50/50` |
| **Badges** | `px-2.5 py-0.5 text-xs font-semibold rounded-md` |

### 5.4 Component Library (Build Order)

Build these base UI components first in `src/components/ui/`:

1. `button.tsx` — Primary, secondary, destructive, ghost variants
2. `input.tsx` — Text input with label support
3. `select.tsx` — Dropdown select
4. `badge.tsx` — Status badges (success, warning, destructive)
5. `label.tsx` — Form field labels
6. `table.tsx` — Table, TableHeader, TableBody, TableRow, TableCell, TableHead
7. `form-field.tsx` — Label + input + error text wrapper
8. `card.tsx` — Card, CardHeader, CardTitle, CardContent, CardFooter
9. `index.ts` — Barrel export for all UI components

---

## 6. Build Sequence (Module by Module)

Build frontend modules in this order:

### Phase 1: Foundation
- [ ] Vite + React + Tailwind setup
- [ ] Axios instance with `withCredentials` + 401 refresh interceptor
- [ ] Base UI components (`src/components/ui/`)
- [ ] Layout components (`src/components/layout/`: Sidebar, Topbar, Layout)
- [ ] Login page (`src/pages/Login.tsx`)
- [ ] Auth hook (`src/hooks/useAuth.ts`)

### Phase 2: Core Modules
- [ ] Dashboard page (`src/pages/Dashboard.tsx`)
- [ ] Product module: List → Create → Edit → Delete
- [ ] Inventory module: List → Add Stock → Remove Stock → Low Stock
- [ ] Customer module: List → Create → Edit → Delete
- [ ] Supplier module: List → Create → Edit → Delete
- [ ] Purchase module: List → Create → Complete → Cancel
- [ ] Sale module: List → Create → Confirm → Cancel

### Phase 3: Polish
- [ ] Pagination on all list endpoints
- [ ] Search/filter on list pages
- [ ] Toast notifications
- [ ] Confirmation dialogs for delete
- [ ] Empty states
- [ ] Loading skeletons

---

## 7. Route Structure

| Route | Page | Backend Endpoint |
|-------|------|-----------------|
| `/login` | Login | `POST /v1/login` |
| `/` | Redirect to `/login` | — |
| `/dashboard` | Dashboard | — |
| `/products` | Product List | `GET /v1/products` |
| `/products/create` | Create Product | `POST /v1/products` |
| `/products/:id/edit` | Edit Product | `PATCH /v1/products/{id}` |
| `/inventory` | Inventory List | `GET /v1/inventory` |
| `/inventory/low-stock` | Low Stock Alert | `GET /v1/inventory/low-stock` |
| `/inventory/:id/add` | Add Stock | `POST /v1/inventory/{id}/add` |
| `/inventory/:id/remove` | Remove Stock | `POST /v1/inventory/{id}/remove` |
| `/customers` | Customer List | `GET /v1/customers` |
| `/customers/create` | Create Customer | `POST /v1/customers` |
| `/suppliers` | Supplier List | `GET /v1/suppliers` |
| `/suppliers/create` | Create Supplier | `POST /v1/suppliers` |
| `/purchases` | Purchase List | `GET /v1/purchases` |
| `/purchases/create` | Create Purchase | `POST /v1/purchases` |
| `/purchases/:id/complete` | Complete Purchase | `POST /v1/purchases/{id}/complete` |
| `/sales` | Sale List | `GET /v1/sales` |
| `/sales/create` | Create Sale | `POST /v1/sales` |
| `/sales/:id/confirm` | Confirm Sale | `POST /v1/sales/{id}/confirm` |

---

## 8. Backend CORS Requirement

The backend must allow the frontend origin. Ensure `CorsConfig` in the Spring Boot app includes:

```java
registry.addMapping("/erp/api/**")
    .allowedOrigins("http://localhost:5173")
    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
    .allowedHeaders("*")
    .allowCredentials(true);
```

And the `JwtFilter` must allow `OPTIONS` preflight requests through without JWT validation.

---

## 9. Commands

```bash
# Start frontend dev server
cd /Users/mohan-23529/myspace/erpclient
npm run dev          # http://localhost:5173

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

*Document version: 1.0*  
*Last updated: 2026-10-23*  
*Scope: Frontend only*
