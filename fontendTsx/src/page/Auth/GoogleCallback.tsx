import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const { googleLogin } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Check for OAuth errors
      if (error) {
        setErrorMessage("Connexion Google annulée ou refusée");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      // Check for authorization code
      if (!code) {
        setErrorMessage("Code d'autorisation manquant");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      try {
        await googleLogin(code);
        // Navigation is handled in the googleLogin function
      } catch (err: any) {
        console.error("Google login error:", err);
        setErrorMessage(
          err?.response?.data?.message || "Erreur lors de la connexion Google"
        );
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleGoogleCallback();
  }, [code, error, googleLogin, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        {errorMessage ? (
          <>
            <div className="text-red-600 text-xl mb-4">❌</div>
            <p className="text-red-600">{errorMessage}</p>
            <p className="text-sm text-gray-500 mt-2">
              Redirection vers la page de connexion...
            </p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Connexion Google en cours...</p>
          </>
        )}
      </div>
    </div>
  );
}