import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/AuthContext';

const DEBUG = import.meta.env.DEV;
const debug = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};
const debugError = (...args: any[]) => {
  if (DEBUG) console.error(...args);
};

interface Demande {
  id: number;
  montant: string | number;
  motif: string;
  statut: 'en_attente' | 'approuve' | 'refuse';
  created_at: string;
  date_traitement?: string;
  commentaire_admin?: string;
  user: {
    name: string;
    email: string;
  };
  operation: {
    event_name: string;
  };
}

export const AdminRemboursements: React.FC = () => {
    const { get, put } = useApi();
    const [demandes, setDemandes] = useState<Demande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [filterStatut, setFilterStatut] = useState('tous');
    const [traiterModal, setTraiterModal] = useState<number | null>(null);
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

    const handleTraiter = async (id: number, statut: 'approuve' | 'refuse') => {
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
        } catch (err: any) {
            debugError('Erreur:', err);
            alert(err.response?.data?.error || 'Erreur lors du traitement');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatutBadge = (statut: string) => {
        const styles = {
            en_attente: { bg: 'bg-yellow-400', color: 'text-black' },
            approuve: { bg: 'bg-green-500', color: 'text-white' },
            refuse: { bg: 'bg-red-500', color: 'text-white' }
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

        const style = styles[statut as keyof typeof styles] || { bg: 'bg-gray-400', color: 'text-black' };
        const label = labels[statut as keyof typeof labels] || statut;
        const icon = icons[statut as keyof typeof icons] || '';

        return (
            <span className={`${style.bg} ${style.color} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
                {icon} {label}
            </span>
        );
    };

    const demandesFiltrees = filterStatut === 'tous' 
        ? demandes 
        : demandes.filter(d => d.statut === filterStatut);

    if (loading) {
        return (
            <div className="text-center py-10 text-primary">
                <p>Chargement des demandes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
                ⚠️ {error}
            </div>
        );
    }

    return (
        <div>
            {/* Filtres */}
            <div className="mb-6 flex gap-2 flex-wrap">
                <button
                    onClick={() => setFilterStatut('tous')}
                    className={`px-4 py-2 rounded font-medium transition ${
                        filterStatut === 'tous' 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Toutes ({demandes.length})
                </button>
                <button
                    onClick={() => setFilterStatut('en_attente')}
                    className={`px-4 py-2 rounded font-medium transition ${
                        filterStatut === 'en_attente' 
                            ? 'bg-yellow-400 text-black' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    En attente ({demandes.filter(d => d.statut === 'en_attente').length})
                </button>
                <button
                    onClick={() => setFilterStatut('approuve')}
                    className={`px-4 py-2 rounded font-medium transition ${
                        filterStatut === 'approuve' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Approuvées ({demandes.filter(d => d.statut === 'approuve').length})
                </button>
                <button
                    onClick={() => setFilterStatut('refuse')}
                    className={`px-4 py-2 rounded font-medium transition ${
                        filterStatut === 'refuse' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Refusées ({demandes.filter(d => d.statut === 'refuse').length})
                </button>
            </div>

            {/* Liste des demandes */}
            {demandesFiltrees.length === 0 ? (
                <div className="bg-white p-10 rounded-lg border border-gray-200 text-center">
                    <p className="text-gray-600">Aucune demande à afficher</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {demandesFiltrees.map(demande => (
                        <div key={demande.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-semibold text-primary">
                                        {demande.operation.event_name}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        Par {demande.user.name} ({demande.user.email})
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Demandé le {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                {getStatutBadge(demande.statut)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        <strong>Montant :</strong> {parseFloat(demande.montant.toString()).toFixed(2)} CAD
                                    </p>
                                </div>
                                {demande.date_traitement && (
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            <strong>Traité le :</strong> {new Date(demande.date_traitement).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Motif :</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    {demande.motif}
                                </p>
                            </div>

                            {demande.commentaire_admin && (
                                <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-4">
                                    <p className="text-sm font-semibold text-blue-900 mb-1">
                                        💬 Commentaire administrateur :
                                    </p>
                                    <p className="text-sm text-blue-800">
                                        {demande.commentaire_admin}
                                    </p>
                                </div>
                            )}

                            {demande.statut === 'en_attente' && (
                                <div className="flex gap-2 pt-3 border-t border-gray-200">
                                    <button
                                        onClick={() => setTraiterModal(demande.id)}
                                        disabled={processingId === demande.id}
                                        className="flex-1 bg-primary text-white py-2 px-4 rounded font-medium hover:brightness-110 disabled:opacity-50 transition"
                                    >
                                        Traiter la demande
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de traitement */}
            {traiterModal !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-primary mb-4">
                            Traiter la demande
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Commentaire (optionnel)
                            </label>
                            <textarea
                                value={commentaire}
                                onChange={(e) => setCommentaire(e.target.value)}
                                rows={3}
                                placeholder="Ajouter un commentaire..."
                                className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleTraiter(traiterModal, 'approuve')}
                                disabled={processingId !== null}
                                className="flex-1 bg-green-500 text-white py-2 px-4 rounded font-medium hover:bg-green-600 disabled:opacity-50 transition"
                            >
                                ✓ Approuver
                            </button>
                            <button
                                onClick={() => handleTraiter(traiterModal, 'refuse')}
                                disabled={processingId !== null}
                                className="flex-1 bg-red-500 text-white py-2 px-4 rounded font-medium hover:bg-red-600 disabled:opacity-50 transition"
                            >
                                ✗ Refuser
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setTraiterModal(null);
                                setCommentaire('');
                            }}
                            disabled={processingId !== null}
                            className="w-full mt-2 bg-gray-200 text-gray-700 py-2 px-4 rounded font-medium hover:bg-gray-300 disabled:opacity-50 transition"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
