import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import DemandList from './pages/DemandList';
import DemandDetail from './pages/DemandDetail';
import CreateDemand from './pages/CreateDemand';
import EditDemand from './pages/EditDemand';
import PublicDemands from './pages/PublicDemands';
import Profile from './pages/Profile';
import CommitteeDashboard from './pages/CommitteeDashboard';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route - redirect to dashboard if logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '80px', paddingBottom: '40px' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/demands" element={<DemandList />} />
          <Route path="/demands/:id" element={<DemandDetail />} />
          <Route path="/public" element={<PublicDemands />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-demand" element={<ProtectedRoute><CreateDemand /></ProtectedRoute>} />
          <Route path="/edit-demand/:id" element={<ProtectedRoute><EditDemand /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Committee Routes */}
          <Route 
            path="/committee" 
            element={
              <ProtectedRoute allowedRoles={['committee', 'admin']}>
                <CommitteeDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
