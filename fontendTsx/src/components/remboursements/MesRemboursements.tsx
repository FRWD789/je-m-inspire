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
  operation: {
    event_name: string;
  };
}

export const MesRemboursements: React.FC = () => {
    const { get } = useApi();
    const [demandes, setDemandes] = useState<Demande[]>([]);
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
            
            debug('Réponse API remboursements:', data);
            
            if (data.remboursements) {
                setDemandes(Array.isArray(data.remboursements) ? data.remboursements : []);
            } else if (Array.isArray(data)) {
                setDemandes(data);
            } else {
                setDemandes([]);
            }
        } catch (err) {
            debugError('Erreur lors du chargement des demandes:', err);
            setError('Impossible de charger vos demandes de remboursement');
            setDemandes([]);
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <div className="text-center py-10 text-primary">
                <p>Chargement de vos demandes...</p>
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

    if (demandes.length === 0) {
        return (
            <div className="bg-white p-10 rounded-lg border border-gray-200 text-center">
                <h3 className="text-primary text-lg font-semibold mb-2">
                    Aucune demande de remboursement
                </h3>
                <p className="text-gray-600">
                    Vous n'avez encore fait aucune demande de remboursement.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {demandes.map(demande => (
                <div key={demande.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="text-lg font-semibold text-primary">
                                {demande.operation.event_name}
                            </h4>
                            <p className="text-sm text-gray-500">
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

                    <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Motif :</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {demande.motif}
                        </p>
                    </div>

                    {demande.commentaire_admin && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <p className="text-sm font-semibold text-blue-900 mb-1">
                                💬 Commentaire de l'administrateur :
                            </p>
                            <p className="text-sm text-blue-800">
                                {demande.commentaire_admin}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
