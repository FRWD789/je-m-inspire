import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import PersistLogin from "./components/persistLogin";
import PrivateRoute from "./components/privateRoute";
import OnboardingGuard from "./components/OnboardingGuard";
import EventProvider from "./context/EventContext";
import CookieBar from "./components/CookieBar";

// =========================================
// ✅ COMPOSANTS CRITIQUES (chargés immédiatement)
// =========================================
// Ces pages sont souvent visitées en premier
import Home from "./features/home-about/page/home";
import PublicEvents from "./features/events/page/publicEvents";
import Login from "./features/auth/page/login";

// =========================================
// ✅ LAZY LOADING - AUTH & PUBLIC
// =========================================
const Register = lazy(() => import("./features/auth/page/register"));
const RegisterPro = lazy(() => import("./features/auth/page/registerPro"));
const EventDetail = lazy(() => import("./features/events/page/eventDetail"));
const GoogleCallback = lazy(() => import("./features/auth/page/GoogleCallback"));
const ForgotPasswordPage = lazy(() => import("./features/auth/page/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./features/auth/page/ResetPasswordPage"));
const About = lazy(() => import("./features/home-about/page/About"));
const ProfessionalsPage = lazy(() => import("./features/professional/page/ProfessionalsPage"));
const ProfessionalPublicProfile = lazy(() => import("./features/professional/page/ProProfile"));
const DisableNotificationsPage = lazy(() => import("./features/follow/page/DisableNotificationsPage"));

// =========================================
// ✅ LAZY LOADING - DASHBOARD & USER
// =========================================
const Dashboard = lazy(() => import("./layout/dashboard"));
const UserPage = lazy(() => import("./features/auth/page/user"));
const DashboardHome = lazy(() => import("./features/home-about/page/DashboardHome"));
const MyEventPage = lazy(() => import("./features/events/page/MyEventPage"));
const MyReservationPage = lazy(() => import("./features/reservation/page/MyReservationPage"));
const CalenderEventPage = lazy(() => import("./features/calender/page/CalenderEventPage"));
const MyFollowingPage = lazy(() => import('./features/follow/page/MyFollowingPage'));
const VendorDashboard = lazy(() => import("./features/vendorDashboard/page/VendorDashboard"));
const RemboursementsPage = lazy(() => import("./features/refunds/page/remboursements"));

// =========================================
// ✅ LAZY LOADING - PAIEMENTS & ABONNEMENTS
// =========================================
const PaymentSuccess = lazy(() => import("./features/payment/page/PaymentSuccess"));
const AbonnementSuccess = lazy(() => import("./features/abonnement/page/abonnementSuccess"));
const LinkedAccountSuccess = lazy(() => import("./features/abonnement/page/LinkedAccountSuccess"));

// =========================================
// ✅ LAZY LOADING - ADMIN
// =========================================
const AdminApprovalPage = lazy(() => import("./features/admin/page/userAprrobation"));
const AdminCommissionPage = lazy(() => import("./features/admin/page/UsersComissons"));

// =========================================
// ✅ LOADING FALLBACK
// =========================================
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function App() {
  return (
    <EventProvider>
      <CookieBar/>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<PersistLogin />}>

            {/* ========================================
                PUBLIC ROUTES (accès sans auth)
            ======================================== */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="register-pro" element={<RegisterPro />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              
              {/* Events publics */}
              <Route path="events" element={<PublicEvents />} />
              <Route path="events/:id" element={<EventDetail />} />
              
              {/* Profils & Professionals */}
              <Route path="user/:id" element={<ProfessionalPublicProfile />} />
              <Route path="professionals" element={<ProfessionalsPage />} />
              
              {/* OAuth & Notifications */}
              <Route path="google/callback" element={<GoogleCallback />} />
              <Route path="notifications/disable" element={<DisableNotificationsPage />} />
              
              {/* Pages statiques */}
              <Route path="about" element={<About />} />
              
              {/* Success pages (paiements/abonnements) */}
              <Route path="abonnement/success" element={<AbonnementSuccess />} />
              <Route path="payment/success" element={<PaymentSuccess />} />
            </Route>

            {/* Stripe success (hors Layout) */}
            <Route path="profile/stripe/success" element={<LinkedAccountSuccess />} />

            {/* ========================================
                PROTECTED ROUTES (auth requise)
            ======================================== */}
            <Route element={<PrivateRoute />}>
              <Route element={<OnboardingGuard />}>
                <Route path="/dashboard" element={<Dashboard />}>
                  <Route index element={<DashboardHome />} />
                  <Route path="user" element={<UserPage />} />
                  <Route path="my-events" element={<MyEventPage />} />
                  <Route path="my-reservations" element={<MyReservationPage />} />
                  <Route path="calender" element={<CalenderEventPage />} />
                  <Route path="following" element={<MyFollowingPage />} />
                  <Route path="vendor-earnings" element={<VendorDashboard />} />
                  <Route path="refunds" element={<RemboursementsPage />} />
                  
                  {/* Routes admin */}
                  <Route path="approbations" element={<AdminApprovalPage />} />
                  <Route path="commissions" element={<AdminCommissionPage />} />
                </Route>
              </Route>
            </Route>

          </Route>
        </Routes>
      </Suspense>
    </EventProvider>
  );
}