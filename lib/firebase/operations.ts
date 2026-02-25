// lib/firebase/operations.ts

import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { VehicleOwner } from '@/types/vehicle';

const COLLECTION_NAME = 'vehicles';

// Create new vehicle registration
export async function createVehicle(vehicleData: VehicleOwner): Promise<string> {
  try {
    const vehicleRef = doc(db, COLLECTION_NAME, vehicleData.vehicleId);
    
    await setDoc(vehicleRef, {
      ...vehicleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      qrCodeGenerated: true,
    });
    
    return vehicleData.vehicleId;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw new Error('Failed to register vehicle');
  }
}

// Get vehicle by ID
export async function getVehicleById(vehicleId: string): Promise<VehicleOwner | null> {
  try {
    const vehicleRef = doc(db, COLLECTION_NAME, vehicleId);
    const vehicleSnap = await getDoc(vehicleRef);
    
    if (vehicleSnap.exists()) {
      return vehicleSnap.data() as VehicleOwner;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw new Error('Failed to fetch vehicle data');
  }
}

// Check if vehicle ID exists
export async function vehicleExists(vehicleId: string): Promise<boolean> {
  try {
    const vehicleRef = doc(db, COLLECTION_NAME, vehicleId);
    const vehicleSnap = await getDoc(vehicleRef);
    return vehicleSnap.exists();
  } catch (error) {
    console.error('Error checking vehicle:', error);
    return false;
  }
}

// Update vehicle data
export async function updateVehicle(
  vehicleId: string, 
  updates: Partial<VehicleOwner>
): Promise<void> {
  try {
    const vehicleRef = doc(db, COLLECTION_NAME, vehicleId);
    await updateDoc(vehicleRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw new Error('Failed to update vehicle');
  }
}