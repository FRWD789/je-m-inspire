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
      setErrorReservations(t("refunds.errorLoading"));
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedReservationId) return alert(t("refunds.selectReservationFirst"));
    if (!motif.trim()) return alert(t("refunds.reason"));
    if (isRecaptchaEnabled && !captchaToken) return alert(t("refunds.pleaseCompleteRecaptcha"));
    
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
      setErrorManage(t("refunds.cannotLoadRequests"));
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
      alert(t("refunds.errorProcessing"));
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
  ? t('refunds.adminTitle')
  : t('refunds.proTitle');

  const description = userType === 'admin'
    ? 'Paiements reçus par la plateforme - vous devez effectuer les remboursements manuellement'
    : 'Paiements reçus directement - vous devez effectuer les remboursements depuis votre compte Stripe/PayPal';

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      {/* Onglets principaux - Responsive */}
      <div className="flex gap-2 sm:gap-3 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
            mainTab === "myRequests"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setMainTab("myRequests")}
        >
          <FileText size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">{t('refunds.myRequests')}</span>
          <span className="xs:hidden">{t('refunds.myRequestShort')}</span>
        </button>
        
        {canManage && (
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
              mainTab === "manage"
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setMainTab("manage")}
          >
            <ClipboardList size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">{t('refunds.manage')}</span>
            <span className="xs:hidden">{t('refunds.manageShort')}</span>
          </button>
        )}
      </div>

      {/* Contenu de l'onglet "Mes demandes" */}
      {mainTab === "myRequests" && (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
            {t("dashboard.refundRequest")}
          </h1>

          {loadingReservations ? (
            <p className="text-center mt-6">{t("common.loading")}</p>
          ) : errorReservations ? (
            <p className="text-red-500 text-center mt-6">{errorReservations}</p>
          ) : reservations.length === 0 ? (
            <div className="text-center mt-6 p-4 sm:p-6 bg-gray-50 rounded-lg">
              <p className="text-sm sm:text-base">{t("refunds.noReservations")}</p>
              <span className="text-xs sm:text-sm text-gray-500 mt-2 block">
                {t('refunds.eligibleReservationsDesc')}
              </span>
            </div>
          ) : (
            <>
              {/* Formulaire de demande - Responsive */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="mb-4">
                  <label htmlFor="reservation" className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">
                    {t("refunds.selectReservation")}
                  </label>
                  <select
                    id="reservation"
                    value={selectedReservationId || ""}
                    onChange={(e) => setSelectedReservationId(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary text-sm sm:text-base"
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
                  <label htmlFor="motif" className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">
                    {t("refunds.reason")}
                  </label>
                  <textarea
                    id="motif"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary text-sm sm:text-base"
                    placeholder={t("refunds.reasonPlaceholder")}
                  />
                </div>

                {isRecaptchaEnabled && (
                  <div className="mb-6 flex justify-center overflow-x-auto">
                    <ReCAPTCHA
                      sitekey={recaptchaSiteKey}
                      onChange={(token) => setCaptchaToken(token)}
                    />
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  className="bg-primary text-white w-full hover:bg-primary/80 text-sm sm:text-base py-2 sm:py-3"
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
          {/* Header + Stats - Responsive */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold flex items-center gap-2">
                <Shield size={20} className="sm:w-6 sm:h-6" />
                <span className="line-clamp-2">{title}</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{description}</p>
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                <span className="bg-yellow-50 px-2 py-1 rounded">
                  {t("refunds.pending")} <strong>{requests.filter((r) => r.statut === "en_attente").length}</strong>
                </span>
                <span className="bg-green-50 px-2 py-1 rounded">
                  {t("refunds.approved")}: <strong>{requests.filter((r) => r.statut === "approuve").length}</strong>
                </span>
                <span className="bg-red-50 px-2 py-1 rounded">
                  {t('refunds.refused')}: <strong>{requests.filter((r) => r.statut === "refuse").length}</strong>
                </span>
              </div>
            </div>
            <button
              onClick={fetchManageRequests}
              className="px-3 py-2 rounded-[4px] bg-primary/60 text-white hover:bg-primary/80 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 w-full lg:w-auto"
            >
              <RefreshCcw size={15} /> 
              <span className="hidden xs:inline">{t('refunds.refresh')}</span>
              <span className="xs:hidden">{t('refunds.refresh')}</span>
            </button>
          </div>

          {/* Tabs filtres - Responsive */}
          <div className="flex gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2">
            {[
              { key: "pending", label: t('refunds.pending'), labelShort: t('refunds.pending') },
              { key: "approved", label: t('refunds.approved'), labelShort: t('refunds.approved') },
              { key: "refused", label: t('refunds.refused'), labelShort: t('refunds.refused') },
              { key: "all", label: t('refunds.all'), labelShort: t('refunds.all') }
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-3 sm:px-4 py-2 rounded-md font-medium whitespace-nowrap text-xs sm:text-sm ${
                  currentTab === tab.key
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setCurrentTab(tab.key as any)}
              >
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.labelShort}</span>
              </button>
            ))}
          </div>

          {/* Table - Desktop / Cards - Mobile */}
          {loadingManage ? (
            <p className="text-center mt-6 text-sm sm:text-base">{t('refunds.loading')}</p>
          ) : errorManage ? (
            <div className="text-center bg-red-50 border-2 border-red-200 rounded-lg py-6 sm:py-8 px-4">
              <p className="text-red-600 text-sm sm:text-base">{errorManage}</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg py-12 sm:py-16 px-4">
              <MessageCircle size={32} className="sm:w-10 sm:h-10 mx-auto text-accent mb-4" />
              <h2 className="text-base sm:text-lg font-semibold mb-2">{t('refunds.noRequestYet')}</h2>
              <p className="text-gray-500 text-sm sm:text-base">{t('refunds.noRequestDesc')}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table (hidden on mobile) */}
              <div className="hidden lg:block overflow-x-auto bg-white rounded-[4px] shadow-sm border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700 text-left">
                    <tr>
                      <th className="py-3 px-4 font-semibold">{t('refunds.date')}</th>
                      <th className="py-3 px-4 font-semibold">{t('refunds.event')}</th>
                      <th className="py-3 px-4 font-semibold">{t('refunds.client')}</th>
                      <th className="py-3 px-4 font-semibold">{t('refunds.vendor')}</th>
                      <th className="py-3 px-4 font-semibold">{t('refunds.email')}</th>
                      <th className="py-3 px-4 font-semibold">{t('refunds.amount')}</th>
                      <th className="py-3 px-4 font-semibold">{t('refunds.motive')}</th>
                      <th className="py-3 px-4 font-semibold">{t('refunds.message')}</th>
                      <th className="py-3 px-4 font-semibold sticky right-0 bg-gray-100 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                        {t('refunds.status')} / {t('refunds.actions')}
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
                            setViewContent({ title: t('refunds.refundReason'), content: req.motif })
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
                            setViewContent({ title: t('refunds.adminMessage'), content: req.message })
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
                                <Check size={14} /> {t('refunds.approve')}
                              </Button>
                              <Button
                                onClick={() => {
                                  setModalRequest(req);
                                  setActionType("refuse");
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 text-xs px-2 py-1"
                              >
                                <X size={14} /> {t('refunds.refuse')}
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

              {/* Mobile Cards (visible only on mobile) */}
              <div className="lg:hidden space-y-4">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                          {req.evenement}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {new Date(req.date).toLocaleDateString('fr-CA')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                        req.statut === "en_attente"
                          ? "bg-yellow-100 text-yellow-800"
                          : req.statut === "approuve"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {req.statut === "en_attente" ? t('refunds.statusPending') : 
                         req.statut === "approuve" ? t('refunds.statusApproved') : t('refunds.statusRefused')}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('refunds.client')}:</span>
                        <span className="font-medium">{req.client}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('refunds.vendor')}:</span>
                        <span className="font-medium">{req.vendeur}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('refunds.email')}:</span>
                        <span className="font-medium text-xs break-all">{req.courriel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('refunds.amount')}:</span>
                        <span className="font-bold text-primary">{req.montant.toFixed(2)} CAD</span>
                      </div>
                    </div>

                    {/* Motif & Message */}
                    <div className="space-y-2 mb-3">
                      <button
                        onClick={() =>
                          req.motif &&
                          setViewContent({ title: t('refunds.refundMotive'), content: req.motif })
                        }
                        className="w-full text-left bg-gray-50 rounded p-2 text-xs hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-600 block mb-1">{t('refunds.motive')}:</span>
                        <span className="text-primary line-clamp-2">
                          {req.motif || t('refunds.noReason')}
                        </span>
                      </button>

                      {req.message && (
                        <button
                          onClick={() =>
                            setViewContent({ title: t('refunds.adminMessage'), content: req.message })
                          }
                          className="w-full text-left bg-blue-50 rounded p-2 text-xs hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <MessageCircle size={14} className="text-blue-600" />
                            <span className="text-gray-600">Message admin:</span>
                          </div>
                          <span className="text-primary line-clamp-2">{req.message}</span>
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    {req.statut === "en_attente" ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setModalRequest(req);
                            setActionType("approve");
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-1 text-xs py-2"
                        >
                          <Check size={14} /> {t('refunds.approve')}
                        </Button>
                        <Button
                          onClick={() => {
                            setModalRequest(req);
                            setActionType("refuse");
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1 text-xs py-2"
                        >
                          <X size={14} /> {t('refunds.refuse')}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-gray-500 py-2 bg-gray-50 rounded">
                        {req.statut === "approuve" ? "✅ Approuvé" : "❌ Refusé"}
                        {req.date_traitement && (
                          <> le {new Date(req.date_traitement).toLocaleDateString('fr-CA')}</>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* View Content Modal (motif / message) - Responsive */}
      {viewContent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold mb-3">{viewContent.title}</h3>
            <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base max-h-96 overflow-y-auto">
              {viewContent.content}
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewContent(null)}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80 text-sm"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for admin approval/refusal - Responsive */}
      {modalRequest && actionType && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3">
              {actionType === "approve" ? t('refunds.approve') : t('refunds.refuse')} la demande de {modalRequest.client}
            </h3>
            <div className="mb-4 p-3 bg-gray-50 rounded text-xs sm:text-sm space-y-1">
              <p><strong>{t('refunds.event')}:</strong> {modalRequest.evenement}</p>
              <p><strong>{t('refunds.amount')}:</strong> {modalRequest.montant.toFixed(2)} CAD</p>
              <p><strong>{t('refunds.motive')}:</strong> {modalRequest.motif}</p>
            </div>
            <textarea
              placeholder={t('refunds.addMessage')}
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              rows={4}
              className="w-full rounded-md p-2 mb-2 border border-gray-300 focus:ring-primary focus:border-primary text-xs sm:text-sm"
            />
            {adminMessage.length > 0 && adminMessage.length < 5 && (
              <p className="text-red-600 text-xs sm:text-sm mb-2">
                {t('refunds.messageMinLength')}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setModalRequest(null);
                  setActionType(null);
                  setAdminMessage("");
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleProcess}
                disabled={adminMessage.length < 5 || processingId === modalRequest.id}
                className={`flex-1 px-4 py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition-all ${
                  adminMessage.length < 5
                    ? "bg-gray-400 cursor-not-allowed"
                    : actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processingId === modalRequest.id ? "⏳" : t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}