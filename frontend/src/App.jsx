import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewComplaint from './pages/NewComplaint';
import Complaints from './pages/Complaints';
import ComplaintDetail from './pages/ComplaintDetail';
import ManageStaff from './pages/ManageStaff';
import ManageUsers from './pages/ManageUsers';
import SLASettings from './pages/SLASettings';
import Profile from './pages/Profile';
import { PageLoader } from './components/shared/Loader';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
          <Route path="/complaints/new" element={<ProtectedRoute roles={['student']}><NewComplaint /></ProtectedRoute>} />
          <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />

          <Route path="/staff" element={<ProtectedRoute roles={['admin']}><ManageStaff /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute roles={['admin']}><SLASettings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
