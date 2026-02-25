// components/QRCodeDisplay.tsx

'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Button from './ui/Button';

interface QRCodeDisplayProps {
  vehicleId: string;
  ownerName: string;
  vehicleNumber: string;
}

export default function QRCodeDisplay({ 
  vehicleId, 
  ownerName, 
  vehicleNumber 
}: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Generate the emergency alert URL
  const alertUrl = `${process.env.NEXT_PUBLIC_APP_URL}/alert/${vehicleId}`;

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Create download link
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `emergency-qr-${vehicleNumber}.png`;
    link.href = url;
    link.click();
  };

  const printQR = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <div className="flex justify-center">
        <div 
          ref={qrRef}
          className="p-8 bg-white rounded-2xl shadow-lg border-4 border-blue-500"
        >
      <QRCodeCanvas
        value={alertUrl}
        size={300}
        level="H"
        includeMargin={true}
      />
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-blue-50 rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          QR Code Generated Successfully! ✅
        </h3>
        <p className="text-gray-700 mb-1">
          <strong>Owner:</strong> {ownerName}
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Vehicle:</strong> {vehicleNumber}
        </p>
        <p className="text-sm text-gray-600">
          Vehicle ID: <code className="bg-white px-2 py-1 rounded">{vehicleId}</code>
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
        <h4 className="font-semibold text-gray-900 mb-2">📋 Next Steps:</h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Download the QR code using the button below</li>
          <li>Print it on a waterproof sticker (recommended size: 3x3 inches)</li>
          <li>Place it on your vehicle's rear windshield or bumper</li>
          <li>Ensure it's visible and not obstructed</li>
          <li>Keep your emergency contacts updated</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <Button onClick={downloadQR} size="lg" fullWidth>
          📥 Download QR Code
        </Button>
        <Button onClick={printQR} variant="secondary" size="lg" fullWidth>
          🖨️ Print QR Code
        </Button>
      </div>
{/* Test Link */}
<div className="text-center">
  <p className="text-sm text-gray-600 mb-2">Test your QR code:</p>

  <a
    href={alertUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:underline text-sm"
  >
    {alertUrl}
  </a>
</div>

      {/* Warning */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <p className="text-sm text-gray-700">
          ⚠️ <strong>Important:</strong> Do not share your Vehicle ID publicly. 
          Only the QR code should be visible on your vehicle.
        </p>
      </div>
    </div>
  );
}