/ components/payment/PaymentResult.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const PaymentResult = () => {
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const paymentId = urlParams.get('payment_id');
        const status = urlParams.get('status');

        if (status === 'cancelled') {
            setPaymentData({ status: 'cancelled' });
            setLoading(false);
            return;
        }

        if (sessionId || paymentId) {
            fetchPaymentStatus(sessionId, paymentId);
        } else {
            setError('Aucune information de paiement trouvée');
            setLoading(false);
        }
    }, []);

    const fetchPaymentStatus = async (sessionId, paymentId) => {
        try {
            const params = new URLSearchParams();
            if (sessionId) params.append('session_id', sessionId);
            if (paymentId) params.append('payment_id', paymentId);

            const response = await fetch(`/api/payment/status?${params}`);
            const data = await response.json();

            if (data.success) {
                setPaymentData(data.payment);
            } else {
                setError(data.message || 'Erreur lors de la récupération du statut');
            }
        } catch (err) {
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={32} className="text-blue-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Vérification...</h1>
                <p className="text-gray-600">
                    Nous vérifions le statut de votre paiement, veuillez patienter.
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle size={32} className="text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de paiement</h1>
                <p className="text-gray-600 mb-6">{error}</p>
                
                <div className="space-y-3">
                    <button
                        onClick={() => window.location.href = '/events'}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Retour aux événements
                    </button>
                </div>
            </div>
        );
    }

    if (paymentData?.status === 'cancelled') {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle size={32} className="text-yellow-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement annulé</h1>
                <p className="text-gray-600 mb-6">
                    Vous avez annulé le processus de paiement. Aucun montant n'a été débité.
                </p>
                
                <div className="space-y-3">
                    <button
                        onClick={() => window.location.href = '/events'}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Retour aux événements
                    </button>
                </div>
            </div>
        );
    }

    if (paymentData?.status === 'paid') {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h1>
                <p className="text-gray-600 mb-6">
                    Votre réservation a été confirmée avec succès.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold text-gray-900 mb-2">Détails de la réservation</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Événement :</strong> {paymentData.event?.name}</p>
                        <p><strong>Date :</strong> {formatDate(paymentData.event?.start_date)}</p>
                        <p><strong>Lieu :</strong> {paymentData.event?.localisation}</p>
                        <p><strong>Nombre de places :</strong> {paymentData.quantity}</p>
                        <p><strong>Prix unitaire :</strong> {paymentData.unit_price}€</p>
                        <p><strong>Total payé :</strong> {paymentData.total}€</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => window.location.href = '/mes-reservations'}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Voir mes réservations
                    </button>
                    <button
                        onClick={() => window.location.href = '/events'}
                        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        Retour aux événements
                    </button>
                </div>
            </div>
        );
    }

    // Status pending
    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement en cours</h1>
            <p className="text-gray-600 mb-6">
                Votre paiement est en cours de traitement. Veuillez patienter quelques instants.
            </p>
            
            {paymentData && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold text-gray-900 mb-2">Informations</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Montant :</strong> {paymentData.total}€</p>
                        <p><strong>Statut :</strong> En attente de confirmation</p>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    Actualiser
                </button>
                <button
                    onClick={() => window.location.href = '/mes-reservations'}
                    className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                    Voir mes réservations
                </button>
            </div>
        </div>
    );
};

export default PaymentResult;