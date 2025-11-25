import { privateApi } from '@/api/api'
import type { User } from '@/types/user'


import { ArrowLeft, CheckCheck, LoaderCircle, MessageCircle, RefreshCcw, Undo2, Users } from 'lucide-react'
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
      console.log('Fetched professionals:', response)
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
      if (tab === 'pending') return !pro.is_approved && !pro.rejection_reason
      if (tab === 'approved') return pro.is_approved
      if (tab === 'rejected') return !!pro.rejection_reason
      return true // 'all'
    })
    setProfessionals(filtered)
  }

  const updateProfessionalState = (id: number, status: 'approve' | 'reject', reason?: string) => {
    setAllProfessionals(prev =>
      prev.map(pro => {
        if (pro.id !== id) return pro
        if (status === 'approve') return { ...pro, is_approved: true, rejection_reason: null }
        if (status === 'reject') return { ...pro, is_approved: false, rejection_reason: reason }
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
      <div className="text-center py-20 text-2xl font-medium flex flex-col gap-y-2 place-content-center justify-center items-center text-gray-600">
        <LoaderCircle className='animate-spin text-accent' size={30} />Chargement...
      </div>
    )
  }

  return (
                <div className="max-w-6xl mx-auto p-6">
                  {/* Header + Stats */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <Users/> Approbation des Professionnels
                      </h1>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>En attente: {allProfessionals.filter(p => !p.is_approved && !p.rejection_reason).length}</span>
                        <span>Approuvés: {allProfessionals.filter(p => p.is_approved).length}</span>
                        <span>Rejetés: {allProfessionals.filter(p => p.rejection_reason).length}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={fetchAllProfessionals}
                        className="px-3 py-2  rounded-[4px] bg-primary/60 text-white hover:bg-primary/80 transition-all text-sm flex items-center gap-2"
                      >
                       <RefreshCcw  size={15}/>Rafraîchir
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="px-3 py-2 rounded-[4px] bg-accent/60 text-white hover:bg-accent/80 transition-all text-sm flex items-center gap-2"
                      >
                        <ArrowLeft size={15} /> Retour
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-3 mb-4">
                    {['pending', 'approved', 'rejected', 'all'].map(tab => (
                      <button
                        key={tab}
                        className={`px-4 py-2 rounded-md font-medium ${
                          currentTab === tab
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setCurrentTab(tab as any)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Empty state */}
                  {professionals.length === 0 ? (
                    <div className="text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg py-16">
                      <div className="text-5xl mb-4 flex justify-center text-accent "><CheckCheck size={40} /></div>
                      <h2 className="text-lg font-semibold mb-2">Aucune demande trouvée</h2>
                      <p className="text-gray-500">Aucun professionnel correspondant à ce filtre</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-white rounded-[4px] shadow-sm border border-gray-200">
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
                              <td className="py-3 px-4">{pro.timestamps.created_at ? new Date(pro.timestamps.created_at).toLocaleDateString('fr-FR') : 'N/A'}</td>
                              <td
                                className="py-3 px-4 cursor-pointer text-primary hover:underline max-w-[200px] truncate"
                                title={pro.admin.motivation_letter || ''}
                                onClick={() => setShowModal({ type: 'message', content: pro.admin.motivation_letter })}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <MessageCircle size={18} />
                                  {pro.admin.motivation_letter
                                    ? pro.admin.motivation_letter.slice(0, 40) + (pro.admin.motivation_letter.length > 40 ? "..." : "")
                                    : "Aucun message"}
                                </div>
                              </td>
                            <td className="py-3 px-4 flex gap-2 items-center">
                      {/* Pending */}
                      {!pro.is_approved && !pro.rejection_reason && (
                        <>
                          <button
                            onClick={() => handleApprove(pro.id)}
                            disabled={processing === pro.id}
                            className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => setShowModal({ type: 'reject', user: pro })}
                            disabled={processing === pro.id}
                            className="px-3 py-1.5 rounded-md bg-[#A4031F]/70 text-white hover:bg-[#A4031F]/90 text-sm"
                          >
                            Rejeter
                          </button>
                        </>
                      )}

                      {/* Approved */}
                      {pro.is_approved && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            Approuvé
                          </span>
                          <button
                            onClick={() => setShowModal({ type: 'reject', user: pro })}
                            disabled={processing === pro.id}
                            className="px-3 py-1.5 rounded-md bg-[#A4031F]/70 text-white hover:bg-[#A4031F]/90 text-sm"
                          >
                            Révoquer
                          </button>
                        </div>
                      )}

                    {/* Rejected */}
                    {pro.rejection_reason && !pro.is_approved && (
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold cursor-help"
                          title={`Raison du rejet: ${pro.rejection_reason}`}
                        >
                          Rejeté
                        </span>
                        <button
                          onClick={() => handleApprove(pro.id)}
                          disabled={processing === pro.id}
                          className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
                        >
                          Ré-approuver
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message Modal */}
      {showModal?.type === 'message' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg border border-secondary/30">
            <h3 className="text-lg font-headings text-primary mb-3 flex items-center gap-2">
              <MessageCircle size={22} className="text-accent" /> Message du professionnel
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg text-sm h-[300px] overflow-y-auto break-all">
              {showModal.content}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-3">
              Rejeter {showModal.user.last_name || 'cet utilisateur'}
            </h3>
            <p className="text-red-600 bg-red-50 border border-red-100 rounded-md p-3 text-sm mb-4">
              ⚠️ Attention : Le compte sera rejeté et l’utilisateur sera informé.
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
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => handleReject(showModal.user.id)}
                disabled={rejectionReason.length < 10 || processing === showModal.user.id}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                  rejectionReason.length < 10
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-[#A4031F]/70 hover:bg-[#A4031F]/90'
                }`}
              >
                {processing === showModal.user.id ? '⏳' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
