import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Clock } from "lucide-react";
import usePrivateApi from "@/hooks/usePrivateApi";
import { PayementService } from "@/service/PaymentService";
import { privateApi } from "@/api/api";

interface PaymentResponse {
  success: boolean;
  message: string;
  payment: {
    id: number;
    total: number;
    status: string;
    taux_commission: number;
    session_id: string;
    paypal_id: string | null;
    vendor_id: number;
    created_at: string;
  };
  operation: {
    id: number;
    quantity: number;
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

export default function PaymentSuccess() {
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentService = PayementService();
  const payment_id = searchParams.get("payment_id");
  const session_id = searchParams.get("session_id");

  useEffect(() => {
    if (!payment_id &&!session_id) {
      setStatus("failed");
      return;
    }
    const checkPayment = async () => {
      try {
        console.log(session_id)
        const data =  await privateApi.get("/payment/status", {
                params: { payment_id, session_id },
              });
        setPaymentData(data.data);
        const currentStatus = data.data.payment?.status || "failed";
        if (["success", "completed","paid"].includes(currentStatus)) setStatus("success");
        else if (currentStatus === "pending") setStatus("pending");
        else setStatus("failed");
      } catch (error) {
        console.error("Erreur de vérification du paiement :", error);
        setStatus("failed");
      }
    };
    console.log(status)
    checkPayment();
  }, [searchParams]);

  const payment = paymentData?.payment;
  const event = paymentData?.operation?.event;
  // let thumbnail = event.thumbnail || event.thumbnail_path ;
  // if (thumbnail && !thumbnail.startsWith("http")) {
  //   // assume local path, prepend localhost
  //   thumbnail = `http://localhost:8000/storage/${thumbnail}`;
  // }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center  text-center px-6">
      {status === "loading" && (
        <>
          <Loader2 className="animate-spin w-16 h-16 text-accent mb-4" />
          <p className="text-gray-600 text-lg">Vérification du paiement en cours...</p>
        </>
      )}

      {(status === "success" || status === "pending" || status === "failed") && payment && event && (
        <div className=" backdrop-blur-2xl rounded-2xl  p-8 w-full max-w-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            {status === "success" && <CheckCircle className="w-20 h-20 text-green-500 mb-3" />}
            {status === "pending" && <Clock className="w-20 h-20 text-yellow-500 mb-3" />}
            {status === "failed" && <XCircle className="w-20 h-20 text-red-500 mb-3" />}

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {status === "success"
                ? "Paiement réussi 🎉"
                : status === "pending"
                ? "Paiement en attente"
                : "Paiement échoué ❌"}
            </h1>
            <p className="text-gray-500">{paymentData?.message}</p>
          </div>

          {/* Event Info */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-left border-t pt-4">
            <img
              src={'/'}
              alt={event.name}
              className="w-28 h-28 object-cover rounded-lg shadow-sm"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-lg text-gray-800">{event.name}</h2>
              <p className="text-gray-600 text-sm mb-2">
                {new Date(event.start_date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-gray-600 text-sm">{event.localisation.address}</p>
              <p className="text-gray-500 text-sm mt-1">
                Catégorie : <span className="font-medium">{event.categorie.name}</span>
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mt-6 text-left border-t pt-4 space-y-2">
            <p className="flex justify-between text-gray-700">
              <span>Montant total :</span>
              <span className="font-semibold">{payment.total.toFixed(2)} $</span>
            </p>
            <p className="flex justify-between text-gray-700">
              <span>Commission :</span>
              <span>{payment.taux_commission}%</span>
            </p>
            <p className="flex justify-between text-gray-700">
              <span>Quantité :</span>
              <span>{paymentData.operation.quantity}</span>
            </p>
            <p className="flex justify-between text-gray-700">
              <span>Statut :</span>
              <span
                className={`capitalize font-semibold ${
                  payment.status === "pending"
                    ? "text-yellow-600"
                    : payment.status === "paid"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {payment.status}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate("/events")}
              className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent transition flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Retourner aux événements
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
