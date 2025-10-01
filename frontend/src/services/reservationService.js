const API_BASE = '/api';

export const reservationService = {
    async getMyReservations() {
        const response = await fetch(`${API_BASE}/mes-reservations`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des réservations');
        }

        return response.json();
    },

    async cancelReservation(reservationId) {
        const response = await fetch(`${API_BASE}/reservations/${reservationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de l\'annulation');
        }

        return response.json();
    }
};