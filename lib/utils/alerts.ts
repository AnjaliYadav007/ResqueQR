// lib/utils/alerts.ts

/**
 * Send emergency alert via WhatsApp
 */
export const sendWhatsAppAlert = (phone: string, message: string): void => {
  // Remove all non-numeric characters (spaces, dashes, plus signs, etc.)
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  console.log('Sending WhatsApp to:', cleanPhone);
  
  // Create WhatsApp URL
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  
  // Open in new window
  window.open(url, '_blank');
};

/**
 * Send alert to multiple contacts with delay
 */
export const sendMultipleWhatsAppAlerts = (
  contacts: Array<{ name: string; phone: string }>,
  message: string
): void => {
  contacts.forEach((contact, index) => {
    // Stagger by 1 second to avoid popup blocking
    setTimeout(() => {
      sendWhatsAppAlert(contact.phone, message);
    }, index * 1000);
  });
};

/**
 * Create emergency message
 */
export const createEmergencyMessage = (
  ownerName: string,
  vehicleNumber: string,
  locationUrl?: string,
  bloodGroup?: string
): string => {
  return `🚨 EMERGENCY ALERT 🚨

Vehicle Accident Reported!

Owner: ${ownerName}
Vehicle: ${vehicleNumber}
${bloodGroup ? `Blood Group: ${bloodGroup}` : ''}

${locationUrl ? `Location: ${locationUrl}` : 'Location: Not available'}

Please respond immediately.

- Sent via Emergency QR System`;
};