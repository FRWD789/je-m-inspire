import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import PersistLogin from "./components/persistLogin";
import PrivateRoute from "./components/privateRoute";
import OnboardingGuard from "./components/OnboardingGuard";
import EventProvider from "./context/EventContext";
import CookieBar from "./components/CookieBar";
import Home from "./features/home-about/page/home";
import PublicEvents from "./features/events/page/publicEvents";
import Login from "./features/auth/page/login";
import ProfileFacebookCallback from '@/features/profile/pages/ProfileFacebookCallback'


import Register from "./features/auth/page/register";
import RegisterPro from "./features/auth/page/registerPro";
import EventDetail from"./features/events/page/eventDetail";
import GoogleCallback from"./features/auth/page/GoogleCallback";
import ForgotPasswordPage from"./features/auth/page/ForgotPasswordPage";
import ResetPasswordPage from"./features/auth/page/ResetPasswordPage";
import About from"./features/home-about/page/About";
import ProfessionalsPage from"./features/professional/page/ProfessionalsPage";
import ProfessionalPublicProfile from"./features/professional/page/ProProfile";
import DisableNotificationsPage from"./features/follow/page/DisableNotificationsPage";

import Dashboard from "./layout/dashboard";
import UserPage from "./features/auth/page/user";
import DashboardHome from "./features/home-about/page/DashboardHome";
import MyEventPage from "./features/events/page/MyEventPage";
import MyReservationPage from "./features/reservation/page/MyReservationPage";
import CalenderEventPage from "./features/calender/page/CalenderEventPage";
import MyFollowingPage from './features/follow/page/MyFollowingPage';
import VendorDashboard from "./features/vendorDashboard/page/VendorDashboard";
import RemboursementsPage from "./features/refunds/page/remboursements";

// =========================================
// ✅ LAZY LOADING - PAIEMENTS & ABONNEMENTS
// =========================================
const PaymentSuccess = lazy(() => import("./features/payment/page/PaymentSuccess"));
const AbonnementSuccess = lazy(() => import("./features/abonnement/page/abonnementSuccess"));
const LinkedAccountSuccess = lazy(() => import("./features/abonnement/page/LinkedAccountSuccess"));

import AdminApprovalPage from "./features/admin/page/userAprrobation";
import AdminCommissionPage from "./features/admin/page/UsersComissons";

// =========================================
// ✅ ERROR PAGES
// =========================================
const Forbidden = lazy(() => import("./features/errors/page/Forbidden"));

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
      <CookieBar />
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
              <Route path="/profile/facebook/callback" element={<ProfileFacebookCallback />} />
              
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

            {/* Stripe/PayPal success (hors Layout) */}
            <Route path="profile/stripe/success" element={<LinkedAccountSuccess provider="stripe" />} />
            <Route path="profile/paypal/success" element={<LinkedAccountSuccess provider="paypal" />} />

            {/* Error pages */}
            <Route path="/forbidden" element={<Forbidden />} />

            {/* ========================================
                PROTECTED ROUTES (auth requise)
            ======================================== */}
            <Route
              element={
                <PrivateRoute
                  allowedRoles={["utilisateur", "professionnel", "admin"]}
                />
              }
            >
              <Route
                path="/dashboard"
                element={
                  <OnboardingGuard>
                    <Dashboard />
                  </OnboardingGuard>
                }
              >
                {/* Routes accessibles par tous les utilisateurs authentifiés */}
                <Route index element={<DashboardHome />} />
                <Route path="profile-settings" element={<UserPage />} />
                <Route path="my-events" element={<MyEventPage />} />
                <Route path="my-reservations" element={<MyReservationPage />} />
                <Route path="event-calender" element={<CalenderEventPage />} />
                <Route path="my-following" element={<MyFollowingPage />} />
                <Route path="refunds" element={<RemboursementsPage />} />

                {/* ========================================
                    ADMIN ONLY ROUTES
                ======================================== */}
                <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                  <Route path="approbation" element={<AdminApprovalPage />} />
                  <Route path="commissions" element={<AdminCommissionPage />} />
                </Route>

                {/* ========================================
                    VENDOR ROUTES (Admin + Professionnel)
                ======================================== */}
                <Route
                  element={
                    <PrivateRoute allowedRoles={["admin", "professionnel"]} />
                  }
                >
                  <Route path="vendor" element={<VendorDashboard />} />
                </Route>
              </Route>
            </Route>

          </Route>
        </Routes>
      </Suspense>
    </EventProvider>
  );
}