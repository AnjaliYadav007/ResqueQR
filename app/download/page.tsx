'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getVehicleById } from '@/lib/firebase/operations';
import { VehicleOwner } from '@/types/vehicle';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import {
  FiArrowLeft, FiPlus, FiAlertCircle,
  FiShield, FiZap, FiRefreshCw
} from 'react-icons/fi';

// ─── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const s = size === 'lg' ? 'w-12 h-12' : 'w-6 h-6';
  return (
    <svg className={`${s} animate-spin text-blue-500`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setDot(d => (d + 1) % 4), 500);
    return () => clearInterval(i);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#030712] flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-700/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-700/8 blur-[100px]" />
      </div>

      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-6">
          {/* Layered rings */}
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-2 rounded-full border border-blue-500/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s' }} />
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Spinner size="sm" />
            </div>
          </div>
        </div>
        <h2 className="text-white font-bold text-xl mb-2">Loading your QR Code</h2>
        <p className="text-gray-500 text-sm">
          {'Fetching vehicle data' + '.'.repeat(dot + 1)}
        </p>
        <div className="flex items-center justify-center gap-6 mt-8 text-gray-600 text-xs">
          <span className="flex items-center gap-1.5"><FiShield className="text-green-500 w-3.5 h-3.5" /> Encrypted</span>
          <span className="flex items-center gap-1.5"><FiZap className="text-blue-500 w-3.5 h-3.5" /> Fast</span>
        </div>
      </div>
    </div>
  );
}

// ─── Error Screen ──────────────────────────────────────────────────────────────
function ErrorScreen({ message, onRetry, onRegister }: { message: string; onRetry?: () => void; onRegister: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div
      className="min-h-screen bg-[#030712] flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-[20%] w-[50vw] h-[50vw] rounded-full bg-red-700/8 blur-[120px]" />
      </div>

      <div
        className="relative z-10 max-w-md w-full transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)' }}
      >
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-center backdrop-blur-sm shadow-2xl shadow-black/40">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
            <FiAlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">{message}</p>

          <div className="space-y-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="group w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Try Again
              </button>
            )}
            <button
              onClick={onRegister}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3.5 rounded-xl transition-all duration-200"
            >
              <FiPlus className="w-4 h-4" />
              Register a Vehicle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Download Content ──────────────────────────────────────────────────────────
function DownloadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vehicleId = searchParams.get('id');

  const [vehicle, setVehicle] = useState<VehicleOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVehicleData = async () => {
    if (!vehicleId) { setError('No vehicle ID provided.'); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const data = await getVehicleById(vehicleId);
      if (!data) { setError('Vehicle not found. The ID may be invalid or has been removed.'); return; }
      setVehicle(data);
    } catch {
      setError('Failed to load vehicle data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicleData(); }, [vehicleId]);

  if (loading) return <LoadingScreen />;
  if (error || !vehicle) return (
    <ErrorScreen
      message={error || 'Vehicle data could not be loaded.'}
      onRetry={vehicleId ? fetchVehicleData : undefined}
      onRegister={() => router.push('/register')}
    />
  );

  return (
    <div
      className="min-h-screen bg-[#030712]"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[55vw] h-[55vw] rounded-full bg-blue-700/8 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-indigo-700/8 blur-[100px]" />
      </div>

      {/* Top nav bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 group"
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>
        <button
          onClick={() => router.push('/register')}
          className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200"
        >
          <FiPlus className="w-3.5 h-3.5" />
          Register Another Vehicle
        </button>
      </nav>

      {/* QR Display — rendered directly, it manages its own layout */}
      <QRCodeDisplay
        vehicleId={vehicle.vehicleId}
        ownerName={vehicle.ownerName}
        vehicleNumber={vehicle.vehicleNumber}
      />
    </div>
  );
}

// ─── Page with Suspense ────────────────────────────────────────────────────────
export default function DownloadPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DownloadContent />
    </Suspense>
  );
}