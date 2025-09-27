import React from 'react';
import { CheckCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatUtils';

const PaymentSuccess = ({ paymentData }) => (
  <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <CheckCircle size={32} className="text-green-600" />
    </div>
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h1>
    <p className="text-gray-600 mb-6">
      Votre réservation a été confirmée avec succès.
    </p>
    
    <ReservationDetails paymentData={paymentData} />
    <SuccessActions />
  </div>
);

const ReservationDetails = ({ paymentData }) => (
  <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
    <h3 className="font-semibold text-gray-900 mb-2">Détails de la réservation</h3>
    <div className="space-y-1 text-sm text-gray-600">
      <p><strong>Événement :</strong> {paymentData.event?.name}</p>
      <p><strong>Date :</strong> {formatDate(paymentData.event?.start_date)}</p>
      <p><strong>Lieu :</strong> {paymentData.event?.localisation}</p>
      <p><strong>Nombre de places :</strong> {paymentData.quantity}</p>
      <p><strong>Prix unitaire :</strong> {formatCurrency(paymentData.unit_price)}</p>
      <p><strong>Total payé :</strong> {formatCurrency(paymentData.total)}</p>
    </div>
  </div>
);

const SuccessActions = () => (
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
);

export default PaymentSuccess;