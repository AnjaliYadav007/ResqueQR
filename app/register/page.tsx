'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createVehicle } from '@/lib/firebase/operations';
import { generateVehicleId } from '@/lib/utils/generateId';
import { VehicleOwner, EmergencyContact } from '@/types/vehicle';
import Input from '@/components/ui/Input';
import {
  FiUser, FiTruck, FiPhone, FiHeart,
  FiArrowRight, FiArrowLeft, FiPlus, FiTrash2,
  FiShield, FiCheck, FiAlertCircle, FiChevronDown
} from 'react-icons/fi';

// ─── Step types ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Owner', icon: FiUser },
  { id: 2, label: 'Vehicle', icon: FiTruck },
  { id: 3, label: 'Contacts', icon: FiPhone },
  { id: 4, label: 'Medical', icon: FiHeart },
];

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
      {label} {required && <span className="text-red-400 normal-case tracking-normal">*</span>}
    </label>
  );
}

function StyledInput({
  label, required, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; required?: boolean }) {
  return (
    <div>
      {label && <FieldLabel label={label} required={required} />}
      <input
        {...props}
        required={required}
        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 focus:ring-1 focus:ring-blue-500/30 transition-all duration-200"
      />
    </div>
  );
}

function StyledSelect({
  label, required, children, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; required?: boolean }) {
  return (
    <div>
      {label && <FieldLabel label={label} required={required} />}
      <div className="relative">
        <select
          {...props}
          required={required}
          className="w-full appearance-none bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all duration-200"
        >
          {children}
        </select>
        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                  ${done ? 'bg-blue-500 border-blue-500 text-white' :
                    active ? 'bg-transparent border-blue-500 text-blue-400' :
                      'bg-transparent border-white/10 text-gray-500'}`}
              >
                {done ? <FiCheck className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-xs mt-1.5 font-medium transition-colors duration-300 ${active ? 'text-blue-400' : done ? 'text-gray-400' : 'text-gray-600'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 md:w-20 h-px mx-1 mb-5 transition-all duration-500 ${done ? 'bg-blue-500' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────
function FormCard({ children, title, subtitle, icon: Icon, color = 'blue' }:
  { children: React.ReactNode; title: string; subtitle?: string; icon: React.ElementType; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    vehicleNumber: '',
    vehicleType: 'Car',
    vehicleModel: '',
    vehicleColor: '',
    bloodGroup: '',
    allergies: '',
    medicalNotes: '',
  });

  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: '', phone: '', relation: '' },
  ]);

  const set = (key: string, val: string) => setFormData(p => ({ ...p, [key]: val }));

  const handleAddContact = () => {
    if (contacts.length < 3) setContacts([...contacts, { name: '', phone: '', relation: '' }]);
  };

  const handleContactChange = (i: number, field: keyof EmergencyContact, val: string) => {
    const updated = [...contacts];
    updated[i][field] = val;
    setContacts(updated);
  };

  const handleRemoveContact = (i: number) => setContacts(contacts.filter((_, idx) => idx !== i));

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.ownerName || !formData.ownerPhone) {
        setError('Please fill in your name and phone number.'); return false;
      }
    }
    if (step === 2) {
      if (!formData.vehicleNumber) {
        setError('Vehicle number is required.'); return false;
      }
    }
    if (step === 3) {
      const valid = contacts.filter(c => c.name && c.phone);
      if (valid.length === 0) {
        setError('Add at least one emergency contact.'); return false;
      }
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, 4)); };
  const prevStep = () => { setError(''); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const vehicleId = generateVehicleId();
      const vehicleData: VehicleOwner = {
        vehicleId,
        ...formData,
        emergencyContacts: contacts.filter(c => c.name && c.phone),
      };
      await createVehicle(vehicleData);
      router.push(`/download?id=${vehicleId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to register vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#030712] text-white px-4 py-12"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-700/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-700/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <FiShield className="w-3.5 h-3.5" />
            Secure Registration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Register Your<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Vehicle
            </span>
          </h1>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Takes less than 2 minutes. Your data is encrypted and private.
          </p>
        </div>

        {/* Step bar */}
        <StepBar current={step} />

        {/* Form card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl shadow-black/40">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ── STEP 1: Owner ── */}
            {step === 1 && (
              <FormCard title="Owner Information" subtitle="Your personal and contact details" icon={FiUser} color="blue">
                <div className="grid md:grid-cols-2 gap-5">
                  <StyledInput
                    label="Full Name"
                    required
                    type="text"
                    value={formData.ownerName}
                    onChange={e => set('ownerName', e.target.value)}
                    placeholder="John Doe"
                  />
                  <StyledInput
                    label="Phone Number"
                    required
                    type="tel"
                    value={formData.ownerPhone}
                    onChange={e => set('ownerPhone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                  <div className="md:col-span-2">
                    <StyledInput
                      label="Email Address (Optional)"
                      type="email"
                      value={formData.ownerEmail}
                      onChange={e => set('ownerEmail', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </FormCard>
            )}

            {/* ── STEP 2: Vehicle ── */}
            {step === 2 && (
              <FormCard title="Vehicle Details" subtitle="Information to identify your vehicle" icon={FiTruck} color="indigo">
                <div className="grid md:grid-cols-2 gap-5">
                  <StyledInput
                    label="Vehicle Number"
                    required
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={e => set('vehicleNumber', e.target.value.toUpperCase())}
                    placeholder="DL-01-AB-1234"
                  />
                  <StyledSelect
                    label="Vehicle Type"
                    required
                    value={formData.vehicleType}
                    onChange={e => set('vehicleType', e.target.value)}
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Truck">Truck</option>
                    <option value="Bus">Bus</option>
                  </StyledSelect>
                  <StyledInput
                    label="Vehicle Model"
                    type="text"
                    value={formData.vehicleModel}
                    onChange={e => set('vehicleModel', e.target.value)}
                    placeholder="Honda City 2022"
                  />
                  <StyledInput
                    label="Vehicle Color"
                    type="text"
                    value={formData.vehicleColor}
                    onChange={e => set('vehicleColor', e.target.value)}
                    placeholder="Pearl White"
                  />
                </div>

                {/* Preview plate */}
                {formData.vehicleNumber && (
                  <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Plate Preview</p>
                      <p className="text-white font-black text-2xl font-mono tracking-widest">{formData.vehicleNumber}</p>
                    </div>
                    <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">
                      {formData.vehicleType}
                    </div>
                  </div>
                )}
              </FormCard>
            )}

            {/* ── STEP 3: Emergency Contacts ── */}
            {step === 3 && (
              <FormCard title="Emergency Contacts" subtitle="Who should be notified in an emergency?" icon={FiPhone} color="green">
                <div className="space-y-4">
                  {contacts.map((contact, i) => (
                    <div
                      key={i}
                      className="bg-white/5 border border-white/10 rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="text-white font-semibold text-sm">Contact {i + 1}</span>
                        </div>
                        {contacts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveContact(i)}
                            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <StyledInput
                          placeholder="Full Name"
                          value={contact.name}
                          onChange={e => handleContactChange(i, 'name', e.target.value)}
                        />
                        <StyledInput
                          placeholder="Phone Number"
                          type="tel"
                          value={contact.phone}
                          onChange={e => handleContactChange(i, 'phone', e.target.value)}
                        />
                        <StyledInput
                          placeholder="Relation (e.g. Wife)"
                          value={contact.relation}
                          onChange={e => handleContactChange(i, 'relation', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {contacts.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddContact}
                    className="w-full mt-3 flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-blue-500/40 hover:bg-blue-500/5 text-gray-400 hover:text-blue-400 text-sm font-medium py-3.5 rounded-2xl transition-all duration-200"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Another Contact ({contacts.length}/3)
                  </button>
                )}
              </FormCard>
            )}

            {/* ── STEP 4: Medical ── */}
            {step === 4 && (
              <FormCard title="Medical Information" subtitle="Critical for first responders — optional but recommended" icon={FiHeart} color="red">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
                  <FiAlertCircle className="text-yellow-400 w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-300 text-xs leading-relaxed">
                    This information is only shown to first responders scanning your QR code. It can be life-saving.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-5 mb-5">
                  <StyledInput
                    label="Blood Group"
                    type="text"
                    value={formData.bloodGroup}
                    onChange={e => set('bloodGroup', e.target.value)}
                    placeholder="e.g. O+"
                  />
                  <div className="md:col-span-2">
                    <StyledInput
                      label="Known Allergies"
                      type="text"
                      value={formData.allergies}
                      onChange={e => set('allergies', e.target.value)}
                      placeholder="e.g. Penicillin, Aspirin"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel label="Additional Medical Notes" />
                  <textarea
                    value={formData.medicalNotes}
                    onChange={e => set('medicalNotes', e.target.value)}
                    placeholder="e.g. Diabetic, pacemaker fitted, on blood thinners..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all duration-200 resize-none"
                  />
                </div>

                {/* Summary preview */}
                <div className="mt-4 bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                  <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">Registration Summary</p>
                  {[
                    { label: 'Owner', value: formData.ownerName },
                    { label: 'Phone', value: formData.ownerPhone },
                    { label: 'Vehicle', value: `${formData.vehicleNumber} · ${formData.vehicleType}${formData.vehicleModel ? ` · ${formData.vehicleModel}` : ''}` },
                    { label: 'Contacts', value: `${contacts.filter(c => c.name && c.phone).length} emergency contact(s)` },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="text-white font-medium">{row.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </FormCard>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="group flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-400/30 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Continue
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Generating QR Code...
                    </>
                  ) : (
                    <>
                      Generate My QR Code
                      <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-6 mt-8 text-gray-600 text-xs">
          <span className="flex items-center gap-1.5"><FiShield className="text-green-500 w-3.5 h-3.5" /> AES-256 encrypted</span>
          <span className="flex items-center gap-1.5"><FiCheck className="text-blue-500 w-3.5 h-3.5" /> GDPR compliant</span>
          <span className="flex items-center gap-1.5"><FiHeart className="text-red-500 w-3.5 h-3.5" /> Free forever</span>
        </div>
      </div>
    </div>
  );
}