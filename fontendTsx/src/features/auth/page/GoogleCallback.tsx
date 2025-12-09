import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from 'react-i18next';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const { googleLogin } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (error) {
        setErrorMessage(t('google.connectionCancelled'));
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      if (!code) {
        setErrorMessage(t('google.authorizationCodeMissing'));
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      try {
        await googleLogin(code);
      } catch (err: any) {
        console.error("Google login error:", err);
        setErrorMessage(
          err?.response?.data?.message || t('google.connectionError')
        );
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleGoogleCallback();
  }, [code, error, googleLogin, navigate, t]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        {errorMessage ? (
          <>
            <div className="text-red-600 text-xl mb-4">❌</div>
            <p className="text-red-600">{errorMessage}</p>
            <p className="text-sm text-gray-500 mt-2">
              {t('google.redirectingToLogin')}
            </p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">{t('google.connectionInProgress')}</p>
          </>
        )}
      </div>
    </div>
  );
}