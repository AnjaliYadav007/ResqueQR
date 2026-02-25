// test-structure.ts
import { db } from '@/lib/firebase/config';
import { generateVehicleId } from '@/lib/utils/generateId';
import { VehicleOwner } from '@/types/vehicle';

console.log('✅ All imports working!');
console.log('Firebase DB:', db ? 'Connected' : 'Not connected');
console.log('Sample Vehicle ID:', generateVehicleId());
