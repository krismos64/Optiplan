import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCDXiN-EtHGlNsPSye8R8Dx_Hl2igx9SjM",
  authDomain: "optiplan-ee106.firebaseapp.com",
  projectId: "optiplan-ee106",
  storageBucket: "optiplan-ee106.firebasestorage.app",
  messagingSenderId: "374320294526",
  appId: "1:374320294526:web:0e9da015bcf820b98cc62f",
  measurementId: "G-HJFSBSW3R0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Activer la persistance hors ligne
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.error('La persistance ne peut pas être activée car plusieurs onglets sont ouverts');
  } else if (err.code === 'unimplemented') {
    console.error('Le navigateur ne supporte pas la persistance');
  }
});