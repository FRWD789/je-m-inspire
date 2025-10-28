import React, { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import usePrivateApi from "@/hooks/usePrivateApi";
import { ReservationService } from "@/service/ReservationService";
import { RefundService } from "@/service/RefundService";
import Button from "@/components/ui/button";

export default function RefundRequestPage() {
  const privateApi = usePrivateApi();
  const reservationService = ReservationService(privateApi);
  const refundService = RefundService(privateApi);

  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [motif, setMotif] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Fetch eligible reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await reservationService.getMyReservations();
        const eligible = (res.reservations || []).filter(
          (r: any) => r.statut_paiement === "paid" && r.peut_annuler
        );
        setReservations(eligible);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos réservations.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const handleSubmit = async () => {
    if (!selectedReservationId) return alert("Veuillez sélectionner une réservation.");
    if (!motif.trim()) return alert("Veuillez indiquer le motif du remboursement.");
    if (!captchaToken) return alert("Veuillez valider le reCAPTCHA avant d’envoyer.");

    setSubmitting(true);
    try {
      const reservation = reservations.find((r) => r.id === selectedReservationId);
      const montant = reservation.event.base_price * reservation.quantity;

      await refundService.requestRefund(selectedReservationId, motif, montant, captchaToken);
      alert("Demande de remboursement créée avec succès !");
      setMotif("");
      setSelectedReservationId(null);
      setCaptchaToken(null);
      // Optionally refetch reservations
      const res = await reservationService.getMyReservations();
      const eligible = (res.reservations || []).filter(
        (r: any) => r.statut_paiement === "paid" && r.peut_annuler
      );
      setReservations(eligible);
    } catch (err) {
      console.error(err);
      alert("Impossible de créer la demande de remboursement.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-6">Chargement de vos réservations...</p>;
  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;
  if (reservations.length === 0)
    return <p className="text-center mt-6">Aucune réservation éligible pour remboursement.</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">Demande de Remboursement</h1>

      {/* Reservation select */}
      <div className="mb-4">
        <label htmlFor="reservation" className="block mb-2 font-medium text-gray-700">
          Sélectionnez une réservation
        </label>
        <select
          id="reservation"
          value={selectedReservationId || ""}
          onChange={(e) => setSelectedReservationId(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- Choisissez un événement --</option>
          {reservations.map((r) => (
            <option key={r.id} value={r.id}>
              {r.event_name} ({r.quantity} place{r.quantity > 1 ? "s" : ""})
            </option>
          ))}
        </select>
      </div>

      {/* Motif textarea */}
      <div className="mb-4">
        <label htmlFor="motif" className="block mb-2 font-medium text-gray-700">
          Motif du remboursement
        </label>
        <textarea
          id="motif"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400"
          placeholder="Expliquez pourquoi vous demandez un remboursement..."
        />
      </div>

      {/* reCAPTCHA */}
      <div className="mb-6 flex justify-center">
        <ReCAPTCHA
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={(token) => setCaptchaToken(token)}
        />
      </div>

      <Button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white w-full hover:bg-indigo-700"
        disabled={!selectedReservationId || !motif.trim() || submitting || !captchaToken}
      >
        {submitting ? "Envoi..." : "Soumettre la demande"}
      </Button>
    </div>
  );
}
