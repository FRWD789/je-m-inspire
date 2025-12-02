import { Calendar, Edit3, Eye, Layers, MapPin, Trash2, XCircle, CheckCircle, Clock } from "lucide-react"
import { formatEventDate } from "../utils/date"
import type { Event } from "@/types/events"
import { useNavigate } from "react-router-dom"

type EventCardProps = {
  event: Event
  onEdit?: (event: Event) => void
  onDelete?: (id: number | string) => void
  onCancelReservation?: (reservationId: number) => void
  isReservation?: boolean
  has_refund_request?: boolean
  refund_status?: string
}

export default function EventCard({ 
  event, 
  onEdit, 
  onDelete,
  onCancelReservation,
  isReservation = false 
}: EventCardProps) {

  let thumbnail = event.thumbnail || event.thumbnail_path ;
  if (thumbnail && !thumbnail.startsWith("http")) {
    thumbnail = `http://localhost:8000/storage/${thumbnail}`;
  }
  const startDate = formatEventDate(event.start_date)
  const endDate = formatEventDate(event.end_date)
  const navigate = useNavigate()
 
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé'
      case 'pending':
        return 'En attente'
      case 'failed':
        return 'Échoué'
      default:
        return status
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden w-full rounded-lg md:rounded-[4px] bg-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
      {/* Reservation Badge */}
      {isReservation && event.payment_status && (
        <div className="absolute top-2 right-2 z-10">
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(event.payment_status)}`}>
            {getPaymentStatusText(event.payment_status)}
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="h-32 sm:h-40 md:h-44 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={event.name}
            loading="lazy"          
            decoding="async" 
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Layers className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 opacity-30" />
              <p className="text-xs sm:text-sm font-medium">Aucune image</p>
            </div>
          </div>
        )}
      </div>

      {/* Event Info */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        {/* Title */}
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 truncate line-clamp-2">
          {event.name}
        </h2>

        {/* Category & Level */}
        <div className="flex items-center text-xs sm:text-sm text-gray-600 gap-1">
          <Layers className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{event.categorie?.name} · Niveau {event.level}</span>
        </div>

        {/* Location */}
        <div className="flex items-center text-xs sm:text-sm text-gray-500 gap-1 truncate">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{event.localisation?.name}</span>
        </div>

        {/* Date */}
        <div className="flex items-center text-xs sm:text-sm text-gray-500 gap-1">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">Du {startDate} au {endDate}</span>
        </div>

        {/* Reservation Details */}
        {isReservation && (
          <div className="pt-1.5 sm:pt-2 space-y-1 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
              <span className="text-gray-600">Quantité:</span>
              <span className="font-semibold">{event.quantity || 1} place(s)</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
              <span className="text-gray-600">Total payé:</span>
              <span className="font-bold text-primary">
                {Number(event.total_price || 0).toFixed(2)} $
              </span>
            </div>
            {event.reservation_date && (
              <div className="flex items-center text-xs text-gray-500 gap-1 mt-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Réservé le {formatEventDate(event.reservation_date)}</span>
              </div>
            )}
          </div>
        )}

        {/* Price - Only show for non-reservations */}
        {!isReservation && (
          <div className="pt-1.5 sm:pt-2">
            <span className="text-lg sm:text-xl font-bold text-primary">
              {Number(event.base_price || 0) > 0 
                ? `${Number(event.base_price || 0).toFixed(2)} $` 
                : 'Gratuit'}
            </span>
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={() => navigate('/events/' + event.id)}
          className="w-full flex items-center justify-center gap-2 rounded-md md:rounded-[4px] bg-accent px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-primary transition-colors active:scale-95"
        >
          <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>Voir détails</span>
        </button>

        {/* Reservation Controls */}
        {isReservation && event.has_refund_request ? (
          <div className="w-full p-2 bg-orange-50 border border-orange-200 rounded-md md:rounded-[4px] text-center">
            <p className="text-xs font-semibold text-orange-700">
              {event.refund_status === 'en_attente' && 'Demande en cours'}
              {event.refund_status === 'approuve' && 'Remboursement approuvé'}
              {event.refund_status === 'refuse' && 'Remboursement refusée'}
              </p>
          </div>
        ) : isReservation && event.can_cancel ? (
          <button
            onClick={() => navigate('/dashboard/refunds', { state: { eventId: event.id, reservationId: event.reservation_id } })}
            className="w-full flex items-center justify-center gap-2 rounded-md md:rounded-[4px] bg-orange-500 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-orange-600 transition-colors active:scale-95"
          >
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>Demander un remboursement</span>
          </button>
        ) : null}

        {/* Creator Controls */}
        {event.is_creator && !isReservation && (
          <div className="flex gap-1.5 sm:gap-2 pt-1.5 sm:pt-2">
            <button
              onClick={() => onEdit && onEdit(event)}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 rounded-md md:rounded-[4px] bg-accent px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-primary transition-colors active:scale-95"
            >
              <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Modifier</span>
              <span className="sm:hidden">Éditer</span>
            </button>
            <button
              onClick={() => onDelete && onDelete(event.id)}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 rounded-md md:rounded-[4px] bg-red-500 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-red-600 transition-colors active:scale-95"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Supprimer</span>
              <span className="sm:hidden">Sup.</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}