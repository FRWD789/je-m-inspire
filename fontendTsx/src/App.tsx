import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./page/Auth/login";
import Register from "./page/Auth/register";
import RegisterPro from "./page/Auth/registerPro";
import Home from "./page/home";
import User from "./page/user";
import Dashboard from "./layout/dashboard";
import Events from "./page/Events/Events";
import MyEvents from "./page/Events/MyEvents";
import PublicEvents from "./page/publicEvents";
import EventDetail from "./page/eventDeatail";
import AdminApprovalPage from "./components/userAprrobation";
import PaymentSuccess from "./page/PaymentSuccess";
import MyReservations from "./page/Reservation/MyReservations";
import RefundRequestPage from "./page/RefundRequestPage";
import RefundRequestsAdmin from "./page/RefundRequestAdmin";
import PrivateRoute from "./components/privateRoute";
import PersistLogin from "./components/persistLogin";
import DashboardHome from "./page/DashboardHome";
import OnboardingGuard from "./components/OnboardingGuard";
import EventProvider from "./context/EventContext";
import MyEventPage from "./features/events/page/MyEventPage";
import MyReservationPage from "./features/events/reservations/page/MyReservationPage";
import CalenderEventPage from "./features/calender/page/CalenderEventPage";
import Abonnement from "./page/Abonnement";
import ProfessionalPublicProfile from "./page/ProProfile";
import AdminCommissionPage from "./page/UsersComissons";
import AbonnementSuccess from "./page/abonnementSuccess";
import GoogleCallback from "./page/Auth/GoogleCallback";
import VendorDashboard from "./features/vendorDashboard/page/VendorDashboard";
import MyFollowingPage from './features/follow/page/MyFollowingPage';
import DisableNotificationsPage from "./features/follow/page/DisableNotificationsPage";
import LinkedAccountSuccess from "./page/LinkedAccountSuccess";

export default function App() {
  return (
    <EventProvider>
      <Routes>

        <Route element={<PersistLogin />}>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
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
              <Route path="profile-settings" element={<User />} />
              <Route path="my-events" element={<MyEventPage />} />
              <Route path="my-reservations" element={<MyReservationPage />} />
              <Route path="event-calender" element={<CalenderEventPage />} />
              <Route path="my-following" element={<MyFollowingPage />} />

              {/* ADMIN ONLY */}
              <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                <Route path="approbation" element={<AdminApprovalPage />} />
                <Route path="commissions" element={<AdminCommissionPage />} />
                <Route path="refunds" element={<RefundRequestsAdmin />} />
              </Route>

              <Route path="refunds-request" element={<RefundRequestPage />} />

              {/* Vendor (Admin + Pro) */}
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
    </EventProvider>
  );
}
