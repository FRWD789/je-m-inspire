import React, { useState, useEffect } from 'react';
import { useAuth, useApi } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DEBUG = import.meta.env.DEV;
const debug = (...args) => {
  if (DEBUG) console.log(...args);
};
const debugError = (...args) => {
  if (DEBUG) console.error(...args);
};

const AdminApprovalPage = () => {
  const { user, hasRole } = useAuth();
  const { get, post, del } = useApi();
  const navigate = useNavigate();

  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!hasRole('admin')) navigate('/');
  }, [user, hasRole, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await get('/api/admin/pending-professionals');
      const profData = response.data?.data || response.data || [];
      
      setProfessionals(Array.isArray(profData) ? profData : []);
    } catch (error) {
      debugError('Erreur chargement:', error);
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
      await del(`/api/admin/reject-professional/${userId}`, {
        reason: rejectionReason
      });

      alert('Professionnel rejeté et compte supprimé');
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '24px' }}>⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0 }}>👤 Approbation des Professionnels</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            {professionals.length} demande{professionals.length > 1 ? 's' : ''} en attente
          </p>
        </div>
        <button onClick={() => navigate('/')} style={btn('#6c757d')}>← Retour</button>
      </div>

      {/* Liste */}
      {professionals.length === 0 ? (
        <div style={emptyBox}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
            Aucune demande en attente
          </div>
          <div style={{ color: '#666' }}>
            Tous les professionnels ont été traités
          </div>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={th}>Nom</th>
              <th style={th}>Email</th>
              <th style={th}>Ville</th>
              <th style={th}>Inscription</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {professionals.map((pro) => (
              <tr key={pro.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{String(pro.last_name || '')}</td>
                <td style={td}>{String(pro.email || '')}</td>
                <td style={td}>{String(pro.city || 'N/A')}</td>
                <td style={td}>
                  {pro.created_at 
                    ? new Date(pro.created_at).toLocaleDateString('fr-FR')
                    : 'N/A'}
                </td>
                <td style={td}>
                  <button
                    onClick={() => handleApprove(pro.id, String(pro.last_name || 'cet utilisateur'))}
                    disabled={processing === pro.id}
                    style={actionBtn(processing === pro.id ? '#ccc' : '#28a745')}
                  >
                    {processing === pro.id ? '⏳' : '✓ Approuver'}
                  </button>
                  <button
                    onClick={() => setShowModal({ type: 'reject', user: pro })}
                    disabled={processing === pro.id}
                    style={actionBtn('#dc3545')}
                  >
                    ✗ Rejeter
                  </button>
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
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ marginTop: 0 }}>
              Rejeter {String(showModal.user.last_name || 'cet utilisateur')}
            </h3>
            <p style={{ color: '#dc3545', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px', fontSize: '14px' }}>
              ⚠️ <strong>Attention :</strong> Le compte sera définitivement supprimé
            </p>
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
              <button onClick={() => setShowModal(null)} style={btn('#6c757d')}>
                Annuler
              </button>
              <button
                onClick={() => handleReject(showModal.user.id)}
                style={btn('#dc3545')}
                disabled={rejectionReason.length < 10}
              >
                Confirmer la suppression
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
  cursor: 'pointer',
  fontWeight: '500'
});

const th = { 
  padding: '15px 12px', 
  borderBottom: '2px solid #dee2e6', 
  textAlign: 'left',
  fontWeight: '600',
  color: '#495057'
};

const td = { 
  padding: '15px 12px',
  color: '#212529'
};

const emptyBox = { 
  padding: '60px 40px', 
  textAlign: 'center', 
  backgroundColor: '#f8f9fa', 
  borderRadius: '8px',
  border: '2px dashed #dee2e6'
};

const actionBtn = (bg) => ({ 
  ...btn(bg), 
  marginRight: '8px', 
  fontSize: '14px',
  padding: '8px 16px'
});

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
  maxWidth: '500px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
};

const textarea = { 
  width: '100%', 
  padding: '10px', 
  borderRadius: '5px', 
  border: '1px solid #ccc', 
  marginBottom: '20px',
  fontSize: '14px',
  fontFamily: 'inherit',
  resize: 'vertical'
};

export default AdminApprovalPage;