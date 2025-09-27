export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// utils/statusUtils.js
export const getStatusBadge = (status) => {
  const statusConfig = {
    'À venir': 'bg-blue-100 text-blue-800',
    'En cours': 'bg-green-100 text-green-800',
    'Terminé': 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status]}`}>
      {status}
    </span>
  );
};

export const getPaymentStatusBadge = (status) => {
  const statusConfig = {
    'paid': { text: 'Payé', class: 'bg-green-100 text-green-800' },
    'pending': { text: 'En attente', class: 'bg-yellow-100 text-yellow-800' },
    'failed': { text: 'Échoué', class: 'bg-red-100 text-red-800' }
  };

  const config = statusConfig[status] || statusConfig['failed'];
  
  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
      {config.text}
    </span>
  );
};