import React, { useEffect, useState } from 'react';
import { Loader2, Search, UserPlus, UserMinus, Bell, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { privateApi } from '@/api/api';
import { useTranslation } from 'react-i18next';

interface FollowingPro {
  id: number;
  name: string;
  last_name: string;
  profile_picture: string | null;
  city: string | null;
  pivot?: {
    notifications_enabled: boolean;
  };
}

export default function MyFollowingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [following, setFollowing] = useState<FollowingPro[]>([]);

  useEffect(() => {
    fetchMyFollowing();
  }, []);

  const fetchMyFollowing = async () => {
    try {
      const res = await privateApi.get('/my-following');
      setFollowing(res.data.following || []);
    } catch (error: any) {
      console.error('Error fetching following:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
      } else {
        alert(t('common.somethingWentWrong'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (proId: number, proName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(t('following.unfollowConfirm', { name: proName }))) {
      return;
    }

    try {
      await privateApi.post(`/follow/${proId}`);
      setFollowing(prev => prev.filter(pro => pro.id !== proId));
    } catch (error: any) {
      console.error('Error unfollowing:', error);
      alert(t('following.unfollowError'));
    }
  };

  const handleToggleNotifications = async (proId: number, currentState: boolean, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await privateApi.put(`/follow/${proId}/notifications`, {
        notifications_enabled: !currentState
      });
      
      setFollowing(prev => prev.map(pro => 
        pro.id === proId 
          ? { ...pro, pivot: { ...pro.pivot, notifications_enabled: !currentState } }
          : pro
      ));
    } catch (error: any) {
      console.error('Error toggling notifications:', error);
      alert(t('following.notificationError'));
    }
  };

  const filteredFollowing = following.filter(pro =>
    `${pro.name} ${pro.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProClick = (proId: number) => {
    navigate(`/user/${proId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header avec titre */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('following.title')}</h1>
      </div>

      {/* Barre de recherche et bouton */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Barre de recherche */}
        <div className="flex items-center flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white">
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('following.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full focus:outline-none px-2 text-sm"
          />
        </div>

        {/* Bouton Découvrir */}
        <button
          onClick={() => navigate('/professionals')}
          className="flex items-center justify-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          {t('following.discoverPros')}
        </button>
      </div>

      {/* Liste des professionnels suivis */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-8 h-8 text-accent" />
          </div>
        ) : filteredFollowing.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <UserPlus size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm ? t('following.noResults') : t('following.noFollowing')}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {t('following.noFollowingDesc')}
            </p>
            <button
              onClick={() => navigate('/events')}
              className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              {t('following.browseEvents')}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              {filteredFollowing.length} {filteredFollowing.length > 1 ? t('following.professionals') : t('following.professional')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFollowing.map(pro => (
                <div
                  key={pro.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition group relative"
                >
                  {/* Boutons d'action */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Bouton notifications */}
                    <button
                      onClick={(e) => handleToggleNotifications(pro.id, pro.pivot?.notifications_enabled ?? true, e)}
                      className={`p-2 rounded-lg transition ${
                        pro.pivot?.notifications_enabled
                          ? 'text-blue-500 hover:bg-blue-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={pro.pivot?.notifications_enabled ? t('following.disableNotifications') : t('following.enableNotifications')}
                    >
                      {pro.pivot?.notifications_enabled ? <Bell size={18} /> : <BellOff size={18} />}
                    </button>

                    {/* Bouton de désabonnement */}
                    <button
                      onClick={(e) => handleUnfollow(pro.id, `${pro.name} ${pro.last_name}`, e)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title={t('following.unfollow')}
                    >
                      <UserMinus size={18} />
                    </button>
                  </div>

                  {/* Contenu cliquable */}
                  <div
                    onClick={() => handleProClick(pro.id)}
                    className="flex items-center gap-4 cursor-pointer"
                  >
                    {/* Photo de profil */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 relative">
                      {pro.profile_picture ? (
                        <img
                          src={pro.profile_picture}
                          alt={`${pro.name} ${pro.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                          {pro.name[0]}{pro.last_name[0]}
                        </div>
                      )}
                      {/* Badge notifications */}
                      {pro.pivot?.notifications_enabled === false && (
                        <div className="absolute bottom-0 right-0 bg-gray-500 rounded-full p-1">
                          <BellOff size={12} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-accent transition">
                        {pro.name} {pro.last_name}
                      </h3>
                      {pro.city && (
                        <p className="text-sm text-gray-500 truncate">
                          {pro.city}
                        </p>
                      )}
                      {pro.pivot?.notifications_enabled === false && (
                        <p className="text-xs text-gray-400 mt-1">
                          {t('following.notificationsMuted')}
                        </p>
                      )}
                    </div>

                    {/* Icône */}
                    <div className="text-gray-400 group-hover:text-accent transition">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}