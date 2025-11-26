import { privateApi } from '@/api/api'
import type { User } from '@/types/user'
import { ArrowLeft, CheckCheck, LoaderCircle, MessageCircle, RefreshCcw, Users } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminApprovalPage() {
  const navigate = useNavigate()

  const [allProfessionals, setAllProfessionals] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [showModal, setShowModal] = useState<any | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [currentTab, setCurrentTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')

  useEffect(() => {
    fetchAllProfessionals()
  }, [])

  useEffect(() => {
    filterProfessionals(currentTab)
  }, [currentTab, allProfessionals])

  const fetchAllProfessionals = async () => {
    try {
      setLoading(true)
      const response = await privateApi.get('/admin/approvals', { params: { status: 'all' } })
      const profData = response.data?.data || []
      setAllProfessionals(Array.isArray(profData) ? profData : [])
    } catch {
      setAllProfessionals([])
    } finally {
      setLoading(false)
    }
  }

  const filterProfessionals = (tab: string) => {
    const filtered = allProfessionals.filter(pro => {
      // Utiliser admin.is_approved au lieu de is_approved direct
      const isApproved = pro.admin?.is_approved
      const rejectionReason = pro.admin?.rejection_reason

      if (tab === 'pending') return !isApproved && !rejectionReason
      if (tab === 'approved') return isApproved
      if (tab === 'rejected') return !!rejectionReason
      return true
    })
    setProfessionals(filtered)
  }

  const updateProfessionalState = (id: number, status: 'approve' | 'reject', reason?: string) => {
    setAllProfessionals(prev =>
      prev.map(pro => {
        if (pro.id !== id) return pro
        if (status === 'approve') {
          return {
            ...pro,
            admin: { ...pro.admin, is_approved: true, rejection_reason: null }
          }
        }
        if (status === 'reject') {
          return {
            ...pro,
            admin: { ...pro.admin, is_approved: false, rejection_reason: reason }
          }
        }
        return pro
      })
    )
  }

  const handleApprove = async (id: number) => {
    setProcessing(id)
    try {
      await privateApi.post(`/admin/approvals/${id}/approve`)
      updateProfessionalState(id, 'approve')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: number) => {
    if (rejectionReason.length < 10) return
    setProcessing(id)
    try {
      await privateApi.post(`/admin/approvals/${id}/reject`, { reason: rejectionReason })
      updateProfessionalState(id, 'reject', rejectionReason)
      setShowModal(null)
      setRejectionReason('')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <LoaderCircle className='animate-spin text-accent' size={30} />
        <p className="mt-4 text-xl font-medium">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header + Stats */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                <Users className="hidden sm:block" /> Approbation des Professionnels
              </h1>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                <span className="bg-yellow-50 px-2 py-1 rounded">
                  En attente: <strong>{allProfessionals.filter(p => !p.admin?.is_approved && !p.admin?.rejection_reason).length}</strong>
                </span>
                <span className="bg-green-50 px-2 py-1 rounded">
                  Approuvés: <strong>{allProfessionals.filter(p => p.admin?.is_approved).length}</strong>
                </span>
                <span className="bg-red-50 px-2 py-1 rounded">
                  Rejetés: <strong>{allProfessionals.filter(p => p.admin?.rejection_reason).length}</strong>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchAllProfessionals}
                className="flex-1 sm:flex-none px-3 py-2 rounded-md bg-primary/60 text-white hover:bg-primary/80 transition-all text-sm flex items-center justify-center gap-2"
              >
                <RefreshCcw size={15} />
                <span className="hidden sm:inline">Rafraîchir</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 sm:flex-none px-3 py-2 rounded-md bg-accent/60 text-white hover:bg-accent/80 transition-all text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Retour</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { key: 'pending', label: 'En attente' },
            { key: 'approved', label: 'Approuvés' },
            { key: 'rejected', label: 'Rejetés' },
            { key: 'all', label: 'Tous' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`px-2 sm:px-4 py-2 rounded-md font-medium text-xs sm:text-sm transition-colors ${
                currentTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
              onClick={() => setCurrentTab(tab.key as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {professionals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-200 py-12 text-center">
            <CheckCheck size={40} className="mx-auto text-accent mb-4" />
            <h2 className="text-lg font-semibold mb-2">Aucune demande trouvée</h2>
            <p className="text-gray-500">Aucun professionnel correspondant à ce filtre</p>
          </div>
        ) : (
          <>
            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700 text-left">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Nom</th>
                      <th className="py-3 px-4 font-semibold">Email</th>
                      <th className="py-3 px-4 font-semibold">Ville</th>
                      <th className="py-3 px-4 font-semibold">Inscription</th>
                      <th className="py-3 px-4 font-semibold">Message</th>
                      <th className="py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professionals.map(pro => (
                      <tr key={pro.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">{pro.profile.last_name || ''}</td>
                        <td className="py-3 px-4">{pro.profile.email}</td>
                        <td className="py-3 px-4">{pro.profile.city || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {pro.timestamps.created_at ? new Date(pro.timestamps.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td
                          className="py-3 px-4 cursor-pointer text-primary hover:underline max-w-[200px] truncate"
                          title={pro.admin?.motivation_letter || ''}
                          onClick={() => setShowModal({ type: 'message', content: pro.admin?.motivation_letter })}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <MessageCircle size={18} />
                            {pro.admin?.motivation_letter
                              ? pro.admin.motivation_letter.slice(0, 40) + (pro.admin.motivation_letter.length > 40 ? "..." : "")
                              : "Aucun message"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {renderActions(pro)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards (hidden on desktop) */}
            <div className="lg:hidden space-y-4">
              {professionals.map(pro => (
                <div key={pro.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{pro.profile.last_name}</h3>
                      <p className="text-sm text-gray-600">{pro.profile.email}</p>
                    </div>
                    {renderStatusBadge(pro)}
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ville:</span>
                      <span className="text-gray-900">{pro.profile.city || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Inscription:</span>
                      <span className="text-gray-900">
                        {pro.timestamps.created_at ? new Date(pro.timestamps.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                      </span>
                    </div>
                    {pro.admin?.motivation_letter && (
                      <div>
                        <button
                          onClick={() => setShowModal({ type: 'message', content: pro.admin.motivation_letter })}
                          className="text-primary hover:underline flex items-center gap-2 text-sm"
                        >
                          <MessageCircle size={16} />
                          Voir le message
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {renderActions(pro, true)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Message Modal */}
        {showModal?.type === 'message' && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg border border-secondary/30">
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                <MessageCircle size={22} className="text-accent" /> Message du professionnel
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm max-h-[400px] overflow-y-auto break-words">
                {showModal.content || "Aucun message"}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 rounded-lg bg-secondary text-white hover:opacity-90 transition-all text-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showModal?.type === 'reject' && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
              <h3 className="text-lg font-semibold mb-3">
                Rejeter {showModal.user.profile.last_name || 'cet utilisateur'}
              </h3>
              <p className="text-red-600 bg-red-50 border border-red-100 rounded-md p-3 text-sm mb-4">
                ⚠️ Attention : Le compte sera rejeté et l'utilisateur sera informé.
              </p>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Raison du rejet (minimum 10 caractères)..."
                rows={4}
                className={`w-full rounded-md p-2 mb-2 border ${
                  rejectionReason.length < 10
                    ? 'border-red-400 focus:ring-red-400 focus:border-red-500'
                    : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                } text-sm`}
              />
              <small className="text-gray-500 mb-4 block">
                {rejectionReason.length}/500 caractères
              </small>
              {rejectionReason.length < 10 && (
                <p className="text-red-600 text-sm mb-2">
                  La raison doit comporter au moins 10 caractères.
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleReject(showModal.user.id)}
                  disabled={rejectionReason.length < 10 || processing === showModal.user.id}
                  className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                    rejectionReason.length < 10
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-[#A4031F]/70 hover:bg-[#A4031F]/90'
                  }`}
                >
                  {processing === showModal.user.id ? '⏳' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Helper functions
  function renderStatusBadge(pro: any) {
    const isApproved = pro.admin?.is_approved
    const rejectionReason = pro.admin?.rejection_reason

    if (isApproved) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
          Approuvé
        </span>
      )
    }
    if (rejectionReason) {
      return (
        <span
          className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold cursor-help"
          title={`Raison: ${rejectionReason}`}
        >
          Rejeté
        </span>
      )
    }
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
        En attente
      </span>
    )
  }

  function renderActions(pro: any, isMobile: boolean = false) {
    const isApproved = pro.admin?.is_approved
    const rejectionReason = pro.admin?.rejection_reason
    const buttonClass = isMobile ? 'flex-1' : ''

    // Pending
    if (!isApproved && !rejectionReason) {
      return (
        <>
          <button
            onClick={() => handleApprove(pro.id)}
            disabled={processing === pro.id}
            className={`${buttonClass} px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm disabled:opacity-50`}
          >
            Approuver
          </button>
          <button
            onClick={() => setShowModal({ type: 'reject', user: pro })}
            disabled={processing === pro.id}
            className={`${buttonClass} px-3 py-1.5 rounded-md bg-[#A4031F]/70 text-white hover:bg-[#A4031F]/90 text-sm disabled:opacity-50`}
          >
            Rejeter
          </button>
        </>
      )
    }

    // Approved
    if (isApproved) {
      return (
        <button
          onClick={() => setShowModal({ type: 'reject', user: pro })}
          disabled={processing === pro.id}
          className={`${buttonClass} px-3 py-1.5 rounded-md bg-[#A4031F]/70 text-white hover:bg-[#A4031F]/90 text-sm disabled:opacity-50 pr-3`}
        >
          Révoquer
        </button>
      )
    }

    // Rejected
    if (rejectionReason && !isApproved) {
      return (
        <button
          onClick={() => handleApprove(pro.id)}
          disabled={processing === pro.id}
          className={`${buttonClass} px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm disabled:opacity-50`}
        >
          Ré-approuver
        </button>
      )
    }

    return null
  }
}