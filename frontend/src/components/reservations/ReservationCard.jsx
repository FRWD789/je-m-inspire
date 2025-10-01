import React from 'react';
import { formatDate, formatCurrency } from '../../utils/formatUtils';
import { getStatusBadge, getPaymentStatusBadge } from '../../utils/statusUtils';

const ReservationCard = ({ reservation, onCancel }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
    <ReservationHeader reservation={reservation} />
    <ReservationDetails reservation={reservation} />
    {reservation.peut_annuler && (
      <ReservationActions reservationId={reservation.id} onCancel={onCancel} />
    )}
  </div>
);

const ReservationHeader = ({ reservation }) => (
  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{reservation.event_name}</h3>
      <p className="text-sm text-gray-500">{formatDate(reservation.start_date)}</p>
    </div>
    <div className="text-right">
      {getStatusBadge(reservation.statut)}
    </div>
  </div>
);

export default ReservationCard;