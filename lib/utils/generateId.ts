// lib/utils/generateId.ts

import { v4 as uuidv4 } from 'uuid';

export function generateVehicleId(): string {
  return uuidv4();
}

export function generateShortId(): string {
  // Generate shorter ID for demo (first 8 chars of UUID)
  return uuidv4().split('-')[0];
}