import React, { useState, useEffect } from 'react';
import { useAuth, useApi } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VendorEarningsPage = () => {
    const { user, isProfessional } = useAuth();
    const { get } = useApi();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [period, setPeriod] = useState('all');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!isProfessional()) {
            navigate('/');
        }
    }, [isProfessional, navigate]);

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [earningsRes, statsRes] = await Promise.all([
                get(`/api/vendor/earnings?period=${period}`),
                get('/api/vendor/earnings/statistics')
            ]);

            if (earningsRes.data.success) {
                setData(earningsRes.data.data);
            }
            
            if (statsRes.data.success) {
                setStatistics(statsRes.data.data);
            }
        } catch (error) {
            console.error('Erreur chargement données:', error);
            alert('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await get('/api/vendor/earnings/export', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `revenus_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Erreur export:', error);
            alert('Erreur lors de l\'export');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '24px' }}>⏳ Chargement...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <div>
                    <h1 style={{ margin: 0, marginBottom: '8px' }}>💰 Mes Revenus</h1>
                    <p style={{ margin: 0, color: '#6c757d' }}>
                        Taux de commission : <strong>{data?.summary?.commission_rate}%</strong>
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleExport}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        📥 Exporter CSV
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        ← Retour
                    </button>
                </div>
            </div>

            {/* Filtres de période */}
            <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
                {[
                    { value: 'all', label: 'Tout' },
                    { value: 'month', label: 'Ce mois' },
                    { value: 'week', label: 'Cette semaine' },
                    { value: 'today', label: 'Aujourd\'hui' }
                ].map(p => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: period === p.value ? '#007bff' : '#f8f9fa',
                            color: period === p.value ? 'white' : '#333',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Cartes de résumé */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={summaryCardStyle}>
                    <div style={summaryLabelStyle}>Ventes Totales</div>
                    <div style={summaryValueStyle}>{data?.summary?.total_sales?.toFixed(2)} CAD</div>
                    <div style={summarySubStyle}>{data?.summary?.transaction_count} transactions</div>
                </div>

                <div style={summaryCardStyle}>
                    <div style={summaryLabelStyle}>Commission Plateforme</div>
                    <div style={{ ...summaryValueStyle, color: '#dc3545' }}>
                        -{data?.summary?.total_commission?.toFixed(2)} CAD
                    </div>
                    <div style={summarySubStyle}>
                        {data?.summary?.commission_rate}% de frais
                    </div>
                </div>

                <div style={{...summaryCardStyle, backgroundColor: '#d4edda', borderColor: '#c3e6cb'}}>
                    <div style={summaryLabelStyle}>Revenus Nets</div>
                    <div style={{ ...summaryValueStyle, color: '#28a745' }}>
                        {data?.summary?.net_earnings?.toFixed(2)} CAD
                    </div>
                    <div style={summarySubStyle}>
                        Ce que vous recevez
                    </div>
                </div>
            </div>

            {/* Onglets */}
            <div style={{ marginBottom: '20px', borderBottom: '2px solid #dee2e6' }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    style={tabStyle(activeTab === 'overview')}
                >
                    📊 Vue d'ensemble
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    style={tabStyle(activeTab === 'transactions')}
                >
                    💳 Transactions
                </button>
                <button
                    onClick={() => setActiveTab('statistics')}
                    style={tabStyle(activeTab === 'statistics')}
                >
                    📈 Statistiques
                </button>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'overview' && data && (
                <div>
                    <h3>Résumé de la période : {
                        period === 'all' ? 'Tout' :
                        period === 'month' ? 'Ce mois' :
                        period === 'week' ? 'Cette semaine' : 'Aujourd\'hui'
                    }</h3>
                    
                    {data.transactions.length === 0 ? (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '10px'
                        }}>
                            <p style={{ fontSize: '18px', color: '#6c757d' }}>
                                Aucune transaction pour cette période
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            overflow: 'hidden'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={thStyle}>Date</th>
                                        <th style={thStyle}>Événement</th>
                                        <th style={thStyle}>Client</th>
                                        <th style={thStyle}>Montant</th>
                                        <th style={thStyle}>Commission</th>
                                        <th style={thStyle}>Net</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.transactions.slice(0, 10).map((t) => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={tdStyle}>{t.date}</td>
                                            <td style={tdStyle}>{t.event_name}</td>
                                            <td style={tdStyle}>{t.customer_name}</td>
                                            <td style={tdStyle}>{t.amount.toFixed(2)} CAD</td>
                                            <td style={{ ...tdStyle, color: '#dc3545' }}>
                                                -{t.commission_amount.toFixed(2)} CAD
                                            </td>
                                            <td style={{ ...tdStyle, color: '#28a745', fontWeight: 'bold' }}>
                                                {t.net_amount.toFixed(2)} CAD
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'transactions' && data && (
                <div>
                    <h3>Toutes les transactions ({data.transactions.length})</h3>
                    
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={thStyle}>Date</th>
                                    <th style={thStyle}>Événement</th>
                                    <th style={thStyle}>Client</th>
                                    <th style={thStyle}>Méthode</th>
                                    <th style={thStyle}>Montant</th>
                                    <th style={thStyle}>Taux</th>
                                    <th style={thStyle}>Commission</th>
                                    <th style={thStyle}>Net</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.transactions.map((t) => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={tdStyle}>{t.date}</td>
                                        <td style={tdStyle}>{t.event_name}</td>
                                        <td style={tdStyle}>{t.customer_name}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: t.payment_method === 'Stripe' ? '#635bff' : '#0070ba',
                                                color: 'white',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}>
                                                {t.payment_method}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{t.amount.toFixed(2)} CAD</td>
                                        <td style={tdStyle}>{t.commission_rate}%</td>
                                        <td style={{ ...tdStyle, color: '#dc3545' }}>
                                            -{t.commission_amount.toFixed(2)} CAD
                                        </td>
                                        <td style={{ ...tdStyle, color: '#28a745', fontWeight: 'bold' }}>
                                            {t.net_amount.toFixed(2)} CAD
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'statistics' && statistics && (
                <div>
                    <h3>Statistiques détaillées</h3>
                    
                    {/* Revenus mensuels */}
                    <div style={{ marginBottom: '30px' }}>
                        <h4>📊 Revenus des 12 derniers mois</h4>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {statistics.monthly_earnings.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#6c757d' }}>
                                    Aucune donnée disponible
                                </p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={thStyle}>Période</th>
                                            <th style={thStyle}>Ventes</th>
                                            <th style={thStyle}>Commission</th>
                                            <th style={thStyle}>Net</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statistics.monthly_earnings.map((item, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={tdStyle}>{item.period}</td>
                                                <td style={tdStyle}>{item.total_sales.toFixed(2)} CAD</td>
                                                <td style={{ ...tdStyle, color: '#dc3545' }}>
                                                    -{item.total_commission.toFixed(2)} CAD
                                                </td>
                                                <td style={{ ...tdStyle, color: '#28a745', fontWeight: 'bold' }}>
                                                    {item.net_earnings.toFixed(2)} CAD
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '30px' }}>
                        <h4>📈 Évolution des revenus</h4>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            height: '400px'
                        }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={statistics.monthly_earnings}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="total_sales" stroke="#007bff" name="Ventes" />
                                    <Line type="monotone" dataKey="net_earnings" stroke="#28a745" name="Revenus nets" />
                                    <Line type="monotone" dataKey="total_commission" stroke="#dc3545" name="Commissions" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {/* Top événements */}
                    <div style={{ marginBottom: '30px' }}>
                        <h4>🏆 Événements les plus rentables</h4>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {statistics.top_events.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#6c757d' }}>
                                    Aucune donnée disponible
                                </p>
                            ) : (
                                statistics.top_events.map((event, index) => (
                                    <div key={index} style={{
                                        padding: '15px',
                                        marginBottom: '10px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #007bff'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                                    {index + 1}. {event.event_name}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                                    {event.transaction_count} transactions
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                                                    {event.net_revenue.toFixed(2)} CAD
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                                    Revenu total: {event.total_revenue.toFixed(2)} CAD
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Méthodes de paiement */}
                    <div>
                        <h4>💳 Répartition par méthode de paiement</h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '20px'
                        }}>
                            {statistics.payment_methods.map((method, index) => (
                                <div key={index} style={{
                                    backgroundColor: 'white',
                                    padding: '20px',
                                    borderRadius: '10px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>
                                        {method.method}
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                                        {method.total.toFixed(2)} CAD
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                        {method.count} transactions
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const summaryCardStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid transparent'
};

const summaryLabelStyle = {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '10px',
    fontWeight: 'bold'
};

const summaryValueStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
};

const summarySubStyle = {
    fontSize: '14px',
    color: '#6c757d'
};

const tabStyle = (isActive) => ({
    padding: '12px 24px',
    backgroundColor: isActive ? '#007bff' : 'transparent',
    color: isActive ? 'white' : '#007bff',
    border: 'none',
    borderBottom: isActive ? 'none' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginRight: '5px',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.2s'
});

const thStyle = {
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333',
    borderBottom: '2px solid #dee2e6'
};

const tdStyle = {
    padding: '15px'
};

export default VendorEarningsPage;