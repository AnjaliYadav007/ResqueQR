// app/register/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createVehicle } from '@/lib/firebase/operations';
import { generateVehicleId } from '@/lib/utils/generateId';
import { VehicleOwner, EmergencyContact } from '@/types/vehicle';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
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

  const handleAddContact = () => {
    if (contacts.length < 3) {
      setContacts([...contacts, { name: '', phone: '', relation: '' }]);
    }
  };

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate
      if (!formData.ownerName || !formData.ownerPhone || !formData.vehicleNumber) {
        throw new Error('Please fill in all required fields');
      }

      // Filter out empty contacts
      const validContacts = contacts.filter(c => c.name && c.phone);
      
      if (validContacts.length === 0) {
        throw new Error('Please add at least one emergency contact');
      }

      // Generate unique ID
      const vehicleId = generateVehicleId();

      // Prepare vehicle data
      const vehicleData: VehicleOwner = {
        vehicleId,
        ...formData,
        emergencyContacts: validContacts,
      };

      // Save to database
      await createVehicle(vehicleData);

      // Redirect to QR download page
      router.push(`/download?id=${vehicleId}`);
      
    } catch (err: any) {
      setError(err.message || 'Failed to register vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚑 Vehicle Registration
          </h1>
          <p className="text-gray-600 mb-8">
            Register your vehicle for emergency QR code generation
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Owner Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Owner Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="John Doe"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  required
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  placeholder="+91 9876543210"
                />
                <Input
                  label="Email (Optional)"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Vehicle Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Vehicle Number"
                  type="text"
                  required
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                  placeholder="DL-01-AB-1234"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Truck">Truck</option>
                    <option value="Bus">Bus</option>
                  </select>
                </div>
                <Input
                  label="Vehicle Model"
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  placeholder="Honda City 2022"
                />
                <Input
                  label="Vehicle Color"
                  type="text"
                  value={formData.vehicleColor}
                  onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                  placeholder="Red"
                />
              </div>
            </div>

            {/* Emergency Contacts */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Emergency Contacts</h2>
                {contacts.length < 3 && (
                  <Button type="button" size="sm" onClick={handleAddContact}>
                    + Add Contact
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Contact {index + 1}</h3>
                      {contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(index)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <Input
                        placeholder="Name"
                        required
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Phone"
                        type="tel"
                        required
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      />
                      <Input
                        placeholder="Relation"
                        required
                        value={contact.relation}
                        onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Medical Information (Optional)</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Blood Group"
                  type="text"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  placeholder="O+"
                />
                <Input
                  label="Allergies"
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="Penicillin"
                />
                <Input
                  label="Medical Notes"
                  type="text"
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  placeholder="Diabetic"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Generating QR Code...' : 'Generate QR Code'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}