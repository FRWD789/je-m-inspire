import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

export default function Forbidden() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const getUserRole = () => {
    if (!user || !user.roles || user.roles.length === 0) return 'utilisateur';
    return user.roles[0].role;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>

        {/* Status Code */}
        <div className="text-red-600 font-bold text-6xl mb-2">403</div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          {t('common.accessDenied')}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {t('common.noPermission')}
        </p>

        {/* User info */}
        {user && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Connecté en tant que :</p>
            <p className="font-semibold text-gray-800">{user.profile.name} {user.profile.last_name}</p>
            <p className="text-xs text-gray-500 mt-1">
              Rôle : {getUserRole() === 'admin' ? 'Administrateur' : getUserRole() === 'professionnel' ? 'Professionnel' : 'Utilisateur'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            🏠 {t('common.returnHome')}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            ← Retour
          </button>
        </div>

        {/* Help text */}
        <p className="text-sm text-gray-500 mt-6">
          Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur.
        </p>
      </div>
    </div>
  );
}