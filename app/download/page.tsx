// app/download/page.tsx

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getVehicleById } from '@/lib/firebase/operations';
import { VehicleOwner } from '@/types/vehicle';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import Button from '@/components/ui/Button';

function DownloadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vehicleId = searchParams.get('id');

  const [vehicle, setVehicle] = useState<VehicleOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!vehicleId) {
      setError('No vehicle ID provided');
      setLoading(false);
      return;
    }

    fetchVehicleData();
  }, [vehicleId]);

  const fetchVehicleData = async () => {
    try {
      const data = await getVehicleById(vehicleId!);
      
      if (!data) {
        setError('Vehicle not found');
        return;
      }

      setVehicle(data);
    } catch (err) {
      setError('Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QR Code...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/register')} fullWidth>
            Register New Vehicle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🚑 Emergency QR Code
            </h1>
            <p className="text-gray-600">
              Your vehicle emergency alert system is ready
            </p>
          </div>

          <QRCodeDisplay
            vehicleId={vehicle.vehicleId}
            ownerName={vehicle.ownerName}
            vehicleNumber={vehicle.vehicleNumber}
          />

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <Button
                variant="secondary"
                onClick={() => router.push('/')}
              >
                ← Back to Home
              </Button>
              <Button
                onClick={() => router.push('/register')}
              >
                Register Another Vehicle
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}