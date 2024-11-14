import { useState, useCallback } from 'react';

export const useFirebaseError = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFirebaseOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    errorMessage: string = 'Une erreur est survenue'
  ): Promise<T | null> => {
    setError(null);
    setLoading(true);
    try {
      const result = await operation();
      return result;
    } catch (err: any) {
      console.error('Erreur Firebase:', err);
      
      if (err.code === 'permission-denied') {
        setError('Vous n\'avez pas les permissions nécessaires');
      } else if (err.code === 'unavailable') {
        setError('Service temporairement indisponible. Veuillez réessayer.');
      } else if (err.code === 'not-found') {
        setError('Document non trouvé');
      } else {
        setError(err.message || errorMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    error,
    loading,
    handleFirebaseOperation,
    clearError: () => setError(null)
  };
};