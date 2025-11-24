import { privateApi } from '@/api/api'
import {
  ArrowLeft,
  LoaderCircle,
  RefreshCcw,
  DollarSign,
  Users,
  TrendingUp,
  Edit2,
  Save,
  X,
  CheckCircle
} from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Commission {
  id: number
  paiement_id: number
  date: string
  event_name: string
  event_id: number | null
  customer_name: string
  vendor_id: number
  vendor_name: string
  montant_total: number
  taux_commission: number
  montant_commission: number
  montant_net: number
  payment_method: string
  vendor_has_stripe: boolean
  vendor_has_paypal: boolean
  vendor_stripe_id: string | null
  vendor_paypal_id: string | null
  vendor_paypal_email: string | null
}

interface Professional {
  id: number
  name: string
  email: string
  commission_rate: number
  has_pro_plus: boolean
  has_stripe: boolean
  has_paypal: boolean
  is_approved: boolean
}

interface Stats {
  total_a_transferer: number
  nombre_paiements: number
  total_commissions: number
}

export default function AdminCommissionPage() {
  const navigate = useNavigate()

  // États pour les commissions
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)
  
  // États pour les professionnels
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  
  // États généraux
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState<'transfers' | 'rates'>('transfers')

  useEffect(() => {
    if (currentTab === 'transfers') {
      fetchPendingTransfers()
    } else {
      fetchProfessionals()
    }
  }, [currentTab])

  const fetchPendingTransfers = async () => {
    try {
      setLoading(true)
      const res = await privateApi.get('/admin/commissions/pending-transfers')
      
      console.log('[Debug] Réponse API pending-transfers:', res.data)
      
      // Gérer différentes structures de réponse possibles
      const data = res.data.data || res.data
      const commissionsData = data.commissions || []
      const statsData = data.stats || null
      
      setCommissions(commissionsData)
      setStats(statsData)
    } catch (err: any) {
      console.error('Erreur lors du chargement des commissions:', err)
      console.error('Réponse complète:', err.response?.data)
      alert('Erreur lors du chargement des commissions')
    } finally {
      setLoading(false)
    }
  }

  const fetchProfessionals = async () => {
    try {
      setLoading(true)
      const res = await privateApi.get('/admin/commissions/professionals')
      
      console.log('[Debug] Réponse API professionals:', res.data)
      
      // Gérer différentes structures de réponse possibles
      const data = res.data.data || res.data
      const professionalsData = data.professionals || []
      
      setProfessionals(professionalsData)
    } catch (err: any) {
      console.error('Erreur lors du chargement des professionnels:', err)
      console.error('Réponse complète:', err.response?.data)
      alert('Erreur lors du chargement des professionnels')
    } finally {
      setLoading(false)
    }
  }

  const markCommissionAsPaid = async (id: number) => {
    if (!confirm('Confirmer que vous avez transféré ce paiement au vendeur ?')) {
      return
    }

    try {
      setProcessingId(id)
      const res = await privateApi.post(`/admin/commissions/${id}/mark-as-paid`)
      
      console.log('[Debug] Réponse mark-as-paid:', res.data)
      
      // Retirer la commission de la liste
      setCommissions(prev => prev.filter(c => c.id !== id))
      
      // Mettre à jour les stats
      if (stats) {
        const commission = commissions.find(c => c.id === id)
        if (commission) {
          setStats({
            total_a_transferer: stats.total_a_transferer - commission.montant_net,
            nombre_paiements: stats.nombre_paiements - 1,
            total_commissions: stats.total_commissions - commission.montant_commission
          })
        }
      }
      
      alert('Commission marquée comme payée avec succès')
    } catch (err: any) {
      console.error('Erreur lors du marquage:', err)
      console.error('Réponse complète:', err.response?.data)
      alert(`Erreur : ${err.response?.data?.message || 'Erreur lors du marquage de la commission'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const startEdit = (id: number, currentRate: number) => {
    setEditingId(id)
    setEditValue(currentRate)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue(0)
  }

  const saveCommissionRate = async (userId: number) => {
    try {
      setSaving(true)
      const res = await privateApi.put(`/admin/commissions/professionals/${userId}`, {
        commission_rate: editValue
      })
      
      console.log('[Debug] Réponse update rate:', res.data)
      
      // Mettre à jour localement
      setProfessionals(prev =>
        prev.map(p => (p.id === userId ? { ...p, commission_rate: editValue } : p))
      )
      
      setEditingId(null)
      alert('Taux de commission mis à jour avec succès')
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err)
      console.error('Réponse complète:', err.response?.data)
      alert(`Erreur : ${err.response?.data?.message || 'Erreur lors de la mise à jour du taux'}`)
    } finally {
      setSaving(false)
    }
  }

  const refresh = () => {
    if (currentTab === 'transfers') {
      fetchPendingTransfers()
    } else {
      fetchProfessionals()
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-2xl font-medium flex flex-col gap-y-2 items-center text-gray-600">
        <LoaderCircle className="animate-spin text-accent" size={30} />
        Chargement...
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <DollarSign /> Gestion des Commissions
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Gérez les paiements à transférer et les taux de commission
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="px-3 py-2 rounded-md bg-primary/70 text-white hover:bg-primary/90 flex items-center gap-2 text-sm"
          >
            <RefreshCcw size={15} /> Rafraîchir
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 rounded-md bg-accent/70 text-white hover:bg-accent/90 flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={15} /> Retour
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          className={`px-6 py-3 rounded-md font-medium flex items-center gap-2 ${
            currentTab === 'transfers'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setCurrentTab('transfers')}
        >
          <TrendingUp size={18} />
          Paiements à transférer
        </button>
        <button
          className={`px-6 py-3 rounded-md font-medium flex items-center gap-2 ${
            currentTab === 'rates'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setCurrentTab('rates')}
        >
          <Users size={18} />
          Taux de commission
        </button>
      </div>

      {/* Onglet 1: Paiements à transférer */}
      {currentTab === 'transfers' && (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                <DollarSign className="text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Total à transférer</p>
                  <h3 className="text-lg font-semibold">{stats.total_a_transferer.toFixed(2)} $</h3>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                <TrendingUp className="text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Nombre de paiements</p>
                  <h3 className="text-lg font-semibold">{stats.nombre_paiements}</h3>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                <DollarSign className="text-accent" />
                <div>
                  <p className="text-sm text-gray-500">Commissions prélevées</p>
                  <h3 className="text-lg font-semibold">{stats.total_commissions.toFixed(2)} $</h3>
                </div>
              </div>
            </div>
          )}

          {/* Table commissions */}
          {commissions.length === 0 ? (
            <div className="text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg py-16">
              <h2 className="text-lg font-semibold mb-2">Aucun paiement à transférer</h2>
              <p className="text-gray-500">
                Tous les professionnels avec Pro Plus et comptes liés reçoivent déjà les paiements directement.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 text-left">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Événement</th>
                    <th className="py-3 px-4 font-semibold">Client</th>
                    <th className="py-3 px-4 font-semibold">Vendeur</th>
                    <th className="py-3 px-4 font-semibold">Montant total</th>
                    <th className="py-3 px-4 font-semibold">Commission</th>
                    <th className="py-3 px-4 font-semibold">À transférer</th>
                    <th className="py-3 px-4 font-semibold">Méthode</th>
                    <th className="py-3 px-4 font-semibold">Comptes liés</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(c => (
                    <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(c.date).toLocaleDateString('fr-CA')}
                      </td>
                      <td className="py-3 px-4">{c.event_name}</td>
                      <td className="py-3 px-4">{c.customer_name}</td>
                      <td className="py-3 px-4">{c.vendor_name}</td>
                      <td className="py-3 px-4">{c.montant_total.toFixed(2)} $</td>
                      <td className="py-3 px-4">
                        {c.montant_commission.toFixed(2)} $ ({c.taux_commission}%)
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-700">
                        {c.montant_net.toFixed(2)} $
                      </td>
                      <td className="py-3 px-4">{c.payment_method}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {c.vendor_has_stripe && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                              Stripe
                            </span>
                          )}
                          {c.vendor_has_paypal && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                              PayPal
                            </span>
                          )}
                          {!c.vendor_has_stripe && !c.vendor_has_paypal && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                              Aucun
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => markCommissionAsPaid(c.id)}
                          disabled={processingId === c.id}
                          className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === c.id ? (
                            <>
                              <LoaderCircle size={14} className="animate-spin" />
                              Traitement...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={14} />
                              Marquer comme payé
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Onglet 2: Taux de commission */}
      {currentTab === 'rates' && (
        <>
          {professionals.length === 0 ? (
            <div className="text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg py-16">
              <h2 className="text-lg font-semibold mb-2">Aucun professionnel trouvé</h2>
              <p className="text-gray-500">Il n'y a actuellement aucun professionnel enregistré.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 text-left">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Nom</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Taux actuel</th>
                    <th className="py-3 px-4 font-semibold">Statut</th>
                    <th className="py-3 px-4 font-semibold">Comptes</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {professionals.map(pro => (
                    <tr key={pro.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{pro.name}</td>
                      <td className="py-3 px-4">{pro.email}</td>
                      <td className="py-3 px-4">
                        {editingId === pro.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={editValue}
                              onChange={e => setEditValue(parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded"
                            />
                            <span>%</span>
                          </div>
                        ) : (
                          <span className="font-semibold">{pro.commission_rate}%</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {pro.has_pro_plus && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                              Pro Plus
                            </span>
                          )}
                          {!pro.is_approved && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                              Non approuvé
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {pro.has_stripe && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                              Stripe
                            </span>
                          )}
                          {pro.has_paypal && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                              PayPal
                            </span>
                          )}
                          {!pro.has_stripe && !pro.has_paypal && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              Aucun
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {editingId === pro.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveCommissionRate(pro.id)}
                              disabled={saving}
                              className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-1 text-xs"
                            >
                              <Save size={14} /> Enregistrer
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={saving}
                              className="px-3 py-1.5 rounded-md bg-gray-400 text-white hover:bg-gray-500 flex items-center gap-1 text-xs"
                            >
                              <X size={14} /> Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(pro.id, pro.commission_rate)}
                            className="px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 flex items-center gap-1 text-xs"
                          >
                            <Edit2 size={14} /> Modifier
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}