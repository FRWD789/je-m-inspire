import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./features/auth/page/login";
import Register from "./features/auth/page/register";
import RegisterPro from "./features/auth/page/registerPro";
import Home from "./features/home-about/page/home";
import UserPage from "./features/auth/page/user";
import Dashboard from "./layout/dashboard";
import PublicEvents from "./features/events/page/publicEvents";
import EventDetail from "./features/events/page/eventDetail";
import AdminApprovalPage from "./features/admin/page/userAprrobation";
import PaymentSuccess from "./features/payment/page/PaymentSuccess";
import PrivateRoute from "./components/privateRoute";
import PersistLogin from "./components/persistLogin";
import DashboardHome from "./features/home-about/page/DashboardHome";
import OnboardingGuard from "./components/OnboardingGuard";
import EventProvider from "./context/EventContext";
import MyEventPage from "./features/events/page/MyEventPage";
import MyReservationPage from "./features/reservation/page/MyReservationPage";
import CalenderEventPage from "./features/calender/page/CalenderEventPage";
import ProfessionalPublicProfile from "./features/professional/page/ProProfile";
import AdminCommissionPage from "./features/admin/page/UsersComissons";
import AbonnementSuccess from "./features/abonnement/page/abonnementSuccess";
import GoogleCallback from "./features/auth/page/GoogleCallback";
import VendorDashboard from "./features/vendorDashboard/page/VendorDashboard";
import MyFollowingPage from './features/follow/page/MyFollowingPage';
import DisableNotificationsPage from "./features/follow/page/DisableNotificationsPage";
import LinkedAccountSuccess from "./features/abonnement/page/LinkedAccountSuccess";
import About from "./features/home-about/page/About";
import CookieBar from "./components/CookieBar";
import RemboursementsPage from "./features/refunds/page/remboursements";
import ProfessionalsPage from "./features/professional/page/ProfessionalsPage";
import ForgotPasswordPage from "./features/auth/page/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/page/ResetPasswordPage";

export default function App() {
  return (
    <EventProvider>
      <CookieBar/>
      <Routes>

        <Route element={<PersistLogin />}>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="register-pro" element={<RegisterPro />} />
            <Route path="events" element={<PublicEvents />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="google/callback" element={<GoogleCallback />} />
            <Route path="abonnement/success" element={<AbonnementSuccess />} />
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route path="user/:id" element={<ProfessionalPublicProfile/>}/>
            <Route path="notifications/disable" element={<DisableNotificationsPage />} />
            <Route path="about" element={<About />} />
            <Route path="professionals" element={<ProfessionalsPage />} />
          </Route>

           <Route
              path="profile/stripe/success"
              element={<LinkedAccountSuccess provider="stripe" />}
            />

            <Route
              path="profile/paypal/success"
              element={<LinkedAccountSuccess provider="paypal" />}
            />
          {/* PROTECTED ROUTES */}
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
              <Route index element={<DashboardHome />} />
              {/* CHILD ROUTES (RELATIVES) */}
              <Route path="profile-settings" element={<UserPage />} />
              <Route path="my-events" element={<MyEventPage />} />
              <Route path="my-reservations" element={<MyReservationPage />} />
              <Route path="event-calender" element={<CalenderEventPage />} />
              <Route path="my-following" element={<MyFollowingPage />} />

              {/* ADMIN ONLY */}
              <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                <Route path="approbation" element={<AdminApprovalPage />} />
                <Route path="commissions" element={<AdminCommissionPage />} />
              </Route>

              <Route path="refunds" element={<RemboursementsPage />} />

              {/* Vendor (Admin + Pro) */}
              <Route
                element={<PrivateRoute allowedRoles={["admin", "professionnel"]} />}>
                <Route path="vendor" element={<VendorDashboard />} />
              </Route>
            </Route>
          </Route>

        </Route>
      </Routes>
    </EventProvider>
  );
}
