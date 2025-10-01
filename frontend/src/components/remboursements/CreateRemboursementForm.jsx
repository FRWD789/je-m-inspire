import React, { useState, useEffect } from 'react';
import { useApi } from "../../contexts/AuthContext"; // Ajoutez cet import

export const CreateRemboursementForm = ({ onSuccess }) => {
    const { get, post } = useApi(); // Utilisez le hook
    const [reservations, setReservations] = useState([]);
    const [formData, setFormData] = useState({
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

    const fetchReservations = async () => {
        setLoadingReservations(true);
        try {
            // Utilisez get() au lieu d'axios.get()
            const response = await get('/api/mes-reservations');
            const data = response.data || response;

            // 🔍 LOGS DE DEBUG
            console.log('=== DEBUG RÉSERVATIONS ===');
            console.log('Response complète:', data);
            console.log('Nombre total:', data.reservations?.length || 0);
            
            const allReservations = data.reservations || [];
            
            allReservations.forEach((r, index) => {
                console.log(`\n📋 Réservation ${index + 1}:`);
                console.log('  ID:', r.id);
                console.log('  Event:', r.event_name);
                console.log('  Statut paiement:', r.statut_paiement);
                console.log('  Type:', typeof r.statut_paiement);
            });

            // Filtrer uniquement les réservations payées
            const reservationsPaye = allReservations.filter(r =>
                r.statut_paiement === 'paid' || 
                r.statut_paiement === 'paye' || 
                r.statut_paiement === 'payé'
            );

            console.log('\n✅ Réservations payées filtrées:', reservationsPaye.length);
            console.log('======================\n');

            setReservations(reservationsPaye);
        } catch (err) {
            console.error('❌ Erreur lors du chargement des réservations:', err);
            setError('Impossible de charger vos réservations');
        } finally {
            setLoadingReservations(false);
        }
    };

const handleSubmit = async (e) => {
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
        // Trouver la réservation sélectionnée
        const reservation = reservations.find(r => r.id === parseInt(formData.operation_id));
        
        console.log('Réservation sélectionnée:', reservation);
        
        if (!reservation) {
            setError('Réservation introuvable');
            setLoading(false);
            return;
        }

        // Vérifier que le montant existe
        const montant = parseFloat(reservation.total_price);
        
        console.log('Montant extrait:', montant);
        console.log('Type du montant:', typeof montant);
        
        if (!montant || isNaN(montant) || montant <= 0) {
            setError('Montant invalide pour cette réservation');
            setLoading(false);
            return;
        }

        // Préparer les données
        const dataToSend = {
            operation_id: parseInt(formData.operation_id),
            motif: formData.motif.trim(),
            montant: montant
        };

        console.log('Données à envoyer:', dataToSend);

        const response = await post('/api/remboursements', dataToSend);
        
        console.log('Réponse du serveur:', response);
        
        setSuccess('Demande de remboursement créée avec succès !');
        setFormData({ operation_id: '', motif: '' });
        
        fetchReservations();
        
        setTimeout(() => {
            if (onSuccess) onSuccess();
        }, 1500);
    } catch (err) {
        console.error('Erreur complète:', err);
        console.error('Réponse erreur:', err.response?.data);
        
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.error || 
                            'Erreur lors de la création de la demande';
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
};


    // Obtenir les détails de la réservation sélectionnée
    const selectedReservation = reservations.find(r => r.id === parseInt(formData.operation_id));

    // Affichage pendant le chargement
    if (loadingReservations) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#50562E'
            }}>
                <p>Chargement de vos réservations...</p>
            </div>
        );
    }

    // Affichage si aucune réservation éligible
    if (reservations.length === 0) {
        return (
            <div style={{
                backgroundColor: '#fff',
                padding: '40px',
                borderRadius: '8px',
                border: '1px solid #50562E',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                <h3 style={{ color: '#50562E', marginBottom: '15px' }}>
                    Aucune réservation éligible
                </h3>
                <p style={{ color: '#666' }}>
                    Vous n'avez aucune réservation payée pour laquelle vous pouvez demander un remboursement.
                </p>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #50562E',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <h3 style={{ color: '#50562E', marginBottom: '20px' }}>
                Créer une demande de remboursement
            </h3>

            {error && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c33',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    border: '1px solid #fcc'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {success && (
                <div style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    border: '1px solid #c3e6cb'
                }}>
                    ✓ {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '5px',
                        color: '#50562E',
                        fontWeight: 'bold'
                    }}>
                        Sélectionner une réservation
                    </label>
                    <select
                        value={formData.operation_id}
                        onChange={(e) => setFormData({ ...formData, operation_id: e.target.value })}
                        required
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #50562E',
                            borderRadius: '4px',
                            fontSize: '14px',
                            backgroundColor: loading ? '#f5f5f5' : '#fff',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <option value="">-- Choisir une réservation --</option>
                        {reservations.map(reservation => (
                            <option key={reservation.id} value={reservation.id}>
                                {reservation.event_name} - {reservation.total_price}€ 
                                ({new Date(reservation.date_reservation).toLocaleDateString('fr-FR')})
                            </option>
                        ))}

                    </select>
                    {selectedReservation && (
                        <div style={{
                            marginTop: '10px',
                            padding: '10px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            fontSize: '13px',
                            color: '#666'
                        }}>
                            <strong>Détails :</strong><br />
                            Date de réservation : {new Date(selectedReservation.date_reservation).toLocaleDateString('fr-FR')}<br />
                            Montant : {selectedReservation.total_price}€
                        </div>
                    )}

                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '5px',
                        color: '#50562E',
                        fontWeight: 'bold'
                    }}>
                        Motif de la demande
                    </label>
                    <textarea
                        value={formData.motif}
                        onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                        required
                        minLength={10}
                        rows={5}
                        disabled={loading}
                        placeholder="Expliquez la raison de votre demande de remboursement (minimum 10 caractères)..."
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #50562E',
                            borderRadius: '4px',
                            fontSize: '14px',
                            resize: 'vertical',
                            backgroundColor: loading ? '#f5f5f5' : '#fff'
                        }}
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>
                        {formData.motif.length} / 10 caractères minimum
                    </small>
                </div>

                <button
                    type="submit"
                    disabled={loading || !formData.operation_id || formData.motif.trim().length < 10}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: (loading || !formData.operation_id || formData.motif.trim().length < 10) ? '#ccc' : '#50562E',
                        color: '#FAF5EE',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: (loading || !formData.operation_id || formData.motif.trim().length < 10) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
                </button>
            </form>
        </div>
    );
};