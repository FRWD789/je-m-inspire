import React, { useEffect, useState } from "react";
import { Shield, Check, X, MessageCircle, RefreshCcw, FileText, ClipboardList } from "lucide-react";
import usePrivateApi from "@/hooks/usePrivateApi";
import { ReservationService } from "@/features/reservation/service/reservationService";
import { RefundService } from "@/features/refunds/service/refundService";
import Button from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import { useLocation } from "react-router-dom";

interface RefundRequest {
  id: number;
  date: string;
  evenement: string;
  client: string;
  vendeur: string;
  courriel: string;
  motif: string;
  message: string;
  montant: number;
  statut: "en_attente" | "approuve" | "refuse";
  date_traitement: string | null;
}

interface ApiResponse {
  data: RefundRequest[];
  total: number;
  type: 'admin' | 'pro';
}

export default function RemboursementsPage() {
  const api = usePrivateApi();
  const reservationService = ReservationService();
  const refundService = RefundService();
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  // Détection des rôles
  const isAdmin = user?.roles?.some((role: any) => role.role === 'admin');
  const isPro = user?.roles?.some((role: any) => role.role === 'professionnel');
  const canManage = isAdmin || isPro;

  // Onglet principal
  const [mainTab, setMainTab] = useState<"myRequests" | "manage">("myRequests");

  // ========== SECTION MES DEMANDES ==========
  const reservationIdFromState = location.state?.reservationId || null;
  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [motif, setMotif] = useState("");
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorReservations, setErrorReservations] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const isRecaptchaEnabled = Boolean(recaptchaSiteKey);

  // ========== SECTION GESTION (ADMIN/PRO) ==========
  const [viewContent, setViewContent] = useState<{ title: string; content: string } | null>(null);
  const [currentTab, setCurrentTab] = useState<"pending" | "approved" | "refused" | "all">("pending");
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loadingManage, setLoadingManage] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [modalRequest, setModalRequest] = useState<RefundRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "refuse" | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [errorManage, setErrorManage] = useState("");
  const [userType, setUserType] = useState<'admin' | 'pro'>('admin');

  // Charger les réservations pour "Mes demandes"
  useEffect(() => {
    if (mainTab === "myRequests") {
      fetchReservations();
    }
  }, [mainTab]);

  // Charger les remboursements pour "Gestion"
  useEffect(() => {
    if (mainTab === "manage" && canManage) {
      fetchManageRequests();
    }
  }, [mainTab]);

  const fetchReservations = async () => {
    setLoadingReservations(true);
    try {
      const res = await reservationService.getMyReservations();
      console.log("Réservations récupérées pour remboursement:", res);
      const eligible = (res.reservations || []).filter(
        (r: any) => r.statut_paiement === "paid" && r.peut_annuler && !r.has_refund_request
      );
      setReservations(eligible);

      if (reservationIdFromState) {
        const found = eligible.find((r: any) => r.id === reservationIdFromState);
        if (found) setSelectedReservationId(found.id);
      }
    } catch (err) {
      console.error(err);
      setErrorReservations(t("common.somethingWentWrong"));
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedReservationId) return alert(t("refunds.selectReservation"));
    if (!motif.trim()) return alert(t("refunds.reason"));
    if (isRecaptchaEnabled && !captchaToken) return alert(t("common.pleaseCompleteRecaptcha"));

    setSubmitting(true);
    try {
      const reservation = reservations.find((r) => r.id === selectedReservationId);
      const montant = reservation.event.base_price;

      await refundService.requestRefund(selectedReservationId, motif, montant);
      alert(t("refunds.submitSuccess"));
      setMotif("");
      setSelectedReservationId(null);
      setCaptchaToken(null);

      fetchReservations();
    } catch (err) {
      console.error(err);
      alert(t("refunds.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const fetchManageRequests = async () => {
    setLoadingManage(true);
    try {
      const res: ApiResponse = await refundService.getAllRefunds();
      setRequests(res.data || []);
      setUserType(res.type || 'admin');
    } catch (err) {
      console.error("Erreur chargement remboursements:", err);
      setErrorManage("Impossible de récupérer les demandes de remboursement.");
    } finally {
      setLoadingManage(false);
    }
  };

  const handleProcess = async () => {
    if (!modalRequest || !actionType) return;
    if (adminMessage.length < 5) return;

    setProcessingId(modalRequest.id);
    try {
      await refundService.processRefund(modalRequest.id, {
        statut: actionType === "approve" ? "approuve" : "refuse",
        commentaire_admin: adminMessage,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === modalRequest.id
            ? {
                ...r,
                statut: actionType === "approve" ? "approuve" : "refuse",
                message: adminMessage,
                date_traitement: new Date().toISOString(),
              }
            : r
        )
      );
      setModalRequest(null);
      setAdminMessage("");
      setActionType(null);
    } catch (err) {
      console.error("Erreur traitement:", err);
      alert("Erreur lors du traitement de la demande");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (currentTab === "pending") return r.statut === "en_attente";
    if (currentTab === "approved") return r.statut === "approuve";
    if (currentTab === "refused") return r.statut === "refuse";
    return true;
  });

  const title = userType === 'admin' 
    ? 'Remboursements à traiter (Paiements indirects)' 
    : 'Remboursements de mes événements (Paiements directs)';

  const description = userType === 'admin'
    ? 'Paiements reçus par la plateforme - vous devez effectuer les remboursements manuellement'
    : 'Paiements reçus directement - vous devez effectuer les remboursements depuis votre compte Stripe/PayPal';

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Onglets principaux */}
      <div className="flex gap-3 mb-6 border-b border-gray-200">
        <button
          className={`px-6 py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            mainTab === "myRequests"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setMainTab("myRequests")}
        >
          <FileText size={20} />
          Mes demandes
        </button>
        
        {canManage && (
          <button
            className={`px-6 py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              mainTab === "manage"
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setMainTab("manage")}
          >
            <ClipboardList size={20} />
            Gestion des remboursements
          </button>
        )}
      </div>

      {/* Contenu de l'onglet "Mes demandes" */}
      {mainTab === "myRequests" && (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6 text-center">
            {t("dashboard.refundRequest")}
          </h1>

          {loadingReservations ? (
            <p className="text-center mt-6">{t("common.loading")}</p>
          ) : errorReservations ? (
            <p className="text-red-500 text-center mt-6">{errorReservations}</p>
          ) : reservations.length === 0 ? (
            <div className="text-center mt-6 p-6 bg-gray-50 rounded-lg">
              <p>{t("refunds.noReservations")}</p>
              <span className="text-sm text-gray-500 mt-2 block">
                Les réservations avec une demande de remboursement en cours n'apparaissent pas ici.
              </span>
            </div>
          ) : (
            <>
              {/* Formulaire de demande */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <label htmlFor="reservation" className="block mb-2 font-medium text-gray-700">
                    {t("refunds.selectReservation")}
                  </label>
                  <select
                    id="reservation"
                    value={selectedReservationId || ""}
                    onChange={(e) => setSelectedReservationId(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t("common.chooseOption") || "--"}</option>
                    {reservations.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.event_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="motif" className="block mb-2 font-medium text-gray-700">
                    {t("refunds.reason")}
                  </label>
                  <textarea
                    id="motif"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary"
                    placeholder={t("refunds.reasonPlaceholder")}
                  />
                </div>

                {isRecaptchaEnabled && (
                  <div className="mb-6 flex justify-center">
                    <ReCAPTCHA
                      sitekey={recaptchaSiteKey}
                      onChange={(token) => setCaptchaToken(token)}
                    />
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  className="bg-primary text-white w-full hover:bg-primary/80"
                  disabled={
                    !selectedReservationId ||
                    !motif.trim() ||
                    submitting ||
                    (isRecaptchaEnabled && !captchaToken)
                  }
                >
                  {submitting ? t("refunds.submitting") : t("refunds.submit")}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Contenu de l'onglet "Gestion" */}
      {mainTab === "manage" && canManage && (
        <>
          {/* Header + Stats */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <Shield size={24} /> {title}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>En attente: {requests.filter((r) => r.statut === "en_attente").length}</span>
                <span>Approuvées: {requests.filter((r) => r.statut === "approuve").length}</span>
                <span>Refusées: {requests.filter((r) => r.statut === "refuse").length}</span>
              </div>
            </div>
            <button
              onClick={fetchManageRequests}
              className="px-3 py-2 rounded-[4px] bg-primary/60 text-white hover:bg-primary/80 transition-all text-sm flex items-center gap-2"
            >
              <RefreshCcw size={15} /> Rafraîchir
            </button>
          </div>

          {/* Tabs filtres */}
          <div className="flex gap-3 mb-4">
            {["pending", "approved", "refused", "all"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-md font-medium ${
                  currentTab === tab
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setCurrentTab(tab as any)}
              >
                {tab === "pending" ? "En attente" : 
                 tab === "approved" ? "Approuvées" : 
                 tab === "refused" ? "Refusées" : "Toutes"}
              </button>
            ))}
          </div>

          {/* Table */}
          {loadingManage ? (
            <p className="text-center mt-6">Chargement des demandes...</p>
          ) : errorManage ? (
            <div className="text-center bg-red-50 border-2 border-red-200 rounded-lg py-8">
              <p className="text-red-600">{errorManage}</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg py-16">
              <MessageCircle size={40} className="mx-auto text-accent mb-4" />
              <h2 className="text-lg font-semibold mb-2">Aucune demande trouvée</h2>
              <p className="text-gray-500">Aucune demande correspondant à ce filtre</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-[4px] shadow-sm border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 text-left">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Événement</th>
                    <th className="py-3 px-4 font-semibold">Client</th>
                    <th className="py-3 px-4 font-semibold">Vendeur</th>
                    <th className="py-3 px-4 font-semibold">Courriel</th>
                    <th className="py-3 px-4 font-semibold">Montant</th>
                    <th className="py-3 px-4 font-semibold">Motif</th>
                    <th className="py-3 px-4 font-semibold">Message</th>
                    <th className="py-3 px-4 font-semibold sticky right-0 bg-gray-100 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                      Statut / Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        {new Date(req.date).toLocaleDateString('fr-CA')}
                      </td>
                      <td className="py-3 px-4 max-w-[150px] truncate" title={req.evenement}>
                        {req.evenement}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{req.client}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{req.vendeur}</td>
                      <td className="py-3 px-4">{req.courriel}</td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium">
                        {req.montant.toFixed(2)} CAD
                      </td>

                      {/* Motif click */}
                      <td
                        className="py-3 px-4 cursor-pointer text-primary hover:underline max-w-[200px] truncate"
                        onClick={() =>
                          req.motif &&
                          setViewContent({ title: "Motif de remboursement", content: req.motif })
                        }
                      >
                        {req.motif
                          ? req.motif.slice(0, 40) + (req.motif.length > 40 ? "..." : "")
                          : "Aucun motif"}
                      </td>

                      {/* Message click */}
                      <td
                        className="py-3 px-4 cursor-pointer text-primary hover:underline max-w-[200px] truncate"
                        onClick={() =>
                          req.message &&
                          setViewContent({ title: "Message de l'administrateur", content: req.message })
                        }
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MessageCircle size={18} />
                          {req.message
                            ? req.message.slice(0, 40) + (req.message.length > 40 ? "..." : "")
                            : "Aucun message"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-2px_0_4px_rgba(0,0,0,0.05)] transition-colors">
                        {req.statut === "en_attente" ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setModalRequest(req);
                                setActionType("approve");
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 text-xs px-2 py-1"
                            >
                              <Check size={14} /> Approuver
                            </Button>
                            <Button
                              onClick={() => {
                                setModalRequest(req);
                                setActionType("refuse");
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 text-xs px-2 py-1"
                            >
                              <X size={14} /> Refuser
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            {req.statut === "approuve" ? "Approuvé" : "Refusé"}
                            {req.date_traitement && (
                              <> le {new Date(req.date_traitement).toLocaleDateString('fr-CA')}</>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* View Content Modal (motif / message) */}
      {viewContent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-3">{viewContent.title}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{viewContent.content}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewContent(null)}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80 text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for admin approval/refusal */}
      {modalRequest && actionType && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-3">
              {actionType === "approve" ? "Approuver" : "Refuser"} la demande de {modalRequest.client}
            </h3>
            <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
              <p><strong>Événement:</strong> {modalRequest.evenement}</p>
              <p><strong>Montant:</strong> {modalRequest.montant.toFixed(2)} CAD</p>
              <p><strong>Motif:</strong> {modalRequest.motif}</p>
            </div>
            <textarea
              placeholder="Ajouter un message (minimum 5 caractères)..."
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              rows={4}
              className="w-full rounded-md p-2 mb-2 border border-gray-300 focus:ring-primary focus:border-primary text-sm"
            />
            {adminMessage.length > 0 && adminMessage.length < 5 && (
              <p className="text-red-600 text-sm mb-2">
                Le message doit contenir au moins 5 caractères.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalRequest(null);
                  setActionType(null);
                  setAdminMessage("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleProcess}
                disabled={adminMessage.length < 5 || processingId === modalRequest.id}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                  adminMessage.length < 5
                    ? "bg-gray-400 cursor-not-allowed"
                    : actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processingId === modalRequest.id ? "⏳" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}