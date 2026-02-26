'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import {
  FiArrowRight, FiShield, FiZap, FiMapPin, FiPhone,
  FiLock, FiStar, FiCheck, FiChevronDown
} from 'react-icons/fi';

// ─── Utility: animated counter hook ───────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── Utility: intersection observer hook ──────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Pulse ring component ──────────────────────────────────────────────────────
function PulseRing() {
  return (
    <span className="relative flex h-5 w-5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500" />
    </span>
  );
}

// ─── QR Mockup ────────────────────────────────────────────────────────────────
function QRMockup() {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* outer glow */}
      <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-2xl scale-110" />
      {/* card */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
        {/* QR grid pattern */}
        <div className="grid grid-cols-9 gap-1 mb-4">
          {Array.from({ length: 81 }).map((_, i) => {
            // generate stable "QR-like" pattern
            const corners = [0,1,2,3,4,5,6,7,8,9,17,18,26,27,35,36,44,45,53,54,62,63,64,65,66,67,68,72,73,74,75,76,77,78,79,80];
            const filled = corners.includes(i) || Math.sin(i * 37.3) > 0.3;
            return (
              <div
                key={i}
                className={`w-full aspect-square rounded-sm ${filled ? 'bg-white' : 'bg-white/10'}`}
              />
            );
          })}
        </div>
        <div className="text-center">
          <p className="text-white/60 text-xs font-mono tracking-widest">RQ-2024-XK91</p>
          <p className="text-white text-sm font-semibold mt-1">Emergency QR</p>
        </div>
      </div>
      {/* floating badge */}
      <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/40 flex items-center gap-1.5">
        <PulseRing />
        <span>ACTIVE</span>
      </div>
    </div>
  );
}

// ─── Section Fade Wrapper ──────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Stats Counter ─────────────────────────────────────────────────────────────
function StatCard({ value, label, suffix = '+' }: { value: number; label: string; suffix?: string }) {
  const { ref, inView } = useInView();
  const count = useCounter(value, 2000, inView);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black text-white mb-2 tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-blue-200 text-sm font-medium uppercase tracking-widest">{label}</div>
    </div>
  );
}

// ─── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon, title, description, delay = 0,
}: { icon: React.ElementType; title: string; description: string; delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <div className="group relative bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-300 cursor-default overflow-hidden">
        {/* glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl" />
        {/* border glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-blue-200" />
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, role, delay = 0 }: { quote: string; name: string; role: string; delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <div className="group bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => (
            <FiStar key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-gray-600 leading-relaxed mb-6 text-sm">"{quote}"</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {name[0]}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{name}</div>
            <div className="text-gray-400 text-xs">{role}</div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const features = [
    {
      icon: FiZap,
      title: 'Instant QR Generation',
      description: 'Get a unique, tamper-proof QR code linked to your vehicle within seconds of registration.',
    },
    {
      icon: FiPhone,
      title: 'Emergency Alerts',
      description: 'Emergency contacts are notified immediately with your real-time GPS location.',
    },
    {
      icon: FiShield,
      title: 'Always Accessible',
      description: 'Anyone with a phone can scan — no app needed. Works offline too.',
    },
    {
      icon: FiMapPin,
      title: 'Precise Location',
      description: 'Pinpoint GPS coordinates shared instantly so help arrives faster.',
    },
    {
      icon: FiLock,
      title: 'Privacy First',
      description: 'Your data stays encrypted. Location is only shared when the QR is actually scanned.',
    },
    {
      icon: FiCheck,
      title: '99.8% Uptime',
      description: 'Mission-critical infrastructure built for reliability when every second counts.',
    },
  ];

  const howItWorks = [
    { step: '01', title: 'Register', description: 'Enter your vehicle details and emergency contacts in under 2 minutes.' },
    { step: '02', title: 'Get QR Code', description: 'Receive a unique, encrypted QR code linked to your emergency profile.' },
    { step: '03', title: 'Stick It On', description: 'Print and place the QR sticker on your windscreen or bumper.' },
    { step: '04', title: 'Stay Protected', description: 'Any passerby can scan and alert your contacts with your location instantly.' },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#030712] text-white min-h-screen flex flex-col">
        {/* Animated background mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/20 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/20 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
          <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-red-600/10 blur-[100px] animate-[pulse_12s_ease-in-out_infinite_4s]" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 ">
              <Image src="/images/logo.jpeg" alt="ResqueQR" fill className="object-cover" />
            </div>
            <span className="font-bold text-lg tracking-tight">ResqueQR</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >
              Security
            </button>
          </div>
          <button
            onClick={() => router.push('/register')}
            className="bg-white text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-blue-50 transition-colors"
          >
            Get Started
          </button>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-0 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left: text */}
              <div>
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 text-sm text-white/80"
                  style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(16px)', transition: 'all 0.6s ease' }}
                >
                  <PulseRing />
                  <span>Save Lives with Smart QR Technology</span>
                </div>

                <h1
                  className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] mb-6"
                  style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(24px)', transition: 'all 0.7s ease 0.1s' }}
                >
                  <span className="text-white">Emergency</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                    Response
                  </span>
                  <br />
                  <span className="text-white">in Seconds</span>
                </h1>

                <p
                  className="text-lg text-white/60 max-w-md leading-relaxed mb-10"
                  style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(24px)', transition: 'all 0.7s ease 0.2s' }}
                >
                  Register your vehicle once. Get a unique QR code. In any accident, bystanders scan it — your emergency contacts are notified instantly with your GPS location.
                </p>

                <div
                  className="flex flex-col sm:flex-row gap-4"
                  style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(24px)', transition: 'all 0.7s ease 0.3s' }}
                >
                  <button
                    onClick={() => router.push('/register')}
                    className="group relative inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold text-base px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-400/40 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Register Your Vehicle
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-300"
                  >
                    See How It Works
                  </button>
                </div>

                {/* Trust badges */}
                <div
                  className="flex items-center gap-6 mt-10 text-white/40 text-xs"
                  style={{ opacity: heroVisible ? 1 : 0, transition: 'all 0.7s ease 0.5s' }}
                >
                  <span className="flex items-center gap-1.5"><FiShield className="text-green-400" /> No credit card</span>
                  <span className="flex items-center gap-1.5"><FiLock className="text-blue-400" /> AES-256 encrypted</span>
                  <span className="flex items-center gap-1.5"><FiZap className="text-yellow-400" /> Free forever plan</span>
                </div>
              </div>

              {/* Right: QR Mockup */}
              <div
                className="flex justify-center"
                style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(40px) scale(0.95)', transition: 'all 0.9s ease 0.4s' }}
              >
                <div className="relative">
                  {/* Phone mockup */}
                  <div className="w-72 h-[520px] bg-gray-900 rounded-[40px] border-4 border-gray-700 shadow-2xl shadow-black/60 overflow-hidden relative">
                    {/* Status bar */}
                    <div className="flex justify-between items-center px-6 pt-4 pb-2 bg-gray-900">
                      <span className="text-white text-xs font-medium">9:41</span>
                      <div className="w-24 h-6 bg-black rounded-full" />
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-white/60 rounded-sm" />
                        <div className="w-1.5 h-2 bg-white/30 rounded-sm" />
                      </div>
                    </div>
                    {/* App screen */}
                    <div className="px-5 py-4 h-full bg-gradient-to-b from-gray-900 to-gray-950">
                      <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-4 mb-4 flex items-center gap-3">
                        <PulseRing />
                        <div>
                          <p className="text-red-400 text-xs font-bold uppercase tracking-wide">Emergency Alert</p>
                          <p className="text-white text-xs mt-0.5">Scanning vehicle QR...</p>
                        </div>
                      </div>
                      <QRMockup />
                      <div className="mt-6 space-y-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                          <FiPhone className="text-blue-400 w-4 h-4 flex-shrink-0" />
                          <div>
                            <p className="text-white/40 text-xs">Emergency Contact</p>
                            <p className="text-white text-sm font-medium">Sarah (Wife) · +1 555-0192</p>
                          </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                          <FiMapPin className="text-green-400 w-4 h-4 flex-shrink-0" />
                          <div>
                            <p className="text-white/40 text-xs">Location Detected</p>
                            <p className="text-white text-sm font-medium">I-95 N, Exit 42, Newark</p>
                          </div>
                        </div>
                        <button className="w-full bg-red-500 text-white text-sm font-bold py-3 rounded-xl hover:bg-red-400 transition-colors flex items-center justify-center gap-2">
                          <PulseRing />
                          Notifying Contacts...
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Floating glow rings */}
                  <div className="absolute -inset-8 rounded-[50px] border border-blue-500/10 animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute -inset-16 rounded-[60px] border border-blue-500/5 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-10 animate-bounce">
          <FiChevronDown className="text-white/30 w-6 h-6" />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-6 ">
            <StatCard value={12500} label="Vehicles Registered" />
            <StatCard value={3200} label="Emergency Alerts Sent" />
            <StatCard value={99} label="Uptime Guarantee" suffix="%" />
          </div>
        </div>
      </section>

      {/* ── WHY RESQUEQR IS DIFFERENT ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-blue-500 font-semibold text-sm uppercase tracking-widest">The Problem</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-4">
                Traditional stickers<br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">don't cut it</span>
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
                A paper contact sticker can't send location, can't dial, and fails when you need it most. ResqueQR is built for the moments that matter.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Regular Contact Sticker', points: ['Manual calling required', 'No location information', 'Can be smudged or torn', 'Only one contact possible'], bad: true },
              { label: 'ResqueQR System', points: ['Auto-notifies all contacts', 'Shares real-time GPS location', 'Digital — never degrades', 'Multiple contacts + hospitals'], bad: false },
            ].map((col, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className={`rounded-2xl p-8 ${col.bad ? 'bg-white border-2 border-red-100' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'}`}>
                  <h3 className={`font-bold text-lg mb-6 ${col.bad ? 'text-red-500' : 'text-white'}`}>{col.label}</h3>
                  <ul className="space-y-3">
                    {col.points.map((pt, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${col.bad ? 'bg-red-100 text-red-500' : 'bg-white/20 text-white'}`}>
                          {col.bad ? '✕' : '✓'}
                        </span>
                        <span className={col.bad ? 'text-gray-600' : 'text-blue-100'}>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-blue-500 font-semibold text-sm uppercase tracking-widest">Features</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3">Built for emergencies</h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest">Process</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mt-3">How it works</h2>
            </div>
          </FadeIn>

          {/* Steps - desktop: horizontal with connecting line */}
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

            <div className="grid md:grid-cols-4 gap-8">
              {howItWorks.map((item, i) => (
                <FadeIn key={i} delay={i * 120}>
                  <div className="text-center group">
                    <div className="relative inline-flex mb-6">
                      <div className="w-20 h-20 rounded-full border-2 border-blue-500/40 bg-blue-500/10 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-500/20 transition-all duration-300">
                        <span className="text-2xl font-black text-blue-400">{item.step}</span>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-blue-500 font-semibold text-sm uppercase tracking-widest">Stories</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3">Real people. Real impact.</h2>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="My car was rear-ended on the highway. A bystander scanned the QR and my wife was called within 30 seconds. ResqueQR may have saved my life."
              name="Marcus T."
              role="Registered since 2023"
              delay={0}
            />
            <TestimonialCard
              quote="I'm a paramedic. I've seen ResqueQR codes in the field. The location data we receive is accurate and the family is already on the way. It genuinely helps."
              name="Dr. Aisha R."
              role="Emergency Physician"
              delay={100}
            />
            <TestimonialCard
              quote="Setup took 3 minutes. I registered all 4 of our family cars. The peace of mind this gives me is priceless."
              name="James K."
              role="Father of 3"
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section id="security" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <span className="text-blue-500 font-semibold text-sm uppercase tracking-widest">Privacy & Security</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-6">
                Your data is locked.<br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Until it matters.</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                We built ResqueQR with a zero-data-by-default approach. Your information is encrypted at rest. Location is only shared at the moment someone scans your QR code in an emergency.
              </p>
              <div className="space-y-4">
                {[
                  { icon: FiLock, label: 'AES-256 encryption on all stored data' },
                  { icon: FiShield, label: 'Location only shared on active scan — never logged' },
                  { icon: FiCheck, label: 'No advertising, no data selling, ever' },
                  { icon: FiZap, label: 'GDPR & CCPA compliant infrastructure' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="text-blue-600 w-5 h-5" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                    <FiLock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">Zero Trust Architecture</h3>
                  <p className="text-blue-100 leading-relaxed text-sm">
                    Emergency information is never exposed publicly. When a QR code is scanned, our system authenticates the scan, logs it securely, then dispatches encrypted notifications. No personal data is visible to the scanner.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 overflow-hidden bg-[#030712]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-red-600/15 blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2.5 mb-8 text-red-400 text-sm font-medium">
              <PulseRing />
              In an accident, every second matters
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Register today.<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Be protected tomorrow.
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              Join 12,500+ vehicle owners who chose to be prepared. Setup takes less than 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/register')}
                className="group relative inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-400/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                Register Your Vehicle — Free
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-6">Free forever plan · No credit card required · Cancel anytime</p>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black py-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-14 h-14 ">
              <Image src="/images/logo.jpeg" alt="ResqueQR" fill className="object-cover" />
            </div>
            <span className="text-white font-bold">ResqueQR</span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} ResqueQR. All rights reserved.</p>
          <div className="flex gap-6 text-gray-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}