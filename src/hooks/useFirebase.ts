import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, QueryConstraint, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFirebaseCollection<T>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, collectionName), ...queryConstraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const items = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as T[];
            setData(items);
            setLoading(false);
          } catch (err) {
            console.error(`Erreur lors du traitement des données de ${collectionName}:`, err);
            setError(err as Error);
            setLoading(false);
          }
        },
        (err) => {
          console.error(`Erreur lors de l'écoute de la collection ${collectionName}:`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error(`Erreur lors de l'initialisation de la collection ${collectionName}:`, err);
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
}

export function useFirebaseDocument<T>(collectionName: string, documentId: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const docRef = doc(db, collectionName, documentId);

      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          try {
            if (doc.exists()) {
              setData({ id: doc.id, ...doc.data() } as T);
            } else {
              setData(null);
            }
            setLoading(false);
          } catch (err) {
            console.error(`Erreur lors du traitement du document ${documentId}:`, err);
            setError(err as Error);
            setLoading(false);
          }
        },
        (err) => {
          console.error(`Erreur lors de l'écoute du document ${documentId}:`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error(`Erreur lors de l'initialisation du document ${documentId}:`, err);
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionName, documentId]);

  return { data, loading, error };
}