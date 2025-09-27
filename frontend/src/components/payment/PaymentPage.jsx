import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Clock } from 'lucide-react';
import { usePayment } from '../../hooks/usePayment';
import { formatCurrency, formatDate } from '../../utils/formatUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

const PaymentPage = ({ event, onBack }) => {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const { processPayment, loading, error } = usePayment();

  const totalAmount = quantity * event.base_price;

  const handlePayment = async () => {
    const result = await processPayment({
      event_id: event.id,
      quantity,
      method: paymentMethod
    });

    if (result.success) {
      window.location.href = result.checkout_url || result.approve_url;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <PaymentHeader onBack={onBack} />
      <EventSummary event={event} />
      <QuantitySelector 
        quantity={quantity}
        setQuantity={setQuantity}
        maxQuantity={event.available_places}
      />
      <PaymentSummary quantity={quantity} unitPrice={event.base_price} />
      <PaymentMethodSelector 
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
      />
      {error && <ErrorAlert message={error} />}
      <PaymentButton 
        onClick={handlePayment}
        loading={loading}
        amount={totalAmount}
        disabled={quantity > event.available_places}
      />
    </div>
  );
};

export default PaymentPage;