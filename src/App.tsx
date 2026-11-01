import { Navigate, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ComingSoon from './pages/ComingSoon';
import AppLayout from './components/layout/AppLayout';
import ProductList from './pages/products/ProductList';
import ProductCreate from './pages/products/ProductCreate';
import ProductEdit from './pages/products/ProductEdit';
import InventoryList from './pages/inventory/InventoryList';
import LowStock from './pages/inventory/LowStock';
import CustomerList from './pages/customers/CustomerList';
import CustomerCreate from './pages/customers/CustomerCreate';
import CustomerEdit from './pages/customers/CustomerEdit';
import CustomerView from './pages/customers/CustomerView';
import SupplierList from './pages/suppliers/SupplierList';
import SupplierCreate from './pages/suppliers/SupplierCreate';
import SupplierEdit from './pages/suppliers/SupplierEdit';
import SupplierView from './pages/suppliers/SupplierView';
import PurchaseList from './pages/purchases/PurchaseList';
import PurchaseCreate from './pages/purchases/PurchaseCreate';
import PurchaseView from './pages/purchases/PurchaseView';
import SaleList from './pages/sales/SaleList';
import SaleCreate from './pages/sales/SaleCreate';
import SaleEdit from './pages/sales/SaleEdit';
import SaleView from './pages/sales/SaleView';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/create" element={<ProductCreate />} />
        <Route path="/products/:id/edit" element={<ProductEdit />} />
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/inventory/low-stock" element={<LowStock />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/create" element={<CustomerCreate />} />
        <Route path="/customers/:id" element={<CustomerView />} />
        <Route path="/customers/:id/edit" element={<CustomerEdit />} />
        <Route path="/suppliers" element={<SupplierList />} />
        <Route path="/suppliers/create" element={<SupplierCreate />} />
        <Route path="/suppliers/:id" element={<SupplierView />} />
        <Route path="/suppliers/:id/edit" element={<SupplierEdit />} />
        <Route path="/purchases" element={<PurchaseList />} />
        <Route path="/purchases/create" element={<PurchaseCreate />} />
        <Route path="/purchases/:id" element={<PurchaseView />} />
        <Route path="/sales" element={<SaleList />} />
        <Route path="/sales/create" element={<SaleCreate />} />
        <Route path="/sales/:id/edit" element={<SaleEdit />} />
        <Route path="/sales/:id" element={<SaleView />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}
