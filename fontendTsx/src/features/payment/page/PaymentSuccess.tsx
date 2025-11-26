import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Calendar, MapPin, Tag, DollarSign, CalendarDays } from "lucide-react";
import { PayementService } from "@/features/payment/service/paymentService";

interface PaymentResponse {
  success: boolean;
  message: string;
  payment: {
    id: number;
    total: number;
    status: string;
    session_id: string;
    paypal_id: string | null;
    vendor_id: number;
    created_at: string;
  };
  operation: {
    id: number;
    type_operation_id: number;
    event: {
      id: number;
      name: string;
      description: string;
      start_date: string;
      end_date: string;
      base_price: number;
      capacity: number;
      available_places: number;
      thumbnail: string;
      localisation: { address: string };
      categorie: { name: string };
    };
  };
}

type PaymentState = "loading" | "success" | "pending" | "failed";

export default function PaymentSuccess() {
  const [status, setStatus] = useState<PaymentState>("loading");
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentService = PayementService();

  const payment_id = searchParams.get("payment_id");
  const session_id = searchParams.get("session_id");

  useEffect(() => {
    if (!payment_id && !session_id) {
      setStatus("failed");
      return;
    }

    const checkPayment = async () => {
      try {
        const data = await paymentService.getPaymentStatus({
          payment_id: payment_id || undefined,
          session_id: session_id || undefined,
        });

        setPaymentData(data);
        const currentStatus = data.payment?.status || "failed";

        if (["success", "completed", "paid"].includes(currentStatus)) {
          setStatus("success");
        } else if (currentStatus === "pending") {
          setStatus("pending");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Erreur de vérification du paiement :", error);
        setStatus("failed");
      }
    };

    checkPayment();
  }, [payment_id, session_id, paymentService]);

  const payment = paymentData?.payment;
  const event = paymentData?.operation?.event;

  // ==============================
  //       LOADING STATE
  // ==============================
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Vérification en cours...
          </h2>

          <p className="text-gray-600">
            Vérification du statut de votre paiement
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  //       FAILED STATE
  // ==============================
  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">
            Paiement échoué
          </h1>

          <p className="text-gray-600 text-center mb-6">
            {paymentData?.message || "Une erreur est survenue lors du paiement"}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/events")}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux événements
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  //       PENDING STATE
  // ==============================
  if (status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 rounded-full p-4">
              <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">
            Paiement en cours
          </h1>

          <p className="text-gray-600 text-center mb-6">
            Votre paiement est en cours de traitement. Vous recevrez un email de confirmation une fois le paiement validé.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/my-reservations")}
              className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Voir mes réservations
            </button>

            <button
              onClick={() => navigate("/events")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux événements
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  //       SUCCESS STATE
  // ==============================
  if (!payment || !event) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-3">
          Réservation confirmée ! 🎉
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Vous recevrez un email de confirmation avec tous les détails
        </p>

        {/* Event Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Event Image or Placeholder */}
            {event.thumbnail ? (
              <img
                src={event.thumbnail}
                alt={event.name}
                className="w-full sm:w-32 h-32 object-cover rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg shadow-md flex items-center justify-center">
                <CalendarDays className="w-16 h-16 text-blue-600 opacity-60" />
              </div>
            )}

            {/* Event Details */}
            <div className="flex-1 space-y-3">
              <h2 className="font-bold text-xl text-gray-800">
                {event.name}
              </h2>

              <div className="space-y-2">
                {/* Date */}
                <div className="flex items-start gap-2 text-gray-700">
                  <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                  <div className="text-sm">
                    <div className="font-medium">
                      {new Date(event.start_date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-gray-600">
                      {new Date(event.start_date).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {new Date(event.end_date).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <MapPin className="w-5 h-5 flex-shrink-0 text-red-600" />
                  <span>{event.localisation.address}</span>
                </div>

                {/* Category */}
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <Tag className="w-5 h-5 flex-shrink-0 text-purple-600" />
                  <span className="font-medium">{event.categorie.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
          <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Détails du paiement
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-gray-700">
              <span className="text-sm">Montant total :</span>
              <span className="font-bold text-lg text-green-600">
                {payment.total.toFixed(2)} $ CAD
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-700">
              <span className="text-sm">Statut :</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Payé
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-700">
              <span className="text-sm">Numéro de réservation :</span>
              <span className="font-mono text-sm font-semibold">
                #{paymentData.operation.id}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/dashboard/my-reservations")}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Voir mes réservations
          </button>

          <button
            onClick={() => navigate("/events")}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux événements
          </button>
        </div>
      </div>
    </div>
  );
}