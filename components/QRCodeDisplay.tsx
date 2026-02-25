'use client';

import { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  FiDownload, FiPrinter, FiExternalLink, FiCheck,
  FiShield, FiAlertTriangle, FiCopy, FiMapPin,
  FiInfo, FiCheckCircle
} from 'react-icons/fi';

interface QRCodeDisplayProps {
  vehicleId: string;
  ownerName: string;
  vehicleNumber: string;
}

// ─── Pulse Ring ────────────────────────────────────────────────────────────────
function PulseRing() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
    </span>
  );
}

// ─── Step Item ─────────────────────────────────────────────────────────────────
function NextStep({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {number}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

// ─── Action Button ─────────────────────────────────────────────────────────────
function ActionBtn({
  onClick, icon: Icon, label, sublabel, primary = false, href
}: {
  onClick?: () => void;
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  primary?: boolean;
  href?: string;
}) {
  const cls = `group flex items-center gap-4 w-full px-5 py-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
    primary
      ? 'bg-blue-500 hover:bg-blue-400 border-blue-400/50 shadow-xl shadow-blue-500/25 hover:shadow-blue-400/30'
      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
  }`;

  const inner = (
    <>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${primary ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
        <Icon className={`w-5 h-5 ${primary ? 'text-white' : 'text-gray-300'}`} />
      </div>
      <div className="text-left">
        <p className={`font-bold text-sm ${primary ? 'text-white' : 'text-white'}`}>{label}</p>
        {sublabel && <p className={`text-xs mt-0.5 ${primary ? 'text-blue-100' : 'text-gray-500'}`}>{sublabel}</p>}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
        <FiExternalLink className="ml-auto text-gray-400 w-4 h-4" />
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function QRCodeDisplay({ vehicleId, ownerName, vehicleNumber }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const alertUrl = `${process.env.NEXT_PUBLIC_APP_URL}/alert/${vehicleId}`;
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setQrReady(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `resqueqr-${vehicleNumber}.png`;
    link.href = url;
    link.click();
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(alertUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen bg-[#030712] text-white px-4 py-12"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-green-700/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-blue-700/10 blur-[100px]" />
      </div>

      <div
        className="relative z-10 max-w-lg mx-auto space-y-5 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)' }}
      >

        {/* ── SUCCESS BANNER ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600/20 to-emerald-700/10 border border-green-500/30 rounded-2xl p-6 text-center">
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
              <FiCheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <PulseRing />
              <span className="text-green-400 text-xs font-bold uppercase tracking-widest">QR Active</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">QR Code Ready!</h1>
            <p className="text-gray-400 text-sm">Your vehicle is now protected by ResqueQR</p>
          </div>
        </div>

        {/* ── QR CODE CARD ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
          {/* Owner info row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Owner</p>
              <p className="text-white font-bold text-lg">{ownerName}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Vehicle</p>
              <p className="text-white font-black text-lg font-mono tracking-wider">{vehicleNumber}</p>
            </div>
          </div>

          {/* QR code */}
          <div className="flex justify-center mb-6">
            <div
              className={`relative transition-all duration-700 ${qrReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-3xl bg-blue-500/15 blur-2xl scale-110" />
              {/* Card */}
              <div ref={qrRef} className="relative bg-white rounded-3xl p-6 shadow-2xl">
                <QRCodeCanvas
                  value={alertUrl}
                  size={220}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: '/images/logo.png',
                    height: 36,
                    width: 36,
                    excavate: true,
                  }}
                />
                {/* Bottom label */}
                <div className="mt-3 text-center">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">ResqueQR · Emergency</p>
                  <p className="text-gray-700 text-xs font-mono font-black tracking-wider mt-0.5">{vehicleNumber}</p>
                </div>
              </div>
              {/* Active badge */}
              <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-500/40 flex items-center gap-1.5">
                <PulseRing />
                <span>LIVE</span>
              </div>
            </div>
          </div>

          {/* Vehicle ID */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-0.5">Vehicle ID</p>
              <p className="text-white font-mono text-sm truncate">{vehicleId}</p>
            </div>
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 flex-shrink-0"
            >
              {copied ? (
                <><FiCheck className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
              ) : (
                <><FiCopy className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-400">Copy URL</span></>
              )}
            </button>
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 space-y-3">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold px-1 mb-4">Actions</p>
          <ActionBtn
            onClick={downloadQR}
            icon={FiDownload}
            label="Download QR Code"
            sublabel="Save as PNG — print or share"
            primary
          />
          <ActionBtn
            onClick={() => window.print()}
            icon={FiPrinter}
            label="Print QR Code"
            sublabel="Optimized print layout"
          />
          <ActionBtn
            href={alertUrl}
            icon={FiExternalLink}
            label="Test Emergency Page"
            sublabel="Preview what responders see"
          />
        </div>

        {/* ── NEXT STEPS ── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FiMapPin className="text-blue-400 w-4 h-4" />
            </div>
            <h3 className="text-white font-bold">Next Steps</h3>
          </div>
          <div className="space-y-4">
            <NextStep number={1} text="Download and print on a waterproof sticker (recommended: 3×3 inches or larger)." />
            <NextStep number={2} text="Place it on your rear windshield or bumper where it's clearly visible." />
            <NextStep number={3} text="Test the QR code using your phone to confirm the emergency page loads correctly." />
            <NextStep number={4} text="Keep your emergency contacts up to date — update them anytime in your dashboard." />
          </div>
        </div>

        {/* ── SECURITY NOTE ── */}
        <div className="flex items-start gap-3 bg-yellow-500/8 border border-yellow-500/20 rounded-2xl px-5 py-4">
          <FiAlertTriangle className="text-yellow-400 w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-semibold text-sm mb-0.5">Keep your Vehicle ID private</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Only your QR code should be displayed on your vehicle. Never share your Vehicle ID publicly — it grants access to update your emergency profile.
            </p>
          </div>
        </div>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-6 pb-4 text-gray-600 text-xs">
          <span className="flex items-center gap-1.5"><FiShield className="text-green-500 w-3.5 h-3.5" /> Encrypted</span>
          <span className="flex items-center gap-1.5"><FiInfo className="text-blue-500 w-3.5 h-3.5" /> Private by default</span>
          <span className="flex items-center gap-1.5"><FiCheck className="text-indigo-400 w-3.5 h-3.5" /> Always available</span>
        </div>

      </div>
    </div>
  );
}