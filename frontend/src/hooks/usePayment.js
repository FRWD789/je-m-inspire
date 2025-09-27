import { useState } from 'react';

export const usePayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const processPayment = async (paymentData) => {
        setLoading(true);
        setError('');

        try {
            const endpoint = paymentData.method === 'stripe' ? '/api/stripe/checkout' : '/api/paypal/checkout';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    event_id: paymentData.event_id,
                    quantity: paymentData.quantity
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erreur lors du paiement');
            }

            return result;
        } catch (err) {
            setError(err.message);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        processPayment
    };
};