import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

interface ProfileData {
  nickname?: string;
}

export async function updateProfile(userId: string, data: ProfileData) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
}