import { privateApi } from '@/api/api'
import {
  ArrowLeft,
  LoaderCircle,
  RefreshCcw,
  CheckCircle,
  DollarSign,
  Wallet,
  TrendingUp
} from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminCommissionPage() {
  const navigate = useNavigate()

  const [commissions, setCommissions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [currentTab, setCurrentTab] = useState<'all' | 'en_attente' | 'payee' | 'annulee'>('all')

  useEffect(() => {
    fetchCommissions()
  }, [])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const res = await privateApi.get('/admin/commissions')
      setCommissions(res.data.commissions || [])
      fetchStats()
    } catch (err) {
      console.error('Erreur lors du chargement des commissions:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await privateApi.get('/admin/commissions/statistics')
      setStats(res.data.stats)
    } catch {
      setStats(null)
    }
  }

  const markAsPaid = async (id: number) => {
    setProcessing(id)
    try {
      await privateApi.post(`/admin/commissions/${id}/mark-as-paid`)
      setCommissions(prev =>
        prev.map(c => (c.id === id ? { ...c, statut: 'payee' } : c))
      )
      fetchStats()
    } catch (err) {
      console.error('Erreur lors du paiement:', err)
    } finally {
      setProcessing(null)
    }
  }

  const filteredCommissions =
    currentTab === 'all'
      ? commissions
      : commissions.filter(c => c.statut === currentTab)

  if (loading) {
    return (
      <div className="text-center py-20 text-2xl font-medium flex flex-col gap-y-2 items-center text-gray-600">
        <LoaderCircle className="animate-spin text-accent" size={30} />
        Chargement des commissions...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Wallet /> Gestion des Commissions
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Suivez et gérez les commissions générées par les opérations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCommissions}
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

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
            <DollarSign className="text-primary" />
            <div>
              <p className="text-sm text-gray-500">Total Commissions</p>
              <h3 className="text-lg font-semibold">{stats.total.toFixed(2)} €</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
            <TrendingUp className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <h3 className="text-lg font-semibold text-green-700">
                {stats.en_attente.toFixed(2)} €
              </h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
            <CheckCircle className="text-accent" />
            <div>
              <p className="text-sm text-gray-500">Payées</p>
              <h3 className="text-lg font-semibold text-accent">
                {stats.payees.toFixed(2)} €
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        {['all', 'en_attente', 'payee', 'annulee'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-md font-medium ${
              currentTab === tab
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setCurrentTab(tab as any)}
          >
            {tab === 'en_attente'
              ? 'En attente'
              : tab === 'payee'
              ? 'Payées'
              : tab === 'annulee'
              ? 'Annulées'
              : 'Toutes'}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredCommissions.length === 0 ? (
        <div className="text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg py-16">
          <h2 className="text-lg font-semibold mb-2">Aucune commission trouvée</h2>
          <p className="text-gray-500">
            Aucune donnée correspondant à ce filtre.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="py-3 px-4 font-semibold">Opération</th>
                <th className="py-3 px-4 font-semibold">Vendeur</th>
                <th className="py-3 px-4 font-semibold">Montant (€)</th>
                <th className="py-3 px-4 font-semibold">Pourcentage</th>
                <th className="py-3 px-4 font-semibold">Statut</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommissions.map(c => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{c.operation?.reference || 'N/A'}</td>
                  <td className="py-3 px-4">{c.vendor?.name || 'N/A'}</td>
                  <td className="py-3 px-4">{c.montant.toFixed(2)}</td>
                  <td className="py-3 px-4">{c.pourcentage}%</td>
                  <td className="py-3 px-4">
                    {c.statut === 'payee' ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        Payée
                      </span>
                    ) : c.statut === 'en_attente' ? (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        En attente
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        Annulée
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-4">
                    {c.statut === 'en_attente' && (
                      <button
                        onClick={() => markAsPaid(c.id)}
                        disabled={processing === c.id}
                        className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
                      >
                        {processing === c.id ? '⏳' : 'Marquer comme payée'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
