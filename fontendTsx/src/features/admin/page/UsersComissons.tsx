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
  CheckCircle,
  Copy,
  Check
} from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface Commission {
  id: number
  paiement_id: number
  date: string
  event_name: string
  event_id: number | null
  customer_name: string
  vendor_id: number
  vendor_name: string
  vendor_email: string
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

const toNumber = (value: any): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

const formatMontant = (value: any): string => {
  return toNumber(value).toFixed(2)
}

export default function AdminCommissionPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [commissions, setCommissions] = useState<Commission[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  
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
      
      const data = res.data.data || res.data
      const commissionsData = data.commissions || []
      const statsData = data.stats || null
      
      const normalizedCommissions = commissionsData.map((c: any) => ({
        ...c,
        montant_total: toNumber(c.montant_total),
        taux_commission: toNumber(c.taux_commission),
        montant_commission: toNumber(c.montant_commission),
        montant_net: toNumber(c.montant_net)
      }))
      
      const normalizedStats = statsData ? {
        total_a_transferer: toNumber(statsData.total_a_transferer),
        nombre_paiements: toNumber(statsData.nombre_paiements),
        total_commissions: toNumber(statsData.total_commissions)
      } : null
      
      setCommissions(normalizedCommissions)
      setStats(normalizedStats)
    } catch (err: any) {
      console.error('Erreur lors du chargement des commissions:', err)
      alert(t('commissions.loadingError'))
    } finally {
      setLoading(false)
    }
  }

  const fetchProfessionals = async () => {
    try {
      setLoading(true)
      const res = await privateApi.get('/admin/commissions/professionals')
      
      const data = res.data.data || res.data
      const professionalsData = data.professionals || []
      
      const normalizedProfessionals = professionalsData.map((p: any) => ({
        ...p,
        commission_rate: toNumber(p.commission_rate)
      }))
      
      setProfessionals(normalizedProfessionals)
    } catch (err: any) {
      console.error('Erreur lors du chargement des professionnels:', err)
      alert(t('commissions.professionalsLoadingError'))
    } finally {
      setLoading(false)
    }
  }

  const copyEmailToClipboard = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(email)
      setTimeout(() => setCopiedEmail(null), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
      alert(t('commissions.copyError'))
    }
  }

  const markCommissionAsPaid = async (id: number) => {
    if (!confirm(t('commissions.confirmTransfer'))) {
      return
    }

    try {
      setProcessingId(id)
      await privateApi.post(`/admin/commissions/${id}/mark-as-paid`)
      
      setCommissions(prev => prev.filter(c => c.id !== id))
      
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
      
      alert(t('commissions.markedAsPaidSuccess'))
    } catch (err: any) {
      console.error('Erreur lors du marquage:', err)
      alert(`${t('common.error')}: ${err.response?.data?.message || t('commissions.markingError')}`)
    } finally {
      setProcessingId(null)
    }
  }

  const startEdit = (id: number, currentRate: number) => {
    setEditingId(id)
    setEditValue(toNumber(currentRate))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue(0)
  }

  const saveCommissionRate = async (userId: number) => {
    try {
      setSaving(true)
      await privateApi.put(`/admin/commissions/professionals/${userId}`, {
        commission_rate: editValue
      })
      
      setProfessionals(prev =>
        prev.map(p => (p.id === userId ? { ...p, commission_rate: editValue } : p))
      )
      
      setEditingId(null)
      alert(t('commissions.rateUpdatedSuccess'))
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err)
      alert(`${t('common.error')}: ${err.response?.data?.message || t('commissions.rateUpdateError')}`)
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
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <LoaderCircle className="animate-spin text-accent" size={30} />
        <p className="mt-4 text-xl font-medium">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                <DollarSign className="hidden sm:block" /> {t('commissions.title')}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {t('commissions.subtitle')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={refresh}
                className="flex-1 sm:flex-none px-3 py-2 rounded-md bg-primary/70 text-white hover:bg-primary/90 flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCcw size={15} />
                <span className="hidden sm:inline">{t('commissions.refresh')}</span>
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none px-3 py-2 rounded-md bg-accent/70 text-white hover:bg-accent/90 flex items-center justify-center gap-2 text-sm"
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">{t('commissions.back')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            className={`px-3 sm:px-6 py-3 rounded-md font-medium flex items-center justify-center gap-2 text-sm sm:text-base transition-colors ${
              currentTab === 'transfers'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
            }`}
            onClick={() => setCurrentTab('transfers')}
          >
            <TrendingUp size={18} className="hidden sm:block" />
            <span className="sm:hidden">{t('commissions.paymentsShort')}</span>
            <span className="hidden sm:inline">{t('commissions.paymentsToTransfer')}</span>
          </button>
          <button
            className={`px-3 sm:px-6 py-3 rounded-md font-medium flex items-center justify-center gap-2 text-sm sm:text-base transition-colors ${
              currentTab === 'rates'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
            }`}
            onClick={() => setCurrentTab('rates')}
          >
            <Users size={18} className="hidden sm:block" />
            <span className="sm:hidden">{t('commissions.commissionRatesShort')}</span>
            <span className="hidden sm:inline">{t('commissions.commissionRates')}</span>
          </button>
        </div>

        {currentTab === 'transfers' && (
          <>
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                  <DollarSign className="text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">{t('commissions.totalToTransfer')}</p>
                    <h3 className="text-lg font-semibold truncate">{formatMontant(stats.total_a_transferer)} $</h3>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                  <TrendingUp className="text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">{t('commissions.numberOfPayments')}</p>
                    <h3 className="text-lg font-semibold">{stats.nombre_paiements}</h3>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                  <DollarSign className="text-accent flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">{t('commissions.commissionsCollected')}</p>
                    <h3 className="text-lg font-semibold truncate">{formatMontant(stats.total_commissions)} $</h3>
                  </div>
                </div>
              </div>
            )}

            {commissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-200 py-12 text-center">
                <CheckCircle size={40} className="mx-auto text-green-600 mb-4" />
                <h2 className="text-lg font-semibold mb-2">{t('commissions.noPaymentsToTransfer')}</h2>
                <p className="text-gray-500 px-4">
                  {t('commissions.proPlus DirectPayments')}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100 text-gray-700 text-left">
                        <tr>
                          <th className="py-3 px-4 font-semibold">{t('commissions.date')}</th>
                          <th className="py-3 px-4 font-semibold">{t('commissions.event')}</th>
                          <th className="py-3 px-4 font-semibold">{t('commissions.customer')}</th>
                          <th className="py-3 px-4 font-semibold">{t('commissions.vendor')}</th>
                          <th className="py-3 px-4 font-semibold">{t('commissions.email')}</th>
                          <th className="py-3 px-4 font-semibold">{t('commissions.totalAmount')}</th>
                          <th className="py-3 px-4 font-semibold">{t('commissions.commission')}</th>
                          <th className="py-3 px-4 font-semibold">{t('commissions.toTransfer')}</th>
                          <th className="py-3 px-4 font-semibold sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]">{t('commissions.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissions.map(c => (
                          <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{new Date(c.date).toLocaleDateString('fr-CA')}</td>
                            <td className="py-3 px-4">{c.event_name}</td>
                            <td className="py-3 px-4">{c.customer_name}</td>
                            <td className="py-3 px-4">{c.vendor_name}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => copyEmailToClipboard(c.vendor_email)}
                                className="flex items-center gap-1.5 text-primary hover:text-primary/80 cursor-pointer transition-colors"
                                title={t('commissions.clickToCopy')}
                              >
                                {copiedEmail === c.vendor_email ? (
                                  <>
                                    <Check size={14} className="text-green-600" />
                                    <span className="text-green-600 font-medium">{t('commissions.copied')}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} />
                                    <span className="hover:underline">{c.vendor_email}</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4">{formatMontant(c.montant_total)} $</td>
                            <td className="py-3 px-4">
                              {formatMontant(c.montant_commission)} $ ({formatMontant(c.taux_commission)}%)
                            </td>
                            <td className="py-3 px-4 font-semibold text-green-700">
                              {formatMontant(c.montant_net)} $
                            </td>
                            <td className="py-3 px-4 sticky right-0 bg-white hover:bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]">
                              <button
                                onClick={() => markCommissionAsPaid(c.id)}
                                disabled={processingId === c.id}
                                className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === c.id ? (
                                  <>
                                    <LoaderCircle size={14} className="animate-spin" />
                                    {t('commissions.processing')}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={14} />
                                    {t('commissions.markAsPaid')}
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:hidden space-y-4">
                  {commissions.map(c => (
                    <div key={c.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{c.event_name}</h3>
                          <p className="text-sm text-gray-600">{new Date(c.date).toLocaleDateString('fr-CA')}</p>
                        </div>
                        <span className="text-lg font-bold text-green-700 whitespace-nowrap">
                          {formatMontant(c.montant_net)} $
                        </span>
                      </div>

                      <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('commissions.customer')}:</span>
                          <span className="text-gray-900 text-right">{c.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('commissions.vendor')}:</span>
                          <span className="text-gray-900 text-right">{c.vendor_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t('commissions.email')}:</span>
                          <button
                            onClick={() => copyEmailToClipboard(c.vendor_email)}
                            className="flex items-center gap-1 text-primary hover:text-primary/80 text-right"
                          >
                            {copiedEmail === c.vendor_email ? (
                              <>
                                <Check size={12} className="text-green-600" />
                                <span className="text-green-600 text-xs font-medium">{t('commissions.copied')}</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span className="text-xs underline">{c.vendor_email}</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('commissions.totalAmount')}:</span>
                          <span className="text-gray-900">{formatMontant(c.montant_total)} $</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('commissions.commission')}:</span>
                          <span className="text-gray-900">
                            {formatMontant(c.montant_commission)} $ ({formatMontant(c.taux_commission)}%)
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => markCommissionAsPaid(c.id)}
                        disabled={processingId === c.id}
                        className="w-full px-4 py-2.5 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === c.id ? (
                          <>
                            <LoaderCircle size={16} className="animate-spin" />
                            {t('commissions.processing')}
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            {t('commissions.markAsPaid')}
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {currentTab === 'rates' && (
          <>
            {professionals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-200 py-12 text-center">
                <Users size={40} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-lg font-semibold mb-2">{t('commissions.noProfessionalsFound')}</h2>
                <p className="text-gray-500">{t('commissions.noProfessionalsRegistered')}</p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100 text-gray-700 text-left">
                        <tr>
                          <th className="py-3 px-4 font-semibold">{t('commissions.name')}</th>
                          <th className="py-3 px-4 font-semibold">{t('commissions.email')}</th>
                          <th className="py-3 px-4 font-semibold">{t('commissions.currentRate')}</th>
                          <th className="py-3 px-4 font-semibold">{t('commissions.status')}</th>
                          <th className="py-3 px-4 font-semibold">{t('commissions.accounts')}</th>
                          <th className="py-3 px-4 font-semibold sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]">{t('commissions.actions')}</th>
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
                                    onChange={e => setEditValue(parseFloat(e.target.value) || 0)}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                                  />
                                  <span>%</span>
                                </div>
                              ) : (
                                <span className="font-semibold">{formatMontant(pro.commission_rate)}%</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1 flex-wrap">
                                {pro.has_pro_plus && (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                                    {t('commissions.proPlus')}
                                  </span>
                                )}
                                {!pro.is_approved && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                                    {t('commissions.notApproved')}
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
                                    {t('commissions.none')}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 sticky right-0 bg-white hover:bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]">
                              {editingId === pro.id ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveCommissionRate(pro.id)}
                                    disabled={saving}
                                    className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-1 text-xs disabled:opacity-50"
                                  >
                                    <Save size={14} /> {t('commissions.save')}
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    disabled={saving}
                                    className="px-3 py-1.5 rounded-md bg-gray-400 text-white hover:bg-gray-500 flex items-center gap-1 text-xs disabled:opacity-50"
                                  >
                                    <X size={14} /> {t('common.cancel')}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEdit(pro.id, pro.commission_rate)}
                                  className="px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 flex items-center gap-1 text-xs"
                                >
                                  <Edit2 size={14} /> {t('commissions.edit')}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:hidden space-y-4">
                  {professionals.map(pro => (
                    <div key={pro.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{pro.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{pro.email}</p>
                        </div>
                        {editingId !== pro.id && (
                          <span className="ml-2 text-lg font-bold text-primary whitespace-nowrap">
                            {formatMontant(pro.commission_rate)}%
                          </span>
                        )}
                      </div>

                      {editingId === pro.id && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-700 font-medium mb-2 block">
                            {t('commissions.newCommissionRate')}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={editValue}
                              onChange={e => setEditValue(parseFloat(e.target.value) || 0)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <span className="text-gray-700 font-medium">%</span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {pro.has_pro_plus && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                            {t('commissions.proPlus')}
                          </span>
                        )}
                        {!pro.is_approved && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            {t('commissions.notApproved')}
                          </span>
                        )}
                        {pro.has_stripe && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            Stripe
                          </span>
                        )}
                        {pro.has_paypal && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                            PayPal
                          </span>
                        )}
                        {!pro.has_stripe && !pro.has_paypal && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            {t('commissions.noLinkedAccount')}
                          </span>
                        )}
                      </div>

                      {editingId === pro.id ? (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => saveCommissionRate(pro.id)}
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                          >
                            <Save size={16} /> {t('commissions.save')}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 rounded-md bg-gray-400 text-white hover:bg-gray-500 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                          >
                            <X size={16} /> {t('common.cancel')}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(pro.id, pro.commission_rate)}
                          className="w-full px-4 py-2.5 rounded-md bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Edit2 size={16} /> {t('commissions.editRate')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}