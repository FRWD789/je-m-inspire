import React, { useState, useEffect } from 'react';
import { useAuth, useApi } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminApprovalPage = () => {
  const { user, hasRole } = useAuth();
  const { get, post, del } = useApi();
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
      
      const profData = response.data?.data || response.data || [];
      
      setProfessionals(Array.isArray(profData) ? profData : []);
      
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
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, userName) => {
    if (!window.confirm(`Approuver ${userName} ?`)) return;

    setProcessing(userId);
    try {
      await post(`/api/admin/approve-professional/${userId}`);
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
      // ✅ Utiliser POST avec la bonne URL
      await post(`/api/admin/reject-professional/${userId}`, {
        reason: rejectionReason
      });

      alert('Professionnel rejeté et supprimé avec succès');
      setShowModal(null);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      console.error('Erreur rejet:', error);
      alert(error.response?.data?.message || 'Erreur lors du rejet');
    } finally {
      setProcessing(null);
    }
  };

  // ✅ Fonction pour afficher la lettre de motivation
  const showMotivationLetter = (pro) => {
    setShowModal({ type: 'motivation', user: pro });
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
              <tr 
                key={pro.id} 
                style={{ 
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => showMotivationLetter(pro)}
              >
                <td style={td}>{pro.name} {pro.last_name}</td>
                <td style={td}>{pro.email}</td>
                <td style={td}>{pro.city || 'N/A'}</td>
                <td style={td}>{new Date(pro.created_at).toLocaleDateString('fr-FR')}</td>
                <td style={td}>
                  {getStatusBadge(pro)}
                  {pro.rejection_reason && (
                    <div style={reasonBox}><strong>Raison:</strong> {pro.rejection_reason}</div>
                  )}
                </td>
                <td style={td} onClick={(e) => e.stopPropagation()}>
                  {!pro.is_approved && !pro.rejection_reason && (
                    <>
                      <button
                        onClick={() => handleApprove(pro.id, pro.last_name)}
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

      {/* ✅ Modal lettre de motivation */}
      {showModal?.type === 'motivation' && (
        <div style={modalOverlay} onClick={() => setShowModal(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>📝 Lettre de motivation</h3>
              <button 
                onClick={() => setShowModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <p style={{ margin: '5px 0' }}><strong>Nom:</strong> {showModal.user.name} {showModal.user.last_name}</p>
              <p style={{ margin: '5px 0' }}><strong>Email:</strong> {showModal.user.email}</p>
              <p style={{ margin: '5px 0' }}><strong>Ville:</strong> {showModal.user.city || 'N/A'}</p>
              <p style={{ margin: '5px 0' }}><strong>Date de naissance:</strong> {new Date(showModal.user.date_of_birth).toLocaleDateString('fr-FR')}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#333' }}>Lettre de motivation:</h4>
              <div style={{
                padding: '15px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '5px',
                minHeight: '150px',
                maxHeight: '300px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                {showModal.user.motivation_letter || 'Aucune lettre de motivation fournie'}
              </div>
            </div>

            {!showModal.user.is_approved && !showModal.user.rejection_reason && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => {
                    setShowModal(null);
                    handleApprove(showModal.user.id, showModal.user.last_name);
                  }}
                  style={btn('#28a745')}
                >
                  ✓ Approuver
                </button>
                <button
                  onClick={() => setShowModal({ type: 'reject', user: showModal.user })}
                  style={btn('#dc3545')}
                >
                  ✗ Rejeter
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal rejet */}
      {showModal?.type === 'reject' && (
        <div style={modalOverlay} onClick={() => setShowModal(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3>Rejeter {showModal.user.name} {showModal.user.last_name}</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Raison du rejet (minimum 10 caractères)..."
              rows={4}
              style={textarea}
            />
            <small style={{ color: '#666', display: 'block', marginBottom: '15px' }}>
              {rejectionReason.length}/500 caractères
            </small>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(null)} style={btn('#6c757d')}>Annuler</button>
              <button
                onClick={() => handleReject(showModal.user.id)}
                style={btn('#dc3545')}
                disabled={rejectionReason.length < 10}
              >
                Confirmer le rejet
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
  fontWeight: 'bold',
  fontSize: '12px'
});

const th = { padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' };
const td = { padding: '12px' };
const emptyBox = { padding: '40px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' };
const reasonBox = { marginTop: '6px', backgroundColor: '#f8d7da', borderRadius: '5px', padding: '6px', fontSize: '13px' };
const actionBtn = (bg) => ({ ...btn(bg), marginRight: '5px', fontSize: '13px' });
const modalOverlay = { 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  backgroundColor: 'rgba(0,0,0,0.5)', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  zIndex: 1000
};
const modalBox = { 
  backgroundColor: 'white', 
  padding: '30px', 
  borderRadius: '10px', 
  width: '90%', 
  maxWidth: '600px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
};
const textarea = { 
  width: '100%', 
  padding: '10px', 
  borderRadius: '5px', 
  border: '1px solid #ccc', 
  marginBottom: '10px',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  resize: 'vertical'
};

export default AdminApprovalPage;