import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

const DEBUG = import.meta.env.DEV;
const debug = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};
const debugError = (...args: any[]) => {
  if (DEBUG) console.error(...args);
};

interface Reservation {
  id: number;
  event_name: string;
  total_price: string | number;
  status: string;
}

interface FormData {
  operation_id: string;
  motif: string;
}

interface CreateRemboursementFormProps {
  onSuccess?: () => void;
}

export const CreateRemboursementForm: React.FC<CreateRemboursementFormProps> = ({ onSuccess }) => {
    const { get, post } = useApi();
    const [searchParams] = useSearchParams();
    const preSelectedOperationId = searchParams.get('operation_id');
    
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [formData, setFormData] = useState<FormData>({
        operation_id: '',
        motif: ''
    });
    const [loading, setLoading] = useState(false);
    const [loadingReservations, setLoadingReservations] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchReservations();
    }, []);

    useEffect(() => {
        if (preSelectedOperationId && reservations.length > 0) {
            const reservationExists = reservations.find(
                r => r.id === parseInt(preSelectedOperationId)
            );
            if (reservationExists) {
                setFormData(prev => ({
                    ...prev,
                    operation_id: preSelectedOperationId
                }));
            }
        }
    }, [preSelectedOperationId, reservations]);

    const fetchReservations = async () => {
        setLoadingReservations(true);
        try {
            const response = await get('/api/mes-reservations');
            const data = response.data || response;
            
            const validReservations = (Array.isArray(data) ? data : []).filter(
                (r: any) => r.status === 'paid'
            );
            
            setReservations(validReservations);
        } catch (err) {
            debugError('Erreur lors du chargement des réservations:', err);
            setReservations([]);
        } finally {
            setLoadingReservations(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.operation_id) {
            setError('Veuillez sélectionner une réservation');
            setLoading(false);
            return;
        }

        if (formData.motif.trim().length < 10) {
            setError('Le motif doit contenir au moins 10 caractères');
            setLoading(false);
            return;
        }

        try {
            const reservation = reservations.find(r => r.id === parseInt(formData.operation_id));
            
            if (!reservation) {
                setError('Réservation introuvable');
                setLoading(false);
                return;
            }

            const montant = parseFloat(reservation.total_price.toString());
            
            if (!montant || isNaN(montant) || montant <= 0) {
                setError('Montant invalide pour cette réservation');
                setLoading(false);
                return;
            }

            const dataToSend = {
                operation_id: parseInt(formData.operation_id),
                motif: formData.motif.trim(),
                montant: montant
            };

            await post('/api/remboursements', dataToSend);
            
            setSuccess('Demande de remboursement créée avec succès !');
            setFormData({ operation_id: '', motif: '' });
            
            fetchReservations();
            
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (err: any) {
            debugError('Erreur complète:', err);
            
            const errorMessage = err.response?.data?.message || 
                                err.response?.data?.error || 
                                'Erreur lors de la création de la demande';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const selectedReservation = reservations.find(r => r.id === parseInt(formData.operation_id));

    if (loadingReservations) {
        return (
            <div className="text-center py-10 text-primary">
                <p>Chargement de vos réservations...</p>
            </div>
        );
    }

    if (reservations.length === 0) {
        return (
            <div className="bg-white p-10 rounded-lg border border-primary max-w-2xl mx-auto text-center">
                <h3 className="text-primary text-xl font-semibold mb-4">
                    Aucune réservation éligible
                </h3>
                <p className="text-gray-600">
                    Vous n'avez aucune réservation payée pour laquelle vous pouvez demander un remboursement.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-primary max-w-2xl mx-auto">
            <h3 className="text-primary text-xl font-semibold mb-5">
                Créer une demande de remboursement
            </h3>

            {preSelectedOperationId && (
                <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
                    ℹ️ <strong>Une réservation a été pré-sélectionnée pour vous</strong>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded mb-4 border border-red-200">
                    ⚠️ {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-700 p-3 rounded mb-4 border border-green-200">
                    ✓ {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-2 text-primary font-semibold">
                        Sélectionner une réservation
                    </label>
                    <select
                        value={formData.operation_id}
                        onChange={(e) => setFormData({ ...formData, operation_id: e.target.value })}
                        required
                        disabled={loading}
                        className="w-full p-3 border border-primary rounded text-sm bg-white disabled:bg-gray-100"
                    >
                        <option value="">-- Choisir une réservation --</option>
                        {reservations.map(res => (
                            <option key={res.id} value={res.id}>
                                {res.event_name} - {parseFloat(res.total_price.toString()).toFixed(2)} CAD
                            </option>
                        ))}
                    </select>
                </div>

                {selectedReservation && (
                    <div className="bg-gray-50 p-3 rounded mb-4 border border-gray-200">
                        <p className="text-sm">
                            <strong>Événement :</strong> {selectedReservation.event_name}
                        </p>
                        <p className="text-sm">
                            <strong>Montant :</strong> {parseFloat(selectedReservation.total_price.toString()).toFixed(2)} CAD
                        </p>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block mb-2 text-primary font-semibold">
                        Motif de la demande (min. 10 caractères)
                    </label>
                    <textarea
                        value={formData.motif}
                        onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                        required
                        disabled={loading}
                        rows={4}
                        placeholder="Expliquez pourquoi vous souhaitez un remboursement..."
                        className="w-full p-3 border border-primary rounded text-sm resize-none disabled:bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.motif.length} / 10 caractères minimum
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || formData.motif.length < 10}
                    className="w-full bg-accent text-white py-3 rounded font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
                </button>
            </form>
        </div>
    );
};
