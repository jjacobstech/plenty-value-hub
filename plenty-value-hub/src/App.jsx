import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Public pages
import Home from '@/pages/Home';
import Marketplace from '@/pages/Marketplace';
import ProductDetail from '@/pages/ProductDetail';
import Reviews from '@/pages/Reviews';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import ForPartners from '@/pages/ForPartners';
import AffiliateRedirect from '@/pages/AffiliateRedirect';

// Affiliate pages
import AffiliateDashboard from '@/pages/affiliate/AffiliateDashboard';
import AffiliateProducts from '@/pages/affiliate/AffiliateProducts';
import AffiliateLinks from '@/pages/affiliate/AffiliateLinks';
import AffiliatePerformance from '@/pages/affiliate/AffiliatePerformance';
import AffiliateEarnings from '@/pages/affiliate/AffiliateEarnings';
import AffiliateProfile from '@/pages/affiliate/AffiliateProfile';

// Vendor pages
import VendorDashboard from '@/pages/vendor/VendorDashboard';
import VendorProducts from '@/pages/vendor/VendorProducts';
import VendorAnalytics from '@/pages/vendor/VendorAnalytics';
import VendorEarnings from '@/pages/vendor/VendorEarnings';
import VendorProfile from '@/pages/vendor/VendorProfile';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public pages with navbar/footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/for-partners" element={<ForPartners />} />
      </Route>

      {/* Affiliate tracking redirect */}
      <Route path="/ref/:link_code" element={<AffiliateRedirect />} />

      {/* Protected: Affiliate Dashboard */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<DashboardLayout role="affiliate" />}>
          <Route path="/affiliate" element={<AffiliateDashboard />} />
          <Route path="/affiliate/products" element={<AffiliateProducts />} />
          <Route path="/affiliate/links" element={<AffiliateLinks />} />
          <Route path="/affiliate/performance" element={<AffiliatePerformance />} />
          <Route path="/affiliate/earnings" element={<AffiliateEarnings />} />
          <Route path="/affiliate/profile" element={<AffiliateProfile />} />
        </Route>
      </Route>

      {/* Protected: Vendor Dashboard */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<DashboardLayout role="vendor" />}>
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<VendorProducts />} />
          <Route path="/vendor/analytics" element={<VendorAnalytics />} />
          <Route path="/vendor/earnings" element={<VendorEarnings />} />
          <Route path="/vendor/profile" element={<VendorProfile />} />
        </Route>
      </Route>

      {/* Protected: Admin Dashboard */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<DashboardLayout role="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App