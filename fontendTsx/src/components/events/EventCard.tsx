import React, { useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import Button from "../ui/button";
import Card from "../ui/card";

// --- Types ---
interface Localisation {
  name: string;
}

interface Categorie {
  name: string;
}

interface EventCardData {
  id: number;
  name: string;
  thumbnail?: string;
  thumbnail_path?: string;
  categorie?: Categorie;
  level?: string;
  localisation?: Localisation;
  start_date: string;
  end_date: string;
  base_price: number;
  available_places: number;
  max_places: number;
  is_creator?: boolean;

  // Reservation-specific
  reservation_quantity?: number;
  reservation_total?: number;
  reservation_status?: "paid" | "pending" | "failed";
  peut_annuler?: boolean;
  has_refund_request?: boolean;
  refund_status?: string;
}

type Orientation = "horizontale" | "vertical";
type CardMode = "public" | "creator" | "reservation";

interface EventCardProps {
  orientation?: Orientation;
  event: EventCardData;
  mode?: CardMode;
  onEdit?: (event: EventCardData) => void;
  onDelete?: (event: EventCardData) => void;
  onCancel?: (event: EventCardData) => void; // callback annullement
  className?: string;
}

// --- Component ---
export default function EventCard({
  orientation = "horizontale",
  mode = "public",
  event,
  onEdit,
  onDelete,
  onCancel,
  className = "",
}: EventCardProps) {
  const isHorizontal = orientation === "horizontale";
  const [loadingCancel, setLoadingCancel] = useState(false);

  // Couleur du statut de paiement
  const paymentColor =
    event.reservation_status === "paid"
      ? "text-green-600"
      : event.reservation_status === "pending"
      ? "text-yellow-600"
      : "text-red-600";

  // 🔹 Debug log
  console.log("EventCard render:", event.id, event.peut_annuler, typeof onCancel);

  return (
    <Card
      key={event.id}
      className={`flex flex-col ${isHorizontal ? "md:flex-row" : ""} items-start gap-4 p-4 hover:shadow-md transition-all duration-200 border border-gray-100 rounded-2xl bg-white ${className}`}
    >
      {/* Thumbnail */}
      <div className="w-full md:w-[120px] h-[100px] flex-shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
        {event.thumbnail || event.thumbnail_path ? (
          <img
            src={event.thumbnail || event.thumbnail_path}
            alt={event.name}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <span className="text-xs">No Image</span>
        )}
      </div>

      {/* Event info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 truncate">{event.name}</h2>
          <p className="text-sm text-gray-500 mt-1 truncate">
            {event.categorie?.name} {event.level ? `• ${event.level}` : ""}
          </p>
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-1 text-gray-500 text-sm truncate">
            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{event.localisation?.name || "Adresse non définie"}</span>
          </div>

          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Calendar size={12} className="flex-shrink-0" />
            <span>
              {new Date(event.start_date).toLocaleDateString()} → {new Date(event.end_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col items-end justify-between h-full mt-2 md:mt-0 min-w-[80px]">
        {mode === "reservation" ? (
          <div className="text-right">
            <p>
              <span className="font-semibold">Total:</span> {event.reservation_total} €
            </p>
            <p className={`mt-1 text-sm ${paymentColor}`}>
              Paiement: {event.reservation_status}
            </p>

            {/* 🔹 Bouton Annuler ou Message de demande en cours */}
            {event.has_refund_request ? (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                <p className="font-semibold">Demande en cours</p>
                <p className="text-[10px]">
                  {event.refund_status === 'en_attente' && 'En attente de traitement'}
                  {event.refund_status === 'approuve' && 'Remboursement approuvé'}
                  {event.refund_status === 'refuse' && 'Demande refusée'}
                </p>
              </div>
            ) : event.peut_annuler && onCancel ? (
              <Button
                onClick={() => {
                  console.log("EventCard: click annuler pour event", event.id);
                  onCancel(event);
                }}
                disabled={loadingCancel}
                className={`mt-2 text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white ${
                  loadingCancel ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loadingCancel ? "Annulation..." : "Demander remboursement"}
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="text-right">
              <p className="text-base font-semibold text-gray-800">{event.base_price} €</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Users size={12} />
                {event.available_places}/{event.max_places} places
              </div>
            </div>

            {mode === "creator" && (onEdit || onDelete) && (
              <div className="mt-3 flex flex-col gap-2">
                {onEdit && (
                  <Button
                    onClick={() => onEdit(event)}
                    variant="outline"
                    className="text-xs font-medium w-auto px-3 py-1"
                  >
                    Modifier
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={() => onDelete(event)}
                    className="text-xs font-medium w-auto px-3 py-1"
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
