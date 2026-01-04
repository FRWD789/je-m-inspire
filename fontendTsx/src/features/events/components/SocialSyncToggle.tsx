// fontendTsx/src/features/events/components/SocialSyncToggle.tsx
import { useState, useEffect } from 'react';
import { Facebook, Instagram, Loader2 } from 'lucide-react';
import { privateApi } from '@/api/api';
import { useTranslation } from 'react-i18next';

interface SocialSyncToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  platforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
}

export default function SocialSyncToggle({
  enabled,
  onToggle,
  platforms,
  onPlatformsChange
}: SocialSyncToggleProps) {
  const { t } = useTranslation();
  const [availableConnections, setAvailableConnections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialConnections();
  }, []);

  const fetchSocialConnections = async () => {
    try {
      const response = await privateApi.get('/social/connections');
      const activeConnections = response.data.connections
        .filter((c: any) => c.is_active)
        .map((c: any) => c.platform);
      
      setAvailableConnections(activeConnections);
      
      // Auto-select all available platforms if sync is enabled
      if (enabled && platforms.length === 0 && activeConnections.length > 0) {
        onPlatformsChange(activeConnections);
      }
    } catch (error) {
      console.error('Error fetching social connections:', error);
      setAvailableConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      onPlatformsChange(platforms.filter(p => p !== platform));
    } else {
      onPlatformsChange([...platforms, platform]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">{t('eventForm.socialSync.loading')}</span>
      </div>
    );
  }

  if (availableConnections.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          {t('eventForm.socialSync.noConnections')}{' '}
          <a href="/profile" className="underline font-medium hover:text-yellow-900">
            {t('eventForm.socialSync.connectAccounts')}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
      {/* Main toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            const newEnabled = e.target.checked;
            onToggle(newEnabled);
            // Auto-select all platforms when enabling
            if (newEnabled && platforms.length === 0) {
              onPlatformsChange(availableConnections);
            }
          }}
          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <span className="font-medium text-gray-900">
          {t('eventForm.socialSync.publishToSocial')}
        </span>
      </label>

      {/* Platform selection */}
      {enabled && (
        <div className="ml-8 space-y-3 mt-4">
          <p className="text-sm text-gray-600 mb-2">
            {t('eventForm.socialSync.selectPlatforms')}
          </p>
          
          {availableConnections.includes('facebook') && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={platforms.includes('facebook')}
                onChange={() => handleTogglePlatform('facebook')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Facebook size={20} className="text-blue-600" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                Facebook
              </span>
            </label>
          )}

          {availableConnections.includes('instagram') && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={platforms.includes('instagram')}
                onChange={() => handleTogglePlatform('instagram')}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <Instagram size={20} className="text-pink-600" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                Instagram
              </span>
            </label>
          )}
        </div>
      )}

      {/* Info */}
      {enabled && platforms.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            ℹ️ {t('eventForm.socialSync.info', { 
              platforms: platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
            })}
          </p>
        </div>
      )}
    </div>
  );
}