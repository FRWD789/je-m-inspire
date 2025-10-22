// fontendTsx/src/components/userAprrobation.tsx
import { ArrowLeft, CheckCheck, LoaderCircle, MessageCircle, RefreshCcw, Undo2, Users } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '@/service/adminService' // ✅ AJOUTÉ

export default function AdminApprovalPage() {
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

  // ✅ MIGRÉ : Utilise adminService au lieu de useApi
  const fetchAllProfessionals = async () => {
    try {
      setLoading(true)
      const response = await adminService.getApprovals('all')
      const profData = response?.data || []
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

  // ✅ MIGRÉ : Utilise adminService au lieu de useApi
  const handleApprove = async (id: number) => {
    setProcessing(id)
    try {
      await adminService.approveProfessional(id)
      updateProfessionalState(id, 'approve')
    } finally {
      setProcessing(null)
    }
  }

  // ✅ MIGRÉ : Utilise adminService au lieu de useApi
  const handleReject = async (id: number) => {
    if (rejectionReason.length < 10) return
    setProcessing(id)
    try {
      await adminService.rejectProfessional(id, rejectionReason)
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
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'pending' && '⏳ En attente'}
            {tab === 'approved' && '✅ Approuvés'}
            {tab === 'rejected' && '❌ Rejetés'}
            {tab === 'all' && '📋 Tous'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">En attente</p>
          <p className="text-2xl font-bold text-accent">
            {allProfessionals.filter(p => !p.is_approved && !p.rejection_reason).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Approuvés</p>
          <p className="text-2xl font-bold text-green-600">
            {allProfessionals.filter(p => p.is_approved).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Rejetés</p>
          <p className="text-2xl font-bold text-red-600">
            {allProfessionals.filter(p => p.rejection_reason).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-800">
            {allProfessionals.length}
          </p>
        </div>
      </div>

      {/* Table */}
      {professionals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500">Aucun professionnel dans cette catégorie</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Professionnel</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Ville</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Motivation</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
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
                <p className="text-gray-700 mb-4 whitespace-pre-line">
                  {showModal.user.motivation_letter || 'Aucune lettre de motivation fournie'}
                </p>
                <button
                  onClick={() => setShowModal(null)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Fermer
                </button>
              </>
            )}

            {showModal.type === 'reject' && (
              <>
                <h2 className="text-xl font-bold mb-4">Rejeter le professionnel</h2>
                <p className="text-gray-600 mb-4">
                  Veuillez fournir une raison pour le rejet (minimum 10 caractères)
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Raison du rejet..."
                  className="w-full p-3 border border-gray-300 rounded-md mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleReject(showModal.user.id)}
                    disabled={rejectionReason.length < 10 || processing === showModal.user.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {processing === showModal.user.id ? (
                      <LoaderCircle className="animate-spin mx-auto" size={20} />
                    ) : (
                      'Confirmer'
                    )}
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
