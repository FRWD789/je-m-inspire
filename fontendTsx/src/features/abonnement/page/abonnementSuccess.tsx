import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';


export default function AbonnementSuccess() {
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubscribe = () => {
    setSubscribed(true);
  };

  return (
    <section className="w-full min-h-screen flex justify-center items-center p-6 ">
      <div className="w-full max-w-xl   p-8">
            <div className="text-center">
              <span className="text-green-500 text-6xl">✅</span>
              <h2 className="text-2xl font-bold mt-4">
                {t('subscriptionSuccess.title')}
              </h2>
              <p className="text-gray-600 mt-2">
                {t('subscriptionSuccess.message')}
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard/profile-settings?tab=plan")}
              className="w-full mt-8 py-3 bg-accent hover:bg-primary text-white font-semibold rounded-lg transition"
            >
              {t('subscriptionSuccess.continue')}
            </button>
          
      </div>
    </section>
  );

}