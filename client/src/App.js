import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

// Public Pages — lazy loaded
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const MembershipPage = lazy(() => import('./pages/public/Membership'));
const MemberDirectoryPage = lazy(() => import('./pages/public/MemberDirectory'));
const EventsPage = lazy(() => import('./pages/public/Events'));
const EventDetailPage = lazy(() => import('./pages/public/EventDetail'));
const GalleryPage = lazy(() => import('./pages/public/Gallery'));
const BusinessDirectoryPage = lazy(() => import('./pages/public/BusinessDirectory'));
const JobsPage = lazy(() => import('./pages/public/Jobs'));
const JobDetailPage = lazy(() => import('./pages/public/JobDetail'));
const ForumPage = lazy(() => import('./pages/public/Forum'));
const NewsPage = lazy(() => import('./pages/public/News'));
const NewsDetailPage = lazy(() => import('./pages/public/NewsDetail'));
const ContactPage = lazy(() => import('./pages/public/Contact'));
const LoginPage = lazy(() => import('./pages/public/Login'));
const RegisterPage = lazy(() => import('./pages/public/Register'));
const DonationPage = lazy(() => import('./pages/public/Donation'));
const ScholarshipPage = lazy(() => import('./pages/public/Scholarship'));
const ProfilePage = lazy(() => import('./pages/public/Profile'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPassword'));
const VerifyEmailPage = lazy(() => import('./pages/public/VerifyEmail'));
const YouthWingPage = lazy(() => import('./pages/public/YouthWing'));
const WomenWingPage = lazy(() => import('./pages/public/WomenWing'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages — lazy loaded
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminMembers = lazy(() => import('./pages/admin/Members'));
const AdminEvents = lazy(() => import('./pages/admin/Events'));
const AdminNews = lazy(() => import('./pages/admin/News'));
const AdminGallery = lazy(() => import('./pages/admin/Gallery'));
const AdminBusinesses = lazy(() => import('./pages/admin/Businesses'));
const AdminJobs = lazy(() => import('./pages/admin/Jobs'));
const AdminScholarships = lazy(() => import('./pages/admin/Scholarships'));
const AdminDonations = lazy(() => import('./pages/admin/Donations'));
const AdminForum = lazy(() => import('./pages/admin/Forum'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminYouthWing = lazy(() => import('./pages/admin/YouthWing'));
const AdminWomenWing = lazy(() => import('./pages/admin/WomenWing'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminActivityLog = lazy(() => import('./pages/admin/ActivityLog'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminTeam             = lazy(() => import('./pages/admin/TeamMembers'));
const AdminMembershipPlans  = lazy(() => import('./pages/admin/MembershipPlans'));

const PageLoader = () => (
  <div className="loading-center"><div className="spinner" /></div>
);

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Something went wrong.</h2>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/membership" element={<MembershipPage />} />
      <Route path="/members" element={<MemberDirectoryPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/business" element={<BusinessDirectoryPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/news/:id" element={<NewsDetailPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/donate" element={<DonationPage />} />
      <Route path="/scholarship" element={<ScholarshipPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/youth" element={<YouthWingPage />} />
      <Route path="/women" element={<WomenWingPage />} />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['SuperAdmin', 'Admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="news" element={<AdminNews />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="businesses" element={<AdminBusinesses />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="scholarships" element={<AdminScholarships />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="forum" element={<AdminForum />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="youth" element={<AdminYouthWing />} />
        <Route path="women" element={<AdminWomenWing />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="activity-log" element={<AdminActivityLog />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="team"               element={<AdminTeam />} />
        <Route path="membership-plans"  element={<AdminMembershipPlans />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <SiteSettingsProvider>
          <AuthProvider>
            <AppRoutes />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
          </AuthProvider>
        </SiteSettingsProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
