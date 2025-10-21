// fontendTsx/src/components/userAprrobation.tsx
import { useAuth, useApi } from '@/context/AuthContext'
import { ArrowLeft, CheckCheck, LoaderCircle, MessageCircle, RefreshCcw, Undo2, Users } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminApprovalPage() {
  const { get, post } = useApi() // ✅ Utilise useApi au lieu de usePrivateApi
  const navigate = useNavigate()

  const [allProfessionals, setAllProfessionals] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
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
      const response = await get('/admin/approvals', { params: { status: 'all' } })
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
      await post(`/admin/approvals/${id}/approve`)
      updateProfessionalState(id, 'approve')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: number) => {
    if (rejectionReason.length < 10) return
    setProcessing(id)
    try {
      await post(`/admin/approvals/${id}/reject`, { reason: rejectionReason })
      updateProfessionalState(id, 'reject', rejectionReason)
      setShowModal(null)
      setRejectionReason('')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-2xl font-medium flex flex-col gap-y-2 place-content-center justify-center items-center">
        <LoaderCircle className="animate-spin w-12 h-12 text-accent" />
        <p>Chargement des professionnels...</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={32} />
            Gestion des Professionnels
          </h1>
        </div>
        <button
          onClick={fetchAllProfessionals}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-primary transition"
        >
          <RefreshCcw size={16} />
          Actualiser
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`px-4 py-2 rounded-md font-medium transition ${
              currentTab === tab
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab === 'pending' && '⏳ En attente'}
            {tab === 'approved' && '✅ Approuvés'}
            {tab === 'rejected' && '❌ Rejetés'}
            {tab === 'all' && '📋 Tous'}
            <span className="ml-2 text-xs bg-white text-gray-800 px-2 py-0.5 rounded-full">
              {allProfessionals.filter(pro => {
                if (tab === 'pending') return !pro.is_approved && !pro.rejection_reason
                if (tab === 'approved') return pro.is_approved
                if (tab === 'rejected') return !!pro.rejection_reason
                return true
              }).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {professionals.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
          <p className="text-xl">Aucun professionnel dans cette catégorie.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ville</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Lettre de motivation</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map(pro => (
                <tr key={pro.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {pro.profile_picture ? (
                        <img
                          src={`http://localhost:8000/storage/${pro.profile_picture}`}
                          alt={pro.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                          {pro.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="font-medium">{pro.name} {pro.last_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{pro.email}</td>
                  <td className="py-3 px-4 text-gray-600">{pro.city || 'Non renseigné'}</td>
                  <td className="py-3 px-4">
                    <div
                      className="cursor-pointer text-accent hover:underline flex items-center gap-1"
                      onClick={() => setShowModal({ type: 'view', user: pro })}
                    >
                      <MessageCircle size={16} />
                      {pro.motivation_letter
                        ? pro.motivation_letter.slice(0, 40) + (pro.motivation_letter.length > 40 ? "..." : "")
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
                          className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm disabled:bg-gray-400"
                        >
                          {processing === pro.id ? <LoaderCircle className="animate-spin" size={16} /> : 'Approuver'}
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
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {showModal.type === 'view' && (
              <>
                <h2 className="text-xl font-bold mb-4">Lettre de motivation</h2>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {showModal.user.motivation_letter || 'Aucune lettre de motivation'}
                </p>
                <button
                  onClick={() => setShowModal(null)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Fermer
                </button>
              </>
            )}

            {showModal.type === 'reject' && (
              <>
                <h2 className="text-xl font-bold mb-4">Raison du rejet</h2>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous rejetez cette demande (min 10 caractères)..."
                  className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[120px]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(showModal.user.id)}
                    disabled={rejectionReason.length < 10 || processing === showModal.user.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {processing === showModal.user.id ? <LoaderCircle className="animate-spin mx-auto" size={20} /> : 'Confirmer le rejet'}
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(null)
                      setRejectionReason('')
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}