// types/vehicle.ts

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface VehicleOwner {
  vehicleId: string;
  
  // Owner Info
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerPhoto?: string;
  
  // Vehicle Info
  vehicleNumber: string;
  vehicleType: string;
  vehicleModel?: string;
  vehicleColor?: string;
  
  // Emergency
  emergencyContacts: EmergencyContact[];
  
  // Medical
  bloodGroup?: string;
  allergies?: string;
  medicalNotes?: string;
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  qrCodeGenerated?: boolean;
}

export interface RegistrationFormData {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleColor: string;
  bloodGroup: string;
  allergies: string;
  medicalNotes: string;
  emergencyContacts: EmergencyContact[];
}