// components/EmergencyInfo.tsx

'use client';

import { VehicleOwner } from '@/types/vehicle';
import { FiPhone, FiMail, FiUser, FiHeart } from 'react-icons/fi';

interface EmergencyInfoProps {
  vehicle: VehicleOwner;
}

export default function EmergencyInfo({ vehicle }: EmergencyInfoProps) {
  return (
    <div className="space-y-6">
      {/* Critical Alert Banner */}
      <div className="bg-red-600 text-white p-6 rounded-xl text-center animate-pulse">
        <h2 className="text-2xl font-bold mb-2">🚨 EMERGENCY ALERT</h2>
        <p className="text-lg">Emergency contacts will be notified</p>
      </div>

      {/* Owner Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiUser className="text-blue-600" />
          Vehicle Owner Information
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Name:</span>
            <span className="font-semibold text-gray-900">{vehicle.ownerName}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Phone:</span>
            <a 
              href={`tel:${vehicle.ownerPhone}`}
              className="font-semibold text-blue-600 hover:underline"
            >
              {vehicle.ownerPhone}
            </a>
          </div>
          
          {vehicle.ownerEmail && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Email:</span>
              <a 
                href={`mailto:${vehicle.ownerEmail}`}
                className="font-semibold text-blue-600 hover:underline"
              >
                {vehicle.ownerEmail}
              </a>
            </div>
          )}

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Vehicle Number:</span>
            <span className="font-semibold text-gray-900">{vehicle.vehicleNumber}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Vehicle Type:</span>
            <span className="font-semibold text-gray-900">{vehicle.vehicleType}</span>
          </div>

          {vehicle.vehicleModel && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Model:</span>
              <span className="font-semibold text-gray-900">{vehicle.vehicleModel}</span>
            </div>
          )}

          {vehicle.vehicleColor && (
            <div className="flex justify-between pb-2">
              <span className="text-gray-600">Color:</span>
              <span className="font-semibold text-gray-900">{vehicle.vehicleColor}</span>
            </div>
          )}
        </div>
      </div>

      {/* Medical Information */}
      {(vehicle.bloodGroup || vehicle.allergies || vehicle.medicalNotes) && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-700">
            <FiHeart className="text-red-600" />
            Medical Information
          </h3>
          
          <div className="space-y-2">
            {vehicle.bloodGroup && (
              <div className="flex justify-between">
                <span className="text-gray-700">Blood Group:</span>
                <span className="font-bold text-red-700 text-lg">{vehicle.bloodGroup}</span>
              </div>
            )}
            
            {vehicle.allergies && (
              <div className="flex justify-between">
                <span className="text-gray-700">Allergies:</span>
                <span className="font-semibold text-gray-900">{vehicle.allergies}</span>
              </div>
            )}
            
            {vehicle.medicalNotes && (
              <div>
                <span className="text-gray-700 block mb-1">Medical Notes:</span>
                <p className="text-gray-900 bg-white p-3 rounded border border-red-200">
                  {vehicle.medicalNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
          <FiPhone className="text-blue-600" />
          Emergency Contacts
        </h3>
        
        <div className="space-y-4">
          {vehicle.emergencyContacts.map((contact, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg p-4 shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.relation}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                  Contact {index + 1}
                </span>
              </div>
              <a 
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <FiPhone />
                {contact.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}