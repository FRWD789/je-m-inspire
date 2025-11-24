import { Calendar, Edit3, Eye, Layers, MapPin, Settings, XCircle, CheckCircle, Clock, Download, Printer, X } from "lucide-react"
import { formatEventDate } from "../utils/date"
import type { Event } from "@/types/events"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { privateApi } from "@/api/api"

type EventCardProps = {
  event: Event
  onEdit?: (event: Event) => void
  onDelete?: (id: number | string) => void
  onCancelReservation?: (reservationId: number) => void
  isReservation?: boolean
  has_refund_request?: boolean
  refund_status?: string
}

export default function ProfessionalEventCard({ 
  event, 
  onEdit,
  isReservation = false 
}: EventCardProps) {

  let thumbnail = event.thumbnail || event.thumbnail_path;
  if (thumbnail && !thumbnail.startsWith("http")) {
    thumbnail = `http://localhost:8000/storage/${thumbnail}`;
  }
  
  const startDate = formatEventDate(event.start_date)
  const endDate = formatEventDate(event.end_date)
  const navigate = useNavigate()
  
  // États pour le popup de gestion
  const [showManagePopup, setShowManagePopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  // Télécharger la liste des participants en PDF
  const handleDownloadParticipants = async () => {
    try {
      setLoading(true)
      const response = await privateApi.get(`/events/${event.id}/participants/pdf`, {
        responseType: 'blob'
      })
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `participants_${event.name}_${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      alert('Liste des participants téléchargée avec succès !')
      setShowManagePopup(false)
    } catch (error: any) {
      console.error('Erreur téléchargement participants:', error)
      alert(error.response?.data?.message || 'Erreur lors du téléchargement de la liste')
    } finally {
      setLoading(false)
    }
  }

  // Imprimer la liste des participants
  const handlePrintParticipants = async () => {
    try {
      setLoading(true)
      const response = await privateApi.get(`/events/${event.id}/participants/pdf`, {
        responseType: 'blob'
      })
      
      // Créer un URL pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]))
      
      // Ouvrir dans une nouvelle fenêtre et déclencher l'impression
      const printWindow = window.open(url)
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print()
        })
      }
      
      setShowManagePopup(false)
    } catch (error: any) {
      console.error('Erreur impression participants:', error)
      alert(error.response?.data?.message || 'Erreur lors de l\'impression de la liste')
    } finally {
      setLoading(false)
    }
  }

  // Annuler l'événement
  const handleCancelEvent = async () => {
    const confirmMessage = 
      "⚠️ ATTENTION : Cette action va :\n\n" +
      "1. Masquer l'événement pour les nouveaux utilisateurs\n" +
      "2. Créer des demandes de remboursement pour tous les participants\n" +
      "3. Vous devrez rembourser manuellement chaque participant\n\n" +
      "Êtes-vous sûr de vouloir annuler cet événement ?"
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setCancelLoading(true)
      const response = await privateApi.post(`/events/${event.id}/cancel`)
      
      alert(
        `✅ Événement annulé avec succès !\n\n` +
        `${response.data.participants_count} demande(s) de remboursement créée(s).\n` +
        `Vous recevrez un email avec la liste des participants à rembourser.`
      )
      
      setShowManagePopup(false)
      
      // Recharger la page pour refléter les changements
      window.location.reload()
    } catch (error: any) {
      console.error('Erreur annulation événement:', error)
      alert(error.response?.data?.message || 'Erreur lors de l\'annulation de l\'événement')
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden w-full rounded-lg md:rounded-[4px] bg-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
        
        {/* Thumbnail */}
        <div className="h-32 sm:h-40 md:h-44 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={event.name}
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

          {/* Price */}
          <div className="pt-1.5 sm:pt-2">
            <span className="text-lg sm:text-xl font-bold text-primary">
              {Number(event.base_price || 0) > 0 
                ? `${Number(event.base_price || 0).toFixed(2)} $` 
                : 'Gratuit'}
            </span>
          </div>

          {/* View Details Button */}
          <button
            onClick={() => navigate('/events/' + event.id)}
            className="w-full flex items-center justify-center gap-2 rounded-md md:rounded-[4px] bg-accent px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-primary transition-colors active:scale-95"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>Voir détails</span>
          </button>

          {/* Professional Controls */}
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
                onClick={() => setShowManagePopup(true)}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 rounded-md md:rounded-[4px] bg-blue-600 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 transition-colors active:scale-95"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Gérer</span>
                <span className="sm:hidden">Gérer</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Popup de gestion */}
      {showManagePopup && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Gérer l'événement</h3>
              <button
                onClick={() => setShowManagePopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Event Name */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700 truncate">{event.name}</p>
            </div>

            {/* Options */}
            <div className="p-4 space-y-3">
              {/* Option 1: Télécharger PDF */}
              <button
                onClick={handleDownloadParticipants}
                disabled={loading || cancelLoading}
                className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800">Télécharger la liste</p>
                  <p className="text-xs text-gray-500">PDF des participants</p>
                </div>
              </button>

              {/* Option 2: Imprimer PDF */}
              <button
                onClick={handlePrintParticipants}
                disabled={loading || cancelLoading}
                className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800">Imprimer la liste</p>
                  <p className="text-xs text-gray-500">Impression directe</p>
                </div>
              </button>

              {/* Option 3: Annuler l'événement */}
              <button
                onClick={handleCancelEvent}
                disabled={loading || cancelLoading}
                className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800">Annuler l'événement</p>
                  <p className="text-xs text-gray-500">Masquer et rembourser participants</p>
                </div>
              </button>
            </div>

            {/* Loading indicator */}
            {(loading || cancelLoading) && (
              <div className="px-4 pb-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary"></div>
                  <span>{cancelLoading ? 'Annulation en cours...' : 'Traitement...'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}