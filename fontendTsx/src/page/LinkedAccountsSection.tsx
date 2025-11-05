import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Link as LinkIcon, Unlink, CreditCard, Lock } from "lucide-react";
import { privateApi } from "@/api/api";
import Abonnement from "./Abonnement";

function LinkedAccountsSection() {
  const [subscription, setSubscription] = useState<any>(null);
  const [accounts, setAccounts] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
const [openSubSection, setOpenSubSection] = useState(false);

  // ✅ 1. Fetch abonnement info first
  const fetchSubscription = async () => {
    try {
      const data = await privateApi.get("/abonnement/info");
      setSubscription(data.data);
      if (data.data.has_pro_plus) fetchLinkedAccounts();
    } catch (err) {
      console.error("Erreur abonnement:", err);
    }
  };

  // ✅ 2. Fetch linked accounts if user has Pro Plus
  const fetchLinkedAccounts = async () => {
    try {
      const data = await privateApi.get("/profile/linked-accounts");
      setAccounts(data.data);
    } catch (err) {
      console.error("Erreur comptes liés:", err);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleLink = async (provider: "stripe" | "paypal") => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await privateApi.get(`/profile/${provider}/link`);
      window.location.href = data.data.url;
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la liaison du compte.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (provider: "stripe" | "paypal") => {
    setLoading(true);
    setMessage(null);
    try {
      await privateApi.post(`/profile/${provider}/unlink`);
      setMessage(`Compte ${provider} délié avec succès.`);
      fetchLinkedAccounts();
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la déliaison du compte.");
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Loading
  if (!subscription)
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} />
        Chargement des informations...
      </div>
    );

  // 🔒 User does NOT have Pro Plus
  if (!subscription.has_pro_plus) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50 text-center shadow-sm">
        <Lock size={32} className="mx-auto mb-3 text-gray-500" />
        <h3 className="text-lg font-semibold mb-2">Fonctionnalité réservée</h3>
        <p className="text-gray-600 mb-4">
          Le lien vers Stripe et PayPal est réservé aux utilisateurs avec l’abonnement <strong>Pro Plus</strong>.
        </p>
        <a
          onClick={()=>setOpenSubSection(true)}
          className="inline-block bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Passer à Pro Plus
        </a>
        {
            openSubSection&&
            <div className="fixed z-999  w-full inset-0 min-h-screen bg-black/5 backdrop-blur-3xl overflow-y-auto ">
                <Abonnement handelClose={()=>setOpenSubSection(false)}/>
            </div>
        }
      </div>
    );
  }

  // ✅ User has Pro Plus → show linking section
  if (!accounts) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} />
        Chargement des comptes liés...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stripe */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <CreditCard size={22} className="text-purple-600" />
          <div>
            <h3 className="font-semibold">Stripe</h3>
            {accounts.stripe.linked ? (
              <p className="text-sm text-gray-500">
                Connecté (ID : {accounts.stripe.account_id})
              </p>
            ) : (
              <p className="text-sm text-gray-500">Aucun compte lié</p>
            )}
          </div>
        </div>
        {accounts.stripe.linked ? (
          <button
            onClick={() => handleUnlink("stripe")}
            disabled={loading}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            <Unlink size={18} />
            Délier
          </button>
        ) : (
          <button
            onClick={() => handleLink("stripe")}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <LinkIcon size={18} />
            Lier Stripe
          </button>
        )}
      </div>

      {/* PayPal */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <CreditCard size={22} className="text-blue-500" />
          <div>
            <h3 className="font-semibold">PayPal</h3>
            {accounts.paypal.linked ? (
              <p className="text-sm text-gray-500">
                {accounts.paypal.email || "Compte lié"}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Aucun compte lié</p>
            )}
          </div>
        </div>
        {accounts.paypal.linked ? (
          <button
            onClick={() => handleUnlink("paypal")}
            disabled={loading}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            <Unlink size={18} />
            Délier
          </button>
        ) : (
          <button
            onClick={() => handleLink("paypal")}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <LinkIcon size={18} />
            Lier PayPal
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center text-sm text-gray-600">
          <Loader2 className="animate-spin mr-2" size={16} />
          Traitement en cours...
        </div>
      )}
      {message && <p className="text-green-600 text-sm">{message}</p>}
    </div>
  );
}

export default LinkedAccountsSection;
