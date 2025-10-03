import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '../hooks/useEvent';
import PaymentPage from '../components/payment/PaymentPage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PaymentPageContainer = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { event, loading, error } = useEvent(eventId);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 text-center p-6">{error}</div>;

  return (
    <PaymentPage 
      event={event} 
      onBack={() => navigate(`/events/${eventId}`)} 
    />
  );
};

export default PaymentPageContainer;