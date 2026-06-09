import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import MembershipPage from './pages/public/Membership';
import MemberDirectoryPage from './pages/public/MemberDirectory';
import EventsPage from './pages/public/Events';
import EventDetailPage from './pages/public/EventDetail';
import GalleryPage from './pages/public/Gallery';
import BusinessDirectoryPage from './pages/public/BusinessDirectory';
import JobsPage from './pages/public/Jobs';
import JobDetailPage from './pages/public/JobDetail';
import ForumPage from './pages/public/Forum';
import NewsPage from './pages/public/News';
import NewsDetailPage from './pages/public/NewsDetail';
import ContactPage from './pages/public/Contact';
import LoginPage from './pages/public/Login';
import RegisterPage from './pages/public/Register';
import DonationPage from './pages/public/Donation';
import ScholarshipPage from './pages/public/Scholarship';
import ProfilePage from './pages/public/Profile';
import ForgotPasswordPage from './pages/public/ForgotPassword';
import YouthWingPage from './pages/public/YouthWing';
import WomenWingPage from './pages/public/WomenWing';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMembers from './pages/admin/Members';
import AdminEvents from './pages/admin/Events';
import AdminNews from './pages/admin/News';
import AdminGallery from './pages/admin/Gallery';
import AdminBusinesses from './pages/admin/Businesses';
import AdminJobs from './pages/admin/Jobs';
import AdminScholarships from './pages/admin/Scholarships';
import AdminDonations from './pages/admin/Donations';
import AdminForum from './pages/admin/Forum';
import AdminReports from './pages/admin/Reports';
import AdminYouthWing from './pages/admin/YouthWing';
import AdminWomenWing from './pages/admin/WomenWing';
import AdminNotifications from './pages/admin/Notifications';
import AdminActivityLog from './pages/admin/ActivityLog';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
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
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </AuthProvider>
    </Router>
  );
}

export default App;
