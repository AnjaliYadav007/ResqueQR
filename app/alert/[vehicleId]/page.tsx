'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getVehicleById } from '@/lib/firebase/operations';
import { getCurrentLocation, getGoogleMapsUrl } from '@/lib/utils/geolocation';
import { sendMultipleWhatsAppAlerts, createEmergencyMessage } from '@/lib/utils/alerts';
import { VehicleOwner } from '@/types/vehicle';
import {
  FiMapPin, FiPhone, FiAlertCircle, FiAlertTriangle,
  FiUser, FiHeart, FiCheckCircle, FiRefreshCw,
  FiShield, FiClock, FiNavigation
} from 'react-icons/fi';

// ─── Elapsed Timer ─────────────────────────────────────────────────────────────
function ElapsedTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <span className="font-mono font-bold text-yellow-300 tabular-nums">
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

// ─── Pulse Ring ────────────────────────────────────────────────────────────────
function PulseRing({ color = 'red' }: { color?: 'red' | 'green' | 'blue' | 'yellow' }) {
  const map = { red: 'bg-red-400', green: 'bg-green-400', blue: 'bg-blue-400', yellow: 'bg-yellow-400' };
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${map[color]} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${map[color]}`} />
    </span>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ cls = 'w-5 h-5' }: { cls?: string }) {
  return (
    <svg className={`${cls} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setDot(d => (d + 1) % 4), 450);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-[10%] w-[60vw] h-[60vw] rounded-full bg-red-700/10 blur-[120px]" />
      </div>
      <div className="relative z-10 text-center">
        <div className="relative flex items-center justify-center w-28 h-28 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-3 rounded-full border border-red-500/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <FiAlertCircle className="w-9 h-9 text-red-400" />
          </div>
        </div>
        <h2 className="text-white font-bold text-xl mb-2">Loading Emergency Information</h2>
        <p className="text-gray-500 text-sm">{'Retrieving vehicle data' + '.'.repeat(dot + 1)}</p>
      </div>
    </div>
  );
}

// ─── Error Screen ──────────────────────────────────────────────────────────────
function ErrorScreen({ message }: { message: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[50vw] h-[50vw] rounded-full bg-red-800/10 blur-[100px]" />
      </div>
      <div className="relative z-10 max-w-md w-full transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)' }}>
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
            <FiAlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Vehicle Not Found</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">{message}</p>
          <a href="tel:112"
            className="flex items-center justify-center gap-3 w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-600/25 transition-all duration-200 hover:-translate-y-0.5 mb-3">
            <FiPhone className="w-5 h-5" />
            Call Emergency Services — 112
          </a>
          <a href="tel:108"
            className="flex items-center justify-center gap-3 w-full bg-white/5 border border-white/10 text-white font-semibold py-4 rounded-2xl transition-all duration-200">
            <FiPhone className="w-5 h-5 text-red-400" />
            Ambulance — 108
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      {href ? (
        <a href={href} className="font-semibold text-sm text-blue-400 hover:underline underline-offset-2">{value}</a>
      ) : (
        <span className="font-semibold text-sm text-white">{value}</span>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function EmergencyAlertPage() {
  const params = useParams();
  const vehicleId = params.vehicleId as string;

  const [vehicle, setVehicle] = useState<VehicleOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { fetchVehicleData(); getLocation(); }, [vehicleId]);

  useEffect(() => {
    if (vehicle && !alertSent && !sendingAlert) {
      const t = setTimeout(() => handleSendAlert(), 2000);
      return () => clearTimeout(t);
    }
  }, [vehicle]);

  useEffect(() => {
    if (!loading) setTimeout(() => setVisible(true), 100);
  }, [loading]);

  const fetchVehicleData = async () => {
    try {
      const data = await getVehicleById(vehicleId);
      if (!data) { setError('Vehicle not found. This QR code may be invalid or expired.'); return; }
      setVehicle(data);
    } catch {
      setError('Failed to load vehicle information. Please call emergency services directly.');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const loc = await getCurrentLocation();
      if (loc) setLocation({ lat: loc.latitude, lng: loc.longitude });
    } catch { /* silent */ } finally {
      setLocationLoading(false);
    }
  };

  const handleSendAlert = async () => {
    if (!vehicle) return;
    setSendingAlert(true);
    try {
      const locationUrl = location ? getGoogleMapsUrl(location.lat, location.lng) : undefined;
      const message = createEmergencyMessage(vehicle.ownerName, vehicle.vehicleNumber, locationUrl, vehicle.bloodGroup);
      sendMultipleWhatsAppAlerts(vehicle.emergencyContacts, message);
      setAlertSent(true);
    } catch { /* noop */ } finally {
      setSendingAlert(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error || !vehicle) return <ErrorScreen message={error || 'Vehicle information not found.'} />;

  const mapsUrl = location ? getGoogleMapsUrl(location.lat, location.lng) : null;
  const hasMedical = vehicle.bloodGroup || vehicle.allergies || vehicle.medicalNotes;

  return (
    <div className="min-h-screen bg-[#030712] text-white px-4 py-6"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[65vw] h-[65vw] rounded-full bg-red-800/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-blue-800/8 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto space-y-4 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)' }}>

        {/* ── CRITICAL ALERT BANNER ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-5 shadow-2xl shadow-red-900/50">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 12px)' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <PulseRing color="red" />
                <span className="text-red-100 text-xs font-bold uppercase tracking-widest">Emergency Active</span>
              </div>
              <h1 className="text-2xl font-black text-white">Accident Assistance</h1>
              <p className="text-red-200 text-sm mt-0.5">Emergency contacts are being notified</p>
            </div>
            <div className="bg-black/20 rounded-xl px-3 py-2 text-center flex-shrink-0 ml-4">
              <div className="flex items-center gap-1.5 text-gray-300 text-xs mb-0.5">
                <FiClock className="w-3 h-3" />
                <span>Active for</span>
              </div>
              <ElapsedTimer />
            </div>
          </div>
        </div>

        {/* ── SENDING STATUS ── */}
        {sendingAlert && (
          <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
            <Spinner cls="w-4 h-4 text-yellow-400" />
            <div>
              <p className="text-yellow-300 text-sm font-semibold">Sending emergency alerts</p>
              <p className="text-gray-400 text-xs">Notifying all emergency contacts via WhatsApp...</p>
            </div>
          </div>
        )}

        {/* ── LOCATION CARD ── */}
        <div className={`rounded-xl px-4 py-3 border flex items-center justify-between gap-3 ${
          location ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${location ? 'bg-green-500/20' : 'bg-white/10'}`}>
              {locationLoading
                ? <Spinner cls="w-4 h-4 text-gray-400" />
                : <FiMapPin className={`w-4 h-4 ${location ? 'text-green-400' : 'text-gray-400'}`} />}
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${location ? 'text-green-400' : 'text-gray-400'}`}>
                {locationLoading ? 'Detecting location...' : location ? 'Live Location Active' : 'Location unavailable'}
              </p>
              <p className="text-gray-400 text-xs">
                {location
                  ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                  : 'Enable location for faster emergency response'}
              </p>
            </div>
          </div>
          {location && mapsUrl ? (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 hover:bg-green-500/30 transition-colors">
              <FiNavigation className="w-3 h-3" />
              Map
            </a>
          ) : !locationLoading && !location ? (
            <button onClick={getLocation}
              className="text-blue-400 border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 transition-colors">
              Enable
            </button>
          ) : null}
        </div>

        {/* ── VEHICLE OWNER ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FiUser className="text-blue-400 w-4 h-4" />
            </div>
            <h2 className="font-bold text-white">Vehicle Owner</h2>
          </div>
          <div className="px-5 py-2">
            <InfoRow label="Name" value={vehicle.ownerName} />
            <InfoRow label="Phone" value={vehicle.ownerPhone} href={`tel:${vehicle.ownerPhone}`} />
            {vehicle.ownerEmail && <InfoRow label="Email" value={vehicle.ownerEmail} href={`mailto:${vehicle.ownerEmail}`} />}
            <InfoRow label="Vehicle Number" value={vehicle.vehicleNumber} />
            <InfoRow label="Type" value={vehicle.vehicleType} />
            {vehicle.vehicleModel && <InfoRow label="Model" value={vehicle.vehicleModel} />}
            {vehicle.vehicleColor && <InfoRow label="Color" value={vehicle.vehicleColor} />}
          </div>
        </div>

        {/* ── MEDICAL INFORMATION ── */}
        {hasMedical && (
          <div className="relative overflow-hidden bg-red-950/40 border border-red-500/30 rounded-2xl">
            <div className="px-5 py-4 border-b border-red-500/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                <FiHeart className="text-red-400 w-4 h-4" />
              </div>
              <h2 className="font-bold text-white">Medical Information</h2>
              <span className="ml-auto bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                Critical
              </span>
            </div>
            <div className="px-5 py-4 space-y-4">
              {vehicle.bloodGroup && (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex flex-col items-center justify-center flex-shrink-0">
                    <FiHeart className="text-red-400 w-3.5 h-3.5 mb-0.5" />
                    <span className="text-red-300 font-black text-xl leading-none">{vehicle.bloodGroup}</span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Blood Group</p>
                    <p className="text-white font-bold text-lg">Type {vehicle.bloodGroup}</p>
                    <p className="text-red-300 text-xs">Share immediately with paramedics</p>
                  </div>
                </div>
              )}
              {vehicle.allergies && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
                  <p className="text-yellow-400 text-xs font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <FiAlertTriangle className="w-3.5 h-3.5" />
                    Known Allergies
                  </p>
                  <p className="text-white text-sm font-semibold">{vehicle.allergies}</p>
                </div>
              )}
              {vehicle.medicalNotes && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Medical Notes</p>
                  <p className="text-gray-200 text-sm leading-relaxed bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                    {vehicle.medicalNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EMERGENCY CONTACTS ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FiPhone className="text-blue-400 w-4 h-4" />
            </div>
            <h2 className="font-bold text-white">Emergency Contacts</h2>
            {alertSent && (
              <div className="ml-auto flex items-center gap-1.5">
                <PulseRing color="green" />
                <span className="text-green-400 text-xs font-medium">Notified</span>
              </div>
            )}
          </div>
          <div className="px-5 py-4 space-y-3">
            {vehicle.emergencyContacts.map((contact, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {contact.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{contact.name}</p>
                      <p className="text-gray-400 text-xs">{contact.relation}</p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs border border-white/10 px-2 py-1 rounded-full">#{i + 1}</span>
                </div>
                <a href={`tel:${contact.phone}`}
                  className="group flex items-center justify-between w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-4 h-4" />
                    <span className="text-sm">Call {contact.name}</span>
                  </div>
                  <span className="text-blue-200 text-xs font-normal">{contact.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ── ALERT CTA ── */}
        {alertSent ? (
          <div className="relative overflow-hidden bg-green-950/40 border border-green-500/30 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
              <FiCheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">Alerts Sent</h3>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              All emergency contacts have been notified via WhatsApp with the current location.
            </p>
            <button onClick={() => { setAlertSent(false); handleSendAlert(); }}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-200">
              <FiRefreshCw className="w-4 h-4" />
              Resend Alerts
            </button>
          </div>
        ) : (
          <button onClick={handleSendAlert} disabled={sendingAlert}
            className="group w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-lg py-5 rounded-2xl shadow-2xl shadow-red-600/30 hover:shadow-red-500/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
            {sendingAlert
              ? <><Spinner cls="w-5 h-5" /> Sending Alerts...</>
              : <><FiAlertCircle className="w-6 h-6" /> Send Emergency Alerts Now</>}
          </button>
        )}

        {/* ── EMERGENCY CALL BUTTONS ── */}
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:112"
            className="flex items-center justify-center gap-2 bg-red-600/90 hover:bg-red-500 border border-red-500/30 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-600/20 transition-all duration-200 hover:-translate-y-0.5">
            <FiPhone className="w-5 h-5" />
            <div className="text-left">
              <p className="text-xs text-red-200 leading-none mb-0.5">Emergency</p>
              <p className="text-base font-black leading-none">Call 112</p>
            </div>
          </a>
          <a href="tel:108"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5">
            <FiPhone className="w-5 h-5 text-red-400" />
            <div className="text-left">
              <p className="text-xs text-gray-400 leading-none mb-0.5">Ambulance</p>
              <p className="text-base font-black leading-none">Call 108</p>
            </div>
          </a>
        </div>

        {/* ── INSTRUCTIONS ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <FiShield className="text-yellow-400 w-4 h-4" />
            </div>
            <h3 className="text-white font-bold">Emergency Instructions</h3>
          </div>
          <div className="space-y-3">
            {[
              'Ensure the area is safe before approaching the vehicle.',
              'Call emergency services (112) if not already done.',
              'Provide first aid only if you are trained to do so.',
              'Do not move injured persons unless in immediate danger.',
              'Stay on scene until emergency services or contacts arrive.',
            ].map((inst, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{inst}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-gray-600 text-xs">
            Powered by <span className="text-white font-bold">ResqueQR</span> · Emergency Response System
          </p>
        </div>

      </div>
    </div>
  );
}