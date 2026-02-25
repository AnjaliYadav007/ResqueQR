'use client';

import { useEffect, useState } from 'react';
import { VehicleOwner } from '@/types/vehicle';
import {
  FiPhone, FiMail, FiUser, FiHeart, FiTruck,
  FiAlertTriangle, FiMapPin, FiClock, FiChevronRight
} from 'react-icons/fi';

interface EmergencyInfoProps {
  vehicle: VehicleOwner;
}

// ─── Pulse Ring ────────────────────────────────────────────────────────────────
function PulseRing({ color = 'red' }: { color?: 'red' | 'blue' | 'green' }) {
  const colors = {
    red: 'bg-red-400',
    blue: 'bg-blue-400',
    green: 'bg-green-400',
  };
  const rings = {
    red: 'bg-red-400',
    blue: 'bg-blue-400',
    green: 'bg-green-400',
  };
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${rings[color]} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${colors[color]}`} />
    </span>
  );
}

// ─── Call Button ───────────────────────────────────────────────────────────────
function CallButton({ phone, label }: { phone: string; label?: string }) {
  return (
    <a
      href={`tel:${phone}`}
      className="group flex items-center justify-between w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <FiPhone className="w-4 h-4" />
        </div>
        <span>{label || phone}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-blue-200 text-sm font-normal">{phone}</span>
        <FiChevronRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </a>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, href, valueClass = '' }: { label: string; value: string; href?: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      {href ? (
        <a href={href} className={`font-semibold text-sm hover:underline underline-offset-2 ${valueClass || 'text-blue-400'}`}>
          {value}
        </a>
      ) : (
        <span className={`font-semibold text-sm text-white ${valueClass}`}>{value}</span>
      )}
    </div>
  );
}

// ─── Timer ────────────────────────────────────────────────────────────────────
function ElapsedTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <span className="font-mono text-yellow-300 text-sm font-bold tabular-nums">
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function EmergencyInfo({ vehicle }: EmergencyInfoProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const hasMedical = vehicle.bloodGroup || vehicle.allergies || vehicle.medicalNotes;

  return (
    <div
      className="min-h-screen bg-[#030712] text-white px-4 py-6"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-red-700/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-700/10 blur-[100px]" />
      </div>

      <div
        className="relative z-10 max-w-lg mx-auto space-y-4 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)' }}
      >

        {/* ── CRITICAL ALERT BANNER ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-center shadow-2xl shadow-red-900/50">
          {/* Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 12px)',
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-3">
              <PulseRing color="red" />
              <span className="text-red-200 text-xs font-bold uppercase tracking-[0.2em]">Active Emergency</span>
              <PulseRing color="red" />
            </div>
            <div className="flex items-center justify-center gap-3 mb-2">
              <FiAlertTriangle className="w-7 h-7 text-white" />
              <h1 className="text-2xl font-black tracking-tight">EMERGENCY ALERT</h1>
              <FiAlertTriangle className="w-7 h-7 text-white" />
            </div>
            <p className="text-red-100 text-sm mb-4">Emergency contacts are being notified now</p>
            <div className="inline-flex items-center gap-2 bg-black/20 rounded-full px-4 py-2 text-sm">
              <FiClock className="text-yellow-300 w-4 h-4" />
              <span className="text-gray-300">Alert active for</span>
              <ElapsedTimer />
            </div>
          </div>
        </div>

        {/* ── LOCATION BANNER ── */}
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          <div className="flex-shrink-0">
            <PulseRing color="green" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-green-400 text-xs font-semibold uppercase tracking-wide">Live Location Active</p>
            <p className="text-gray-300 text-sm truncate">Sharing coordinates with emergency contacts</p>
          </div>
          <FiMapPin className="text-green-400 w-5 h-5 flex-shrink-0" />
        </div>

        {/* ── OWNER INFORMATION ── */}
        <SectionCard>
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FiUser className="text-blue-400 w-5 h-5" />
            </div>
            <h2 className="font-bold text-white">Vehicle Owner</h2>
          </div>
          <div className="px-5 py-4">
            {/* Owner name prominent */}
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Owner</p>
              <p className="text-2xl font-black text-white">{vehicle.ownerName}</p>
            </div>
            <InfoRow label="Phone" value={vehicle.ownerPhone} href={`tel:${vehicle.ownerPhone}`} />
            {vehicle.ownerEmail && (
              <InfoRow label="Email" value={vehicle.ownerEmail} href={`mailto:${vehicle.ownerEmail}`} />
            )}
          </div>
        </SectionCard>

        {/* ── VEHICLE INFORMATION ── */}
        <SectionCard>
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <FiTruck className="text-indigo-400 w-5 h-5" />
            </div>
            <h2 className="font-bold text-white">Vehicle Details</h2>
          </div>
          <div className="px-5 py-4">
            {/* Vehicle number badge */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 mb-4 text-center">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Plate Number</p>
              <p className="text-2xl font-black tracking-widest font-mono text-white">{vehicle.vehicleNumber}</p>
            </div>
            <InfoRow label="Type" value={vehicle.vehicleType} />
            {vehicle.vehicleModel && <InfoRow label="Model" value={vehicle.vehicleModel} />}
            {vehicle.vehicleColor && <InfoRow label="Color" value={vehicle.vehicleColor} />}
          </div>
        </SectionCard>

        {/* ── MEDICAL INFORMATION ── */}
        {hasMedical && (
          <div className="relative overflow-hidden bg-gradient-to-br from-red-950/80 to-red-900/40 border border-red-500/30 rounded-2xl">
            <div className="px-5 py-4 border-b border-red-500/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                <FiHeart className="text-red-400 w-5 h-5" />
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
                    <FiHeart className="text-red-400 w-4 h-4 mb-0.5" />
                    <span className="text-red-300 font-black text-xl leading-none">{vehicle.bloodGroup}</span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Blood Group</p>
                    <p className="text-white font-bold text-lg">Type {vehicle.bloodGroup}</p>
                    <p className="text-red-300 text-xs">Share this with paramedics immediately</p>
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
        <SectionCard>
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FiPhone className="text-blue-400 w-5 h-5" />
            </div>
            <h2 className="font-bold text-white">Emergency Contacts</h2>
            <div className="ml-auto flex items-center gap-1.5">
              <PulseRing color="blue" />
              <span className="text-blue-400 text-xs font-medium">Notifying…</span>
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            {vehicle.emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
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
                  <span className="bg-white/5 border border-white/10 text-gray-400 text-xs px-2.5 py-1 rounded-full">
                    #{index + 1}
                  </span>
                </div>
                <CallButton phone={contact.phone} label={`Call ${contact.name}`} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── FOOTER NOTE ── */}
        <div className="text-center pb-8">
          <div className="inline-flex items-center gap-2 text-gray-500 text-xs">
            <span>Powered by</span>
            <span className="text-white font-bold">ResqueQR</span>
            <span>·</span>
            <span>Emergency Response System</span>
          </div>
        </div>

      </div>
    </div>
  );
}