import React, { useState, useEffect } from 'react';
import { useAuth, useApi } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminApprovalPage = () => {
  const { user, hasRole } = useAuth();
  const { get, post, del } = useApi(); // del pour DELETE
  const navigate = useNavigate();

  const [professionals, setProfessionals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [showModal, setShowModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!hasRole('admin')) navigate('/');
  }, [user, hasRole, navigate]);

  useEffect(() => {
    fetchData();
  }, [activeFilter]);

// AdminApprovalPage.jsx
const fetchData = async () => {
  try {
    setLoading(true);
    let endpoint = '';

    switch (activeFilter) {
      case 'pending':
        endpoint = '/api/admin/pending-professionals';
        break;
      case 'approved':
        endpoint = '/api/admin/approved-professionals';
        break;
      case 'rejected':
        endpoint = '/api/admin/rejected-professionals';
        break;
      default:
        endpoint = '/api/admin/pending-professionals';
    }

    const response = await get(endpoint);
    
    // ✅ Vérifier si la réponse a une structure {success, data}
    const profData = response.data?.data || response.data || [];
    
    setProfessionals(Array.isArray(profData) ? profData : []);
    
    // Calculer les stats à partir des données reçues
    if (Array.isArray(profData)) {
      setStats({
        pending: profData.filter(u => !u.is_approved && !u.rejection_reason).length,
        approved: profData.filter(u => u.is_approved).length,
        rejected: profData.filter(u => u.rejection_reason).length
      });
    }
  } catch (error) {
    console.error('Erreur chargement:', error);
    alert('Erreur lors du chargement des données');
    setProfessionals([]); // ✅ Assurer que c'est toujours un tableau
  } finally {
    setLoading(false);
  }
};

  const handleApprove = async (userId, userName) => {
    if (!window.confirm(`Approuver ${userName} ?`)) return;

    setProcessing(userId);
    try {
      const response = await post(`/api/admin/approve-professional/${userId}`);

      alert('Professionnel approuvé avec succès !');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'approbation");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId) => {
    if (!rejectionReason || rejectionReason.length < 10) {
      alert('Veuillez fournir une raison (minimum 10 caractères)');
      return;
    }

    setProcessing(userId);
    try {
      const response = await del(`/api/admin/reject-professional/${userId}`, {
        reason: rejectionReason
      });

      alert('Professionnel rejeté');
      setShowModal(null);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors du rejet');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (pro) => {
    if (pro.is_approved)
      return <span style={badgeStyle('#28a745', '#fff')}>✓ Approuvé</span>;
    if (pro.rejection_reason)
      return <span style={badgeStyle('#dc3545', '#fff')}>✗ Rejeté</span>;
    return <span style={badgeStyle('#ffc107', '#000')}>⏳ En attente</span>;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '24px' }}>⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>👤 Approbation des Professionnels</h1>
        <button onClick={() => navigate('/')} style={btn('#6c757d')}>← Retour</button>
      </div>

      {/* Filtres */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        {[
          { value: 'pending', label: '⏳ En attente' },
          { value: 'approved', label: '✓ Approuvés' },
          { value: 'rejected', label: '✗ Rejetés' }
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            style={{
              ...btn(activeFilter === filter.value ? '#007bff' : '#f8f9fa', activeFilter === filter.value ? 'white' : '#333'),
              border: '1px solid #ddd'
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {professionals.length === 0 ? (
        <div style={emptyBox}>Aucun professionnel dans cette catégorie</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={th}>Nom</th>
              <th style={th}>Email</th>
              <th style={th}>Ville</th>
              <th style={th}>Inscription</th>
              <th style={th}>Statut</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {professionals.map((pro) => (
              <tr key={pro.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{pro.full_name}</td>
                <td style={td}>{pro.email}</td>
                <td style={td}>{pro.city || 'N/A'}</td>
                <td style={td}>{new Date(pro.created_at).toLocaleDateString('fr-FR')}</td>
                <td style={td}>
                  {getStatusBadge(pro)}
                  {pro.rejection_reason && (
                    <div style={reasonBox}><strong>Raison:</strong> {pro.rejection_reason}</div>
                  )}
                </td>
                <td style={td}>
                  {!pro.is_approved && !pro.rejection_reason && (
                    <>
                      <button
                        onClick={() => handleApprove(pro.id, pro.full_name)}
                        disabled={processing === pro.id}
                        style={actionBtn(processing === pro.id ? '#ccc' : '#28a745')}
                      >
                        {processing === pro.id ? '⏳' : '✓ Approuver'}
                      </button>
                      <button
                        onClick={() => setShowModal({ type: 'reject', user: pro })}
                        style={actionBtn('#dc3545')}
                      >
                        ✗ Rejeter
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal rejet */}
      {showModal?.type === 'reject' && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Rejeter {showModal.user.full_name}</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Raison du rejet..."
              rows={4}
              style={textarea}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(null)} style={btn('#6c757d')}>Annuler</button>
              <button
                onClick={() => handleReject(showModal.user.id)}
                style={btn('#dc3545')}
                disabled={rejectionReason.length < 10}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const btn = (bg, color = 'white') => ({
  padding: '10px 20px',
  backgroundColor: bg,
  color,
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
});

const badgeStyle = (bg, color) => ({
  backgroundColor: bg,
  color,
  padding: '6px 12px',
  borderRadius: '20px',
  fontWeight: 'bold'
});

const th = { padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' };
const td = { padding: '12px' };
const emptyBox = { padding: '40px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' };
const reasonBox = { marginTop: '6px', backgroundColor: '#f8d7da', borderRadius: '5px', padding: '6px', fontSize: '13px' };
const actionBtn = (bg) => ({ ...btn(bg), marginRight: '5px', fontSize: '13px' });
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalBox = { backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '500px' };
const textarea = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '20px' };

export default AdminApprovalPage;
