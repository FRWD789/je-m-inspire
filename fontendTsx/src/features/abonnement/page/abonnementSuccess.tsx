import React, { useState } from 'react'

export default function AbonnementSuccess() {
   const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    // ✅ Hard-coded action
    setSubscribed(true);
  };

  return (
    <section className="w-full min-h-screen flex justify-center items-center p-6 ">
      <div className="w-full max-w-xl   p-8">
       {/* ✅ Success UI */}
            <div className="text-center">
              <span className="text-green-500 text-6xl">✅</span>
              <h2 className="text-2xl font-bold mt-4">
                Abonnement Activé avec Succès !
              </h2>
              <p className="text-gray-600 mt-2">
                Merci de votre confiance. Vous pouvez maintenant profiter de
                toutes les fonctionnalités professionnelles.
              </p>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => alert("Redirect action here")}
              className="w-full mt-8 py-3 bg-accent hover:bg-primary text-white font-semibold rounded-lg transition"
            >
              Continuer
            </button>
          
      </div>
    </section>
  );

}
