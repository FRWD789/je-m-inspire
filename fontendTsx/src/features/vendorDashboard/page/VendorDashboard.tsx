import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Download, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { vendorService } from '../service/vendorService';
import { useTranslation } from 'react-i18next';

export default function VendorDashboard() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const previousNet = 100;
  const netChange = ((summary.net_earnings - previousNet) / previousNet * 100).toFixed(1);
  const isPositive = netChange >= 0;

  return (
    <div className="min-h-screen p-3 md:p-6 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('vendorDashboard.title')}</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">{t('vendorDashboard.subtitle')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            >
              <option value="today">{t('vendorDashboard.today')}</option>
              <option value="week">{t('vendorDashboard.week')}</option>
              <option value="month">{t('vendorDashboard.month')}</option>
              <option value="all">{t('vendorDashboard.all')}</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-accent text-white rounded-lg hover:bg-primary transition-colors text-sm md:text-base font-medium"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t('vendorDashboard.export')}</span>
              <span className="sm:hidden">{t('vendorDashboard.exportShort')}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {[
            {
              title: t('vendorDashboard.netEarnings'),
              value: summary.net_earnings.toFixed(2),
              unit: '$',
              icon: DollarSign,
              bgColor: 'bg-green-100',
              iconColor: 'text-accent',
              showChange: true
            },
            {
              title: t('vendorDashboard.totalSales'),
              value: summary.total_sales.toFixed(2),
              unit: '$',
              icon: TrendingUp,
              bgColor: 'bg-blue-100',
              iconColor: 'text-blue-600'
            },
            {
              title: t('vendorDashboard.commissions', { rate: summary.commission_rate }),
              value: summary.total_commission.toFixed(2),
              unit: '$',
              icon: CreditCard,
              bgColor: 'bg-orange-100',
              iconColor: 'text-orange-600'
            },
            {
              title: t('vendorDashboard.transactions'),
              value: summary.transaction_count,
              unit: '',
              icon: Calendar,
              bgColor: 'bg-purple-100',
              iconColor: 'text-purple-600'
            }
          ].map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`p-2 md:p-3 ${card.bgColor} rounded-lg`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${card.iconColor}`} />
                  </div>
                  {card.showChange && (
                    <span className={`flex items-center text-xs md:text-sm font-medium gap-1 ${isPositive ? 'text-accent' : 'text-red-600'}`}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" /> : <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4" />}
                      {Math.abs(netChange)}%
                    </span>
                  )}
                </div>
                <h3 className="text-gray-600 text-xs md:text-sm font-medium">{card.title}</h3>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                  {card.value}{card.unit}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          {/* Tab Navigation - Scrollable on mobile */}
          <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
            <nav className="flex text-gray-700 font-bold min-w-max md:min-w-0">
              {['overview', 'transactions', 'statistics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-accent text-accent'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'overview' && t('vendorDashboard.overview')}
                  {tab === 'transactions' && t('vendorDashboard.transactionsTab')}
                  {tab === 'statistics' && t('vendorDashboard.statistics')}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-3 md:p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6 md:space-y-8">
                {/* Top Events */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{t('vendorDashboard.topEvents')}</h3>
                  <div className="space-y-2 md:space-y-3">
                    {statistics.top_events.map((event) => (
                      <div key={event.event_id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm md:text-base truncate">{event.event_name}</p>
                          <p className="text-xs md:text-sm text-gray-600">
                            {t('vendorDashboard.transactionsCount', { count: event.transaction_count })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm md:text-base">{event.net_revenue.toFixed(2)} $</p>
                          <p className="text-xs md:text-sm text-gray-600">
                            {t('vendorDashboard.commissionLabel', { amount: event.total_commission.toFixed(2) })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{t('vendorDashboard.paymentMethods')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {statistics.payment_methods.map((method) => (
                      <div key={method.method} className="p-3 md:p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs md:text-sm text-gray-600">{method.method}</p>
                        <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">{method.total.toFixed(2)} $</p>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                          {t('vendorDashboard.transactionsCount', { count: method.count })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="overflow-x-auto -mx-3 md:mx-0">
                <div className="px-3 md:px-0">
                  <table className="w-full text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="py-2 md:py-3 px-2 md:px-4 font-medium text-gray-600">{t('vendorDashboard.date')}</th>
                        <th className="py-2 md:py-3 px-2 md:px-4 font-medium text-gray-600">{t('vendorDashboard.event')}</th>
                        <th className="hidden md:table-cell py-2 md:py-3 px-2 md:px-4 font-medium text-gray-600">{t('vendorDashboard.customer')}</th>
                        <th className="py-2 md:py-3 px-2 md:px-4 font-medium text-gray-600 text-right">{t('vendorDashboard.amount')}</th>
                        <th className="hidden sm:table-cell py-2 md:py-3 px-2 md:px-4 font-medium text-gray-600 text-right">{t('vendorDashboard.commission')}</th>
                        <th className="py-2 md:py-3 px-2 md:px-4 font-medium text-gray-600 text-right">{t('vendorDashboard.net')}</th>
                        <th className="hidden lg:table-cell py-2 md:py-3 px-2 md:px-4 font-medium text-gray-600">{t('vendorDashboard.method')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 md:py-4 px-2 md:px-4 text-gray-900">{transaction.date}</td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-gray-900 truncate">{transaction.event_name}</td>
                          <td className="hidden md:table-cell py-3 md:py-4 px-2 md:px-4 text-gray-600 truncate">{transaction.customer_name}</td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-gray-900 text-right font-medium">
                            {transaction.amount.toFixed(2)} $
                          </td>
                          <td className="hidden sm:table-cell py-3 md:py-4 px-2 md:px-4 text-red-600 text-right">
                            -{transaction.commission_amount.toFixed(2)} $
                          </td>
                          <td className="py-3 md:py-4 px-2 md:px-4 text-accent text-right font-medium">
                            {transaction.net_amount.toFixed(2)} $
                          </td>
                          <td className="hidden lg:table-cell py-3 md:py-4 px-2 md:px-4">
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
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{t('vendorDashboard.monthlyEarnings')}</h3>
                <div className="space-y-3 md:space-y-4">
                  {statistics.monthly_earnings.map((month, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 md:w-24 text-xs md:text-sm font-medium text-gray-600">{month.period}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="text-xs md:text-sm text-gray-600">{t('vendorDashboard.totalSalesLabel')}</span>
                          <span className="text-xs md:text-sm font-medium text-gray-900">{month.total_sales.toFixed(2)} $</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${(month.net_earnings / month.total_sales) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between mt-1 gap-2">
                          <span className="text-xs text-gray-500">
                            {t('vendorDashboard.commissionLabel', { amount: month.total_commission.toFixed(2) })}
                          </span>
                          <span className="text-xs md:text-sm font-semibold text-accent whitespace-nowrap">{month.net_earnings.toFixed(2)} $</span>
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