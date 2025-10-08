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

export const AdminRemboursements = () => {
    const { get, put } = useApi();
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);
    
    // AJOUT DES VARIABLES MANQUANTES
    const [filterStatut, setFilterStatut] = useState('tous');
    const [traiterModal, setTraiterModal] = useState(null);
    const [commentaire, setCommentaire] = useState('');

    useEffect(() => {
        fetchDemandes();
    }, []);

    const fetchDemandes = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await get('/api/remboursements');
            const data = response.data || response;
            
            debug('Réponse API admin remboursements:', data);
            
            setDemandes(Array.isArray(data) ? data : []);
        } catch (err) {
            debugError('Erreur:', err);
            setError('Impossible de charger les demandes de remboursement');
            setDemandes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTraiter = async (id, statut) => {
        setProcessingId(id);
        try {
            await put(`/api/remboursements/${id}/traiter`, {
                statut,
                commentaire_admin: commentaire
            });
            
            alert('Demande traitée avec succès');
            setTraiterModal(null);
            setCommentaire('');
            fetchDemandes();
        } catch (err) {
            debugError('Erreur:', err);
            alert(err.response?.data?.error || 'Erreur lors du traitement');
        } finally {
            setProcessingId(null);
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

        return (
            <span style={{
                backgroundColor: styles[statut]?.bg || '#ccc',
                color: styles[statut]?.color || '#000',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
            }}>
                {labels[statut] || statut}
            </span>
        );
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Chargement...</div>;
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                {error}
                <br />
                <button onClick={fetchDemandes} style={{ marginTop: '10px' }}>
                    Réessayer
                </button>
            </div>
        );
    }

    const demandesFiltrees = demandes.filter(d => 
        filterStatut === 'tous' || d.statut === filterStatut
    );

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h2 style={{ color: '#50562E', margin: 0 }}>
                    Gestion des remboursements
                </h2>
                <select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    style={{
                        padding: '8px 15px',
                        border: '1px solid #50562E',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}
                >
                    <option value="tous">Tous</option>
                    <option value="en_attente">En attente</option>
                    <option value="approuve">Approuvés</option>
                    <option value="refuse">Refusés</option>
                </select>
            </div>

            {demandesFiltrees.length === 0 ? (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '40px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    border: '1px solid #50562E'
                }}>
                    <p style={{ color: '#666' }}>Aucune demande trouvée.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {demandesFiltrees.map(demande => (
                        <div key={demande.id} style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #50562E'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '15px',
                                marginBottom: '15px'
                            }}>
                                <div>
                                    <p style={{ color: '#666', fontSize: '12px', margin: '0 0 5px 0' }}>
                                        Client
                                    </p>
                                    <p style={{ color: '#50562E', fontWeight: 'bold', margin: 0 }}>
                                        {demande.user?.name} {demande.user?.last_name}
                                    </p>
                                    <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>
                                        {demande.user?.email}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: '#666', fontSize: '12px', margin: '0 0 5px 0' }}>
                                        Événement
                                    </p>
                                    <p style={{ color: '#50562E', fontWeight: 'bold', margin: 0 }}>
                                        {demande.operation?.event?.name || 'Supprimé'}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: '#666', fontSize: '12px', margin: '0 0 5px 0' }}>
                                        Montant
                                    </p>
                                    <p style={{ color: '#50562E', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>
                                        {demande.montant}€
                                    </p>
                                    {getStatutBadge(demande.statut)}
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: '#FAF5EE',
                                padding: '10px',
                                borderRadius: '4px',
                                marginBottom: '10px'
                            }}>
                                <strong style={{ color: '#50562E' }}>Motif du client :</strong>
                                <p style={{ margin: '5px 0 0 0', color: '#333' }}>
                                    {demande.motif}
                                </p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                                    Demandé le {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>

                            {demande.commentaire_admin && (
                                <div style={{
                                    backgroundColor: '#e7f3ff',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    marginBottom: '10px',
                                    border: '1px solid #b3d9ff'
                                }}>
                                    <strong style={{ color: '#50562E' }}>Votre réponse :</strong>
                                    <p style={{ margin: '5px 0 0 0', color: '#333' }}>
                                        {demande.commentaire_admin}
                                    </p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                                        Traité le {new Date(demande.date_traitement).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            )}

                            {demande.statut === 'en_attente' && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => setTraiterModal({ id: demande.id, action: 'approuve' })}
                                        disabled={processingId === demande.id}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            backgroundColor: '#28a745',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Approuver
                                    </button>
                                    <button
                                        onClick={() => setTraiterModal({ id: demande.id, action: 'refuse' })}
                                        disabled={processingId === demande.id}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            backgroundColor: '#dc3545',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Refuser
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {traiterModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '30px',
                        borderRadius: '8px',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h3 style={{ color: '#50562E', marginTop: 0 }}>
                            {traiterModal.action === 'approuve' ? 'Approuver' : 'Refuser'} la demande
                        </h3>
                        <textarea
                            value={commentaire}
                            onChange={(e) => setCommentaire(e.target.value)}
                            placeholder="Commentaire (optionnel)"
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #50562E',
                                borderRadius: '4px',
                                marginBottom: '15px',
                                fontSize: '14px'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => {
                                    setTraiterModal(null);
                                    setCommentaire('');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: '#ccc',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleTraiter(traiterModal.id, traiterModal.action)}
                                disabled={processingId === traiterModal.id}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: traiterModal.action === 'approuve' ? '#28a745' : '#dc3545',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: processingId === traiterModal.id ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {processingId === traiterModal.id ? 'Traitement...' : 'Confirmer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};