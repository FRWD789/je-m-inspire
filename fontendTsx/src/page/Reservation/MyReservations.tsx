import React, { useEffect, useState } from "react";
import usePrivateApi from "@/hooks/usePrivateApi";
import { ReservationService } from "@/service/ReservationService";
import EventCard from "@/components/events/EventCard";

export default function MyReservations() {
  const privateApi = usePrivateApi();
  const service = ReservationService(privateApi);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await service.getMyReservations();
        setReservations(res.reservations || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos réservations.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);
 

  if (loading)
    return <p className="text-center mt-6">Chargement de vos réservations...</p>;
  if (error)
    return <p className="text-red-500 text-center mt-6">{error}</p>;
  if (reservations.length === 0)
    return <p className="text-center mt-6">Aucune réservation trouvée.</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">Mes Réservations</h1>

      <div className="grid gap-6">
        {reservations.map((r) => (
          <EventCard
            key={r.id}
            orientation="horizontale"
            event={{
              ...r.event,
              // add reservation-specific info for EventCard
              reservation_quantity: r.quantity,
              reservation_total: r.total_price,
              reservation_status: r.statut_paiement,
              peut_annuler: r.peut_annuler,
            }}
            onCancel={handleCancel}
            className="hover:shadow-lg transition"
            onEdit={r.peut_annuler ? () => alert("Annuler réservation") : undefined}
            mode="reservation"
          />
        ))}
      </div>
    </div>
  );
}
