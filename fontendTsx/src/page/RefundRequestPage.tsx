import React, { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import usePrivateApi from "@/hooks/usePrivateApi";
import { useLocation } from "react-router-dom";
import { ReservationService } from "@/service/reservationService";
import { RefundService } from "@/service/refundService";
import Button from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function RefundRequestPage() {
  const privateApi = usePrivateApi();
  const reservationService = ReservationService(privateApi);
  const refundService = RefundService(privateApi);
  const { t } = useTranslation();

  const location = useLocation();
  const reservationIdFromState = location.state?.reservationId || null;

  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [motif, setMotif] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  // Check if reCAPTCHA is configured
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const isRecaptchaEnabled = Boolean(recaptchaSiteKey);

  // Fetch eligible reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await reservationService.getMyReservations();
        const eligible = (res.reservations || []).filter(
          (r: any) => r.statut_paiement === "paid" && r.peut_annuler
        );
        setReservations(eligible);

        if (reservationIdFromState) {
          const found = eligible.find((r) => r.id === reservationIdFromState);
          if (found) setSelectedReservationId(found.id);
        }
      } catch (err) {
        console.error(err);
        setError(t("common.somethingWentWrong"));
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

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

      // Refresh list
      const res = await reservationService.getMyReservations();
      const eligible = (res.reservations || []).filter(
        (r: any) => r.statut_paiement === "paid" && r.peut_annuler
      );
      setReservations(eligible);
    } catch (err) {
      console.error(err);
      alert(t("refunds.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-6">{t("common.loading")}</p>;
  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;
  if (reservations.length === 0)
    return <p className="text-center mt-6">{t("refunds.noReservations")}</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        {t("dashboard.refundRequest")}
      </h1>

      {/* Reservation select */}
      <div className="mb-4">
        <label htmlFor="reservation" className="block mb-2 font-medium text-gray-700">
          {t("refunds.selectReservation")}
        </label>
        <select
          id="reservation"
          value={selectedReservationId || ""}
          onChange={(e) => setSelectedReservationId(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">{t("common.chooseOption") || "--"}</option>
          {reservations.map((r) => (
            <option key={r.id} value={r.id}>
              {r.event_name}
            </option>
          ))}
        </select>
      </div>

      {/* Motif textarea */}
      <div className="mb-4">
        <label htmlFor="motif" className="block mb-2 font-medium text-gray-700">
          {t("refunds.reason")}
        </label>
        <textarea
          id="motif"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400"
          placeholder={t("refunds.reasonPlaceholder")}
        />
      </div>

      {/* reCAPTCHA */}
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
        className="bg-indigo-600 text-white w-full hover:bg-indigo-700"
        disabled={!selectedReservationId || !motif.trim() || submitting || (isRecaptchaEnabled && !captchaToken)}
      >
        {submitting ? t("refunds.submitting") : t("refunds.submit")}
      </Button>
    </div>
  );
}