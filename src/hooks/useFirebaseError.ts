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
      
      if (err?.message) {
        setError(err.message);
      } else {
        setError(errorMessage);
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