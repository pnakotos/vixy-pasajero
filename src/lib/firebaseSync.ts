import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, getDoc, collection, onSnapshot, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { UserProfile, RideRequest, WalletTransaction } from '../types';

/**
 * Synchronize User Profile to Firestore /users/{userId}
 */
export async function syncUserProfileToFirestore(user: UserProfile) {
  if (!user || !user.id) return;
  const path = `users/${user.id}`;
  try {
    const userRef = doc(db, 'users', user.id);
    const payload = {
      uid: user.id,
      name: `${user.name} ${user.lastName || ''}`.trim(),
      email: user.email || '',
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
      isVerified: Boolean(user.isVerified),
      verificationStatus: user.verificationStatus || 'unverified',
      emergencyContact: user.emergencyContact || '',
      emergencyPhone: user.emergencyPhone || '',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userRef, payload, { merge: true });
  } catch (error) {
    console.warn('Syncing user profile to Firestore offline/warn:', error);
  }
}

/**
 * Synchronize Active or Completed Ride to Firestore /rides/{rideId}
 */
export async function syncRideToFirestore(ride: RideRequest, userId: string) {
  if (!ride || !ride.id) return;
  const path = `rides/${ride.id}`;
  try {
    const rideRef = doc(db, 'rides', ride.id);
    const payload = {
      id: ride.id,
      userId: userId || 'anonymous',
      category: ride.category,
      pickupAddress: ride.pickupAddress || '',
      dropoffAddress: ride.dropoffAddress || '',
      pickupCoords: ride.pickupCoords || [10.496, -66.8488],
      dropoffCoords: ride.dropoffCoords || [10.4883, -66.8893],
      priceUsd: ride.priceUsd,
      priceVes: ride.priceVes,
      paymentMethod: ride.paymentMethod || 'pago_movil',
      status: ride.status,
      driver: ride.driver ? {
        id: ride.driver.id,
        name: ride.driver.name,
        rating: ride.driver.rating,
        vehicleModel: ride.driver.vehicleModel,
        vehiclePlate: ride.driver.vehiclePlate,
        phone: ride.driver.phone,
      } : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(rideRef, payload, { merge: true });
  } catch (error) {
    console.warn('Syncing ride to Firestore offline/warn:', error);
  }
}

/**
 * Listen for user rides in real time from Firestore
 */
export function listenToUserRides(userId: string, onRidesUpdated: (rides: any[]) => void) {
  if (!userId) return () => {};
  const path = 'rides';
  try {
    const ridesRef = collection(db, 'rides');
    const q = query(ridesRef, where('userId', '==', userId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ridesList = snapshot.docs.map(docSnap => docSnap.data());
        onRidesUpdated(ridesList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Realtime listener rides error:', err);
    return () => {};
  }
}

/**
 * Synchronize Wallet Transaction to Firestore /users/{userId}/transactions/{transactionId}
 */
export async function syncTransactionToFirestore(userId: string, tx: WalletTransaction) {
  if (!userId || !tx || !tx.id) return;
  const path = `users/${userId}/transactions/${tx.id}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', tx.id);
    const payload = {
      id: tx.id,
      userId: userId,
      type: tx.type,
      amountUsd: tx.amountUsd.toString(),
      amountVes: tx.amountVes.toString(),
      method: tx.method,
      status: tx.status,
      reference: tx.reference || '',
      date: tx.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    await setDoc(txRef, payload, { merge: true });
  } catch (error) {
    console.warn('Syncing transaction to Firestore error:', error);
  }
}
