import { Navigate, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Package } from 'lucide-react';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Coming soon</h2>
                <p className="text-slate-500 mb-6">
                  This module is being built in the next development phase.
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
