'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getVehicleById } from '@/lib/firebase/operations';
import { getCurrentLocation, getGoogleMapsUrl } from '@/lib/utils/geolocation';
import { sendMultipleWhatsAppAlerts, createEmergencyMessage } from '@/lib/utils/alerts';
import { VehicleOwner } from '@/types/vehicle';
import { FiMapPin, FiPhone, FiAlertCircle } from 'react-icons/fi';

export default function EmergencyAlertPage() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;

  const [vehicle, setVehicle] = useState<VehicleOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [alertSent, setAlertSent] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);

  useEffect(() => {
    fetchVehicleData();
    getLocation();
  }, [vehicleId]);

  // ⭐ AUTO WHATSAPP TRIGGER - Sends alert automatically when page loads
  useEffect(() => {
    if (vehicle && !alertSent && !sendingAlert) {
      // Auto-trigger alert 2 seconds after page loads
      const timer = setTimeout(() => {
        handleSendAlert();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [vehicle, alertSent, sendingAlert]);

  const fetchVehicleData = async () => {
    try {
      console.log('Fetching vehicle:', vehicleId);
      const data = await getVehicleById(vehicleId);
      
      if (!data) {
        setError('Vehicle not found. Invalid QR code.');
        return;
      }
      
      console.log('Vehicle found:', data);
      setVehicle(data);
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setError('Failed to load vehicle information.');
    } finally {
      setLoading(false);
    }
  };

const getLocation = async () => {
  try {
    const loc = await getCurrentLocation();

    if (loc) {
      setLocation({ lat: loc.latitude, lng: loc.longitude });
    } else {
      console.log("Location denied");
    }
  } catch {
    console.log("Location error");
  }
};

  const handleSendAlert = async () => {
    if (!vehicle) return;

    setSendingAlert(true);

    try {
      // Get current location with proper property names

const locationUrl = location
  ? getGoogleMapsUrl(location.lat, location.lng)
  : undefined;

      const message = createEmergencyMessage(
        vehicle.ownerName,
        vehicle.vehicleNumber,
        locationUrl,
        vehicle.bloodGroup
      );

      console.log('Sending WhatsApp alerts...');
      sendMultipleWhatsAppAlerts(vehicle.emergencyContacts, message);
      
      setAlertSent(true);
    } catch (err) {
      console.error('Error sending alert:', err);
      alert('Failed to send alerts. Please call emergency contacts directly.');
    } finally {
      setSendingAlert(false);
    }
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Emergency Information...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-4 border-red-500">
          <div className="text-7xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-700 text-lg mb-6">{error || 'Vehicle information not found'}</p>
          
 <a
  href="tel:112"
  className="block w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
>
  <FiPhone className="inline mr-2" />
  Call Emergency Services (112)
</a>
        </div>
      </div>
    );
  }

  // ===== MAIN EMERGENCY PAGE =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* EMERGENCY HEADER */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🚑 Emergency Alert</h1>
              <p className="text-red-100">Accident assistance required</p>
            </div>
            <div className="text-6xl animate-pulse">🚨</div>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-2xl p-8 space-y-6">
          
          {/* AUTO-ALERT NOTIFICATION */}
          {sendingAlert && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 animate-pulse">
              <p className="text-yellow-800 font-semibold text-center">
                ⚡ Automatically sending alerts to emergency contacts...
              </p>
            </div>
          )}

          {/* LOCATION DISPLAY */}
{/* ENABLE LOCATION BUTTON */}
{!location && (
  <button
    onClick={getLocation}
    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg"
  >
    Enable Location
  </button>
)}

          {/* OWNER INFORMATION */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-900">👤 Vehicle Owner Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="font-bold text-gray-900 text-lg">{vehicle.ownerName}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600 font-medium">Phone:</span>
                <a 
                  href={`tel:${vehicle.ownerPhone}`}
                  className="font-bold text-blue-600 hover:text-blue-800 text-lg"
                >
                  {vehicle.ownerPhone}
                </a>
              </div>
              {vehicle.ownerEmail && (
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <a 
                    href={`mailto:${vehicle.ownerEmail}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {vehicle.ownerEmail}
                  </a>
                </div>
              )}
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-600 font-medium">Vehicle Number:</span>
                <span className="font-bold text-gray-900">{vehicle.vehicleNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Vehicle Type:</span>
                <span className="font-bold text-gray-900">{vehicle.vehicleType}</span>
              </div>
            </div>
          </div>

          {/* MEDICAL INFORMATION */}
          {(vehicle.bloodGroup || vehicle.allergies || vehicle.medicalNotes) && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-red-700 flex items-center gap-2">
                ⚕️ Medical Information
              </h3>
              <div className="space-y-3">
                {vehicle.bloodGroup && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Blood Group:</span>
                    <span className="font-bold text-red-700 text-2xl">{vehicle.bloodGroup}</span>
                  </div>
                )}
                {vehicle.allergies && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Allergies:</span>
                    <span className="font-semibold text-gray-900">{vehicle.allergies}</span>
                  </div>
                )}
                {vehicle.medicalNotes && (
                  <div>
                    <span className="text-gray-700 font-medium block mb-2">Medical Notes:</span>
                    <p className="bg-white p-3 rounded border border-red-200 text-gray-900">
                      {vehicle.medicalNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EMERGENCY CONTACTS */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
              📞 Emergency Contacts
            </h3>
            <div className="space-y-4">
              {vehicle.emergencyContacts.map((contact, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.relation}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                      Contact {index + 1}
                    </span>
                  </div>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-lg transition-colors"
                  >
                    <FiPhone className="flex-shrink-0" />
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* ALERT STATUS OR BUTTON */}
          {alertSent ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">
                Alerts Sent Successfully!
              </h3>
              <p className="text-gray-700 mb-4">
                Emergency contacts have been notified via WhatsApp with location details.
              </p>
              <button
                onClick={() => {
                  setAlertSent(false);
                  handleSendAlert();
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Send Again
              </button>
            </div>
          ) : (
            <button
              onClick={handleSendAlert}
              disabled={sendingAlert}
              className="w-full bg-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              {sendingAlert ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Alerts...
                </>
              ) : (
                <>
                  <FiAlertCircle className="inline mr-2" />
                  🚨 SEND EMERGENCY ALERTS NOW
                </>
              )}
            </button>
          )}

          {/* EMERGENCY CALL BUTTONS */}
          <div className="grid grid-cols-2 gap-4">
            
       
            <a
  href="tel:112"
  className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
>
  <FiPhone />
  Call 112
</a>
            <a
  href="tel:108"
  className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
>
  🚑 Ambulance
</a>
          </div>

          {/* INSTRUCTIONS */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h4 className="font-bold text-gray-900 mb-2">📋 Emergency Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Ensure the area is safe before approaching</li>
              <li>Call emergency services (112) if not already called</li>
              <li>Provide first aid only if trained</li>
              <li>Wait for emergency contacts or services to arrive</li>
              <li>Do not move injured persons unless in immediate danger</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}