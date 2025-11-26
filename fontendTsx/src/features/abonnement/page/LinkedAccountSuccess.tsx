import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/features/auth/service/authService";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

interface LinkedAccountSuccessProps {
  provider: "stripe" | "paypal";
}

type LinkingState = "loading" | "success" | "error";

export default function LinkedAccountSuccess({ provider }: LinkedAccountSuccessProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [state, setState] = useState<LinkingState>("loading");
  const [error, setError] = useState<string | null>(null);

  const providerName = provider === "stripe" ? "Stripe" : "PayPal";

  useEffect(() => {
    const finalizeLinking = async () => {
      try {
        const code = searchParams.get("code");
        
        if (!code) {
          throw new Error(`Code d'autorisation ${providerName} manquant`);
        }

        const response = provider === "stripe"
          ? await authService.linkStripe(code)
          : await authService.linkPaypal(code);

        if (!response.success) {
          throw new Error(response.message || "Erreur lors de la liaison du compte");
        }

        setState("success");

        // Redirection automatique après 2 secondes
        setTimeout(() => {
          navigate("/dashboard/profile-settings");
        }, 2000);

      } catch (err: any) {
        console.error(`[${providerName}] Erreur liaison:`, err);
        setError(
          err?.response?.data?.message ||
          err?.message ||
          `Une erreur est survenue lors de la liaison avec ${providerName}`
        );
        setState("error");
      }
    };

    finalizeLinking();
  }, [provider, providerName, searchParams, navigate]);

  // ==============================
  //       LOADING STATE
  // ==============================
  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Finalisation en cours...
          </h2>
          
          <p className="text-gray-600">
            Liaison de votre compte {providerName} en cours
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  //       ERROR STATE
  // ==============================
  if (state === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">
            Erreur de liaison
          </h1>
          
          <p className="text-gray-600 text-center mb-6">
            {error}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard/profile-settings")}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au profil
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
  //       SUCCESS STATE
  // ==============================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">
          Compte {providerName} lié avec succès !
        </h1>
        
        <p className="text-gray-600 text-center mb-6">
          Vous pouvez maintenant recevoir des paiements via {providerName}
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirection automatique...</span>
        </div>

        <button
          onClick={() => navigate("/dashboard/profile-settings")}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Aller au profil maintenant
        </button>
      </div>
    </div>
  );
}