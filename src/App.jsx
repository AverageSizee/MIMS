import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Suppliers from './pages/Suppliers';
import Deliveries from './pages/Deliveries';
import Issuances from './pages/Issuances';
import Returns from './pages/Returns';
import Login from './pages/Login';
import Employees from './pages/Employees';
import ForcePasswordChange from './pages/ForcePasswordChange';

function AuthRoute({ children }) {
  const { user, profile } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.requires_password_change) return <Navigate to="/change-password" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isManager, profile } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.requires_password_change) return <Navigate to="/change-password" replace />;
  if (!isManager) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user, profile } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/change-password" element={(!user || !profile?.requires_password_change) ? <Navigate to="/" replace /> : <ForcePasswordChange />} />
      
      <Route path="/" element={<AuthRoute><Layout /></AuthRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="materials" element={<Materials />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="issuances" element={<Issuances />} />
        <Route path="returns" element={<Returns />} />
        <Route path="employees" element={<AdminRoute><Employees /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
