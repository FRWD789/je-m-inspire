import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Download, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { vendorService } from '../service/vendorService';



export default function VendorDashboard() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [earningsData, statsData] = await Promise.all([
        vendorService.getEarnings(period),
        vendorService.getStatistics()
      ]);
      setData(earningsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await vendorService.exportCSV();
      // Handle file download
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const { summary } = data;
  const previousNet = 100; // Mock previous period data
  const netChange = ((summary.net_earnings - previousNet) / previousNet * 100).toFixed(1);
  const isPositive = netChange >= 0;

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord vendeur</h1>
            <p className="text-gray-600 mt-1">Gérez vos revenus et transactions</p>
          </div>
          <div className="flex gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="all">Tout</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-primary transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-accent' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(netChange)}%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Revenus nets</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.net_earnings.toFixed(2)} $</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Ventes totales</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total_sales.toFixed(2)} $</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Commissions ({summary.commission_rate}%)</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total_commission.toFixed(2)} $</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Transactions</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.transaction_count}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-[4px]  shadow-sm mb-6">
          <div className="border-b bg-gray-100  border-gray-200">
            <nav className="flex text-gray-700 font-bold ">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'transactions'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'statistics'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Statistiques
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Événements les plus rentables</h3>
                  <div className="space-y-3">
                    {statistics.top_events.map((event) => (
                      <div key={event.event_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{event.event_name}</p>
                          <p className="text-sm text-gray-600">{event.transaction_count} transactions</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{event.net_revenue.toFixed(2)} $</p>
                          <p className="text-sm text-gray-600">Commission: {event.total_commission.toFixed(2)} $</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Méthodes de paiement</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {statistics.payment_methods.map((method) => (
                      <div key={method.method} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{method.method}</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{method.total.toFixed(2)} $</p>
                        <p className="text-sm text-gray-600 mt-1">{method.count} transactions</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Événement</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Client</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Montant</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Commission</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Net</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Méthode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">{transaction.date}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{transaction.event_name}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{transaction.customer_name}</td>
                        <td className="py-4 px-4 text-sm text-gray-900 text-right font-medium">
                          {transaction.amount.toFixed(2)} $
                        </td>
                        <td className="py-4 px-4 text-sm text-red-600 text-right">
                          -{transaction.commission_amount.toFixed(2)} $
                        </td>
                        <td className="py-4 px-4 text-sm text-accent text-right font-medium">
                          {transaction.net_amount.toFixed(2)} $
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.payment_method === 'Stripe' 
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {transaction.payment_method}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Revenus mensuels (12 derniers mois)</h3>
                <div className="space-y-3">
                  {statistics.monthly_earnings.map((month, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-24 text-sm font-medium text-gray-600">{month.period}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Ventes totales</span>
                          <span className="text-sm font-medium text-gray-900">{month.total_sales.toFixed(2)} $</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${(month.net_earnings / month.total_sales) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">Commission: {month.total_commission.toFixed(2)} $</span>
                          <span className="text-sm font-semibold text-accent">{month.net_earnings.toFixed(2)} $</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}