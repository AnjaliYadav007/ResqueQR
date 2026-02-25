// app/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { FiArrowRight, FiCode, FiShield, FiZap } from 'react-icons/fi';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: FiCode,
      title: 'QR Code Generation',
      description: 'Generate unique QR codes for your vehicle with emergency information',
    },
    {
      icon: FiShield,
      title: 'Instant Alerts',
      description: 'Emergency contacts notified immediately with location details',
    },
    {
      icon: FiZap,
      title: 'Quick Response',
      description: 'Anyone can scan and access critical information in seconds',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-7xl mb-6 animate-bounce">🚑</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Emergency QR Alert System
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Save lives in accidents. Instant emergency contact notification 
              through QR code technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/register')}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
              >
                Register Your Vehicle
                <FiArrowRight className="inline ml-2" />
              </Button>
              <Button
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                variant="secondary"
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
              >
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Our System?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Register', description: 'Fill in your vehicle and contact details' },
              { step: '2', title: 'Generate QR', description: 'System creates unique QR code for your vehicle' },
              { step: '3', title: 'Place on Vehicle', description: 'Print and stick QR code on your vehicle' },
              { step: '4', title: 'Emergency Response', description: 'Anyone can scan to alert your contacts' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Protect Your Vehicle?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of vehicle owners who have already registered
          </p>
          <Button
            onClick={() => router.push('/register')}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-12 py-4"
          >
            Get Started Now
            <FiArrowRight className="inline ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}