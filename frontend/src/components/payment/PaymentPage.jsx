// components/payment/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../contexts/AuthContext';

const PaymentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { get, post } = useApi();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await get(`/api/events/${id}`);
                setEvent(response.data.event);
            } catch (error) {
                setError('Événement non trouvé');
                console.error('Erreur:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEvent();
        }
    }, [id]);

    const handleGoBack = () => {
        navigate('/');
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= (event?.available_places || 1)) {
            setQuantity(value);
        }
    };

    const handleStripePayment = async () => {
        if (!event) return;
        
        setPaymentLoading(true);
        try {
            console.log('Initiation paiement Stripe:', {
                event_id: id,
                quantity: quantity,
                total_amount: totalPrice
            });
            
            // Directement initier le paiement Stripe (pas de réservation préalable)
            const response = await post('/api/stripe/checkout', {
                event_id: id,
                quantity: quantity,
                total_amount: totalPrice
            });
            
            console.log('Réponse Stripe:', response);
            
            // Rediriger vers Stripe Checkout
            if (response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
            } else {
                alert('Erreur lors de l\'initialisation du paiement Stripe');
            }
        } catch (error) {
            console.error('Erreur paiement Stripe:', error);
            alert(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du paiement Stripe');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handlePayPalPayment = async () => {
        if (!event) return;
        
        setPaymentLoading(true);
        try {
            console.log('Initiation paiement PayPal:', {
                event_id: id,
                quantity: quantity,
                total_amount: totalPrice
            });
            
            // Directement initier le paiement PayPal (pas de réservation préalable)
            const response = await post('/api/paypal/checkout', {
                event_id: id,
                quantity: quantity,
                total_amount: totalPrice
            });
            
            console.log('Réponse PayPal:', response);
            
            // Rediriger vers PayPal
            if (response.data.approve_url) {
                window.location.href = response.data.approve_url;
            } else {
                alert('Erreur lors de l\'initialisation du paiement PayPal');
            }
        } catch (error) {
            console.error('Erreur paiement PayPal:', error);
            alert(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du paiement PayPal');
        } finally {
            setPaymentLoading(false);
        }
    };

    const totalPrice = event ? (event.base_price * quantity).toFixed(2) : 0;

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                Chargement de l'événement...
            </div>
        );
    }

    if (error || !event) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '50px',
                color: 'red'
            }}>
                <h2>Erreur</h2>
                <p>{error || 'Événement non trouvé'}</p>
                <button 
                    onClick={handleGoBack}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Retour aux événements
                </button>
            </div>
        );
    }

    return (
        <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            padding: '20px' 
        }}>
            <button 
                onClick={handleGoBack}
                style={{
                    marginBottom: '20px',
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                ← Retour
            </button>

            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '30px',
                backgroundColor: '#f9f9f9'
            }}>
                <h1 style={{ color: '#333', marginBottom: '20px' }}>
                    Paiement pour : {event.name}
                </h1>

                <div style={{ 
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    <h3>Détails de l'événement</h3>
                    <p><strong>Description :</strong> {event.description}</p>
                    <p><strong>Date de début :</strong> {new Date(event.start_date).toLocaleString('fr-FR')}</p>
                    <p><strong>Date de fin :</strong> {new Date(event.end_date).toLocaleString('fr-FR')}</p>
                    <p><strong>Prix par place :</strong> {event.base_price}€</p>
                    <p><strong>Places disponibles :</strong> {event.available_places}/{event.max_places}</p>
                    {event.localisation && (
                        <p><strong>Lieu :</strong> {event.localisation.name}</p>
                    )}
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    <h3>Réservation</h3>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Nombre de places :
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={event.available_places}
                            value={quantity}
                            onChange={handleQuantityChange}
                            disabled={paymentLoading}
                            style={{
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                width: '100px'
                            }}
                        />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                        Total : {totalPrice}€
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#e8f4f8',
                    padding: '20px',
                    borderRadius: '6px',
                    textAlign: 'center'
                }}>
                    <h2>Méthodes de paiement</h2>
                    <p>Choisissez votre méthode de paiement préférée</p>
                    
                    <div style={{ marginTop: '20px' }}>
                        <button 
                            onClick={handleStripePayment}
                            disabled={paymentLoading || event.available_places <= 0}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: paymentLoading ? '#6c757d' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: paymentLoading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                marginRight: '10px',
                                marginBottom: '10px'
                            }}
                        >
                            {paymentLoading ? 'Traitement...' : '💳 Payer avec Stripe'}
                        </button>
                        
                        <button 
                            onClick={handlePayPalPayment}
                            disabled={paymentLoading || event.available_places <= 0}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: paymentLoading ? '#6c757d' : '#ffc439',
                                color: '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: paymentLoading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                marginBottom: '10px'
                            }}
                        >
                            {paymentLoading ? 'Traitement...' : '🅿️ Payer avec PayPal'}
                        </button>
                    </div>
                    
                    <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
                        Paiement sécurisé • Remboursement garanti
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;