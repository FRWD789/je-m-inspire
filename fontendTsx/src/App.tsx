import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout/layout";
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

import OnboardingGuard from "./components/OnboardingGuard";
import EventProvider from "./context/EventContext";
import MyEventPage from "./features/events/page/MyEventPage";
import MyReservationPage from "./features/events/reservations/page/MyReservationPage";
import CalenderEventPage from "./features/calender/page/CalenderEventPage";
import Abonnement from "./page/Abonnement";
import ProfessionalPublicProfile from "./page/ProProfile";
import AdminCommissionPage from "./page/UsersComissons";
import AbonnementSuccess from "./page/abonnementSuccess";

export default function App() {
  return (
    <EventProvider>
      <Routes>
        <Route element={<PersistLogin />}>
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="register-pro" element={<RegisterPro />} />
            <Route path="events" element={<PublicEvents />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="abonnement/success" element={<AbonnementSuccess/>} />
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route path="user/:id" element={<ProfessionalPublicProfile/>}/>
          </Route>

          {/* Authenticated Routes */}
          <Route
            element={
              <PrivateRoute
                allowedRoles={["utilisateur", "professionnel", "admin"]}
              />
            }
          >
            <Route path="/dashboard"  element={<OnboardingGuard><Dashboard /></OnboardingGuard>

              }>
              <Route path="profile-settings" element={<User />} />
              <Route path="my-events" element={<MyEventPage />} />
              <Route path="my-reservations" element={<MyReservationPage />} />
              <Route path="event-calender" element={<CalenderEventPage />} />
              {/* Admin-only routes */}
              <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                <Route path="approbation" element={<AdminApprovalPage />} />
                <Route path="commissions" element={<AdminCommissionPage />} />
                <Route path="refunds" element={<RefundRequestsAdmin />} />
              </Route>
              <Route path="refunds-request" element={<RefundRequestPage />} />
              {/* User/Pro-only refund route */}
              <Route
                element={
                  <PrivateRoute
                    allowedRoles={["utilisateur", "professionnel"]}
                  />
                }
              >
               
              </Route> 
            </Route>
          </Route>
        </Route>
      </Routes>
    </EventProvider>
  );
}
