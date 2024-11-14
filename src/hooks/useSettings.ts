import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

export const useSettings = (section: string) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings(section);
        setSettings(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [section]);

  const updateSettings = async (newSettings: any) => {
    try {
      await settingsService.updateSettings(section, newSettings);
      setSettings(newSettings);
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  };

  return { settings, loading, error, updateSettings };
};