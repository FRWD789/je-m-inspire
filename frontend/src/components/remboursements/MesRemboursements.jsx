import React, { useState, useEffect } from 'react';
import { useApi } from "../../contexts/AuthContext";

const DEBUG = import.meta.env.DEV;
const debug = (...args) => {
  if (DEBUG) console.log(...args);
};
const debugError = (...args) => {
  if (DEBUG) console.error(...args);
};
const debugGroup = (...args) => {
  if (DEBUG) console.group(...args);
};
const debugGroupEnd = () => {
  if (DEBUG) console.groupEnd();
};

export const MesRemboursements = () => {
    const { get } = useApi(); // Utilisez le hook
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDemandes();
    }, []);

    const fetchDemandes = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await get('/api/mes-remboursements');
            const data = response.data || response;
            
            // 🔍 DEBUG - Ajoutez ces logs temporairement
            debug('Réponse API remboursements:', data);
            debug('Type:', typeof data);
            debug('Est un tableau?', Array.isArray(data));
            
            // Adaptez selon la structure de votre réponse
            // Si l'API renvoie { remboursements: [...] }
            if (data.remboursements) {
                setDemandes(Array.isArray(data.remboursements) ? data.remboursements : []);
            }
            // Si l'API renvoie directement un tableau
            else if (Array.isArray(data)) {
                setDemandes(data);
            }
            // Sinon, tableau vide
            else {
                setDemandes([]);
            }
        } catch (err) {
            debugError('Erreur lors du chargement des demandes:', err);
            setError('Impossible de charger vos demandes de remboursement');
            setDemandes([]); // Important : toujours initialiser avec un tableau vide
        } finally {
            setLoading(false);
        }
    };


    const getStatutBadge = (statut) => {
        const styles = {
            en_attente: { bg: '#ffc107', color: '#000' },
            approuve: { bg: '#28a745', color: '#fff' },
            refuse: { bg: '#dc3545', color: '#fff' }
        };

        const labels = {
            en_attente: 'En attente',
            approuve: 'Approuvé',
            refuse: 'Refusé'
        };

        const icons = {
            en_attente: '⏳',
            approuve: '✓',
            refuse: '✗'
        };

        return (
            <span style={{
                backgroundColor: styles[statut]?.bg || '#ccc',
                color: styles[statut]?.color || '#000',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'inline-block'
            }}>
                {icons[statut]} {labels[statut] || statut}
            </span>
        );
    };

    const getStatutIcon = (statut) => {
        const icons = {
            en_attente: '⏳',
            approuve: '✓',
            refuse: '✗'
        };
        return icons[statut] || '•';
    };

    if (loading) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#50562E'
            }}>
                <p>Chargement de vos demandes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                backgroundColor: '#fee',
                color: '#c33',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid #fcc'
            }}>
                <p>⚠️ {error}</p>
                <button
                    onClick={fetchDemandes}
                    style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#50562E',
                        color: '#FAF5EE',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h2 style={{ color: '#50562E', margin: 0 }}>
                    Mes demandes de remboursement
                </h2>
                <button
                    onClick={fetchDemandes}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#50562E',
                        color: '#FAF5EE',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🔄 Actualiser
                </button>
            </div>

            {demandes.length === 0 ? (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '40px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    border: '1px solid #50562E'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                    <h3 style={{ color: '#50562E', marginBottom: '10px' }}>
                        Aucune demande de remboursement
                    </h3>
                    <p style={{ color: '#666', margin: 0 }}>
                        Vous n'avez pas encore créé de demande de remboursement.
                    </p>
                </div>
            ) : (
                <>
                    {/* Statistiques */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '15px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            backgroundColor: '#fff',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid #50562E',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#50562E' }}>
                                {demandes.length}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
                        </div>
                        <div style={{
                            backgroundColor: '#fff9e6',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid #ffc107',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
                                {demandes.filter(d => d.statut === 'en_attente').length}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>En attente</div>
                        </div>
                        <div style={{
                            backgroundColor: '#d4edda',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid #28a745',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                                {demandes.filter(d => d.statut === 'approuve').length}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Approuvés</div>
                        </div>
                        <div style={{
                            backgroundColor: '#f8d7da',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid #dc3545',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                                {demandes.filter(d => d.statut === 'refuse').length}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Refusés</div>
                        </div>
                    </div>

                    {/* Liste des demandes */}
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {demandes.map(demande => (
                            <div key={demande.id} style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #50562E',
                                transition: 'box-shadow 0.3s',
                                cursor: 'default'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(80, 86, 46, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                    marginBottom: '15px',
                                    flexWrap: 'wrap',
                                    gap: '10px'
                                }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <h3 style={{ color: '#50562E', margin: '0 0 5px 0' }}>
                                            {demande.operation?.evenement?.titre || 'Événement supprimé'}
                                        </h3>
                                        <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
                                            📅 Demandé le {new Date(demande.created_at).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {getStatutBadge(demande.statut)}
                                        <p style={{
                                            color: '#50562E',
                                            fontWeight: 'bold',
                                            margin: '8px 0 0 0',
                                            fontSize: '20px'
                                        }}>
                                            {demande.montant}€
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    backgroundColor: '#FAF5EE',
                                    padding: '12px',
                                    borderRadius: '4px',
                                    marginBottom: '10px'
                                }}>
                                    <strong style={{ color: '#50562E', fontSize: '14px' }}>📝 Votre motif :</strong>
                                    <p style={{ margin: '8px 0 0 0', color: '#333', lineHeight: '1.5' }}>
                                        {demande.motif}
                                    </p>
                                </div>

                                {demande.commentaire_admin && (
                                    <div style={{
                                        backgroundColor: demande.statut === 'approuve' ? '#d4edda' : '#f8d7da',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        border: `1px solid ${demande.statut === 'approuve' ? '#c3e6cb' : '#f5c6cb'}`
                                    }}>
                                        <strong style={{ color: '#50562E', fontSize: '14px' }}>
                                            💬 Réponse de l'administrateur :
                                        </strong>
                                        <p style={{ margin: '8px 0 0 0', color: '#333', lineHeight: '1.5' }}>
                                            {demande.commentaire_admin}
                                        </p>
                                        {demande.date_traitement && (
                                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                                                ✓ Traité le {new Date(demande.date_traitement).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};