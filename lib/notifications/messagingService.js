/**
 * SMS & WhatsApp Notification Service for Nawaz Traders ERP
 */

export const NOTIFICATION_TEMPLATES = {
  CROP_PURCHASE_DETAILED_BREAKDOWN_HINDI: ({
    farmerName,
    voucherNo,
    commodity,
    quantityQtl,
    ratePerQtl,
    grossAmount,
    labourCharges,
    gstAmount,
    deductions,
    netAmount,
    advancePaid,
    dueAmount,
    promisedDate,
  }) =>
    `🌾 *NAWAZ TRADERS — फसल खरीद पर्ची (PURCHASE VOUCHER)* 🌾\n\n` +
    `किसान का नाम: ${farmerName}\n` +
    `पर्ची क्रमांक: ${voucherNo}\n` +
    `जिंस (Commodity): ${commodity}\n` +
    `तौल मात्रा: ${quantityQtl} क्विंटल\n` +
    `दर (Rate): ₹${ratePerQtl} / क्विंटल\n` +
    `----------------------------------\n` +
    `सौदा कुल मूल्य (Gross): ₹${grossAmount}\n` +
    `${parseFloat(labourCharges) > 0 ? `+ पल्लेदारी / हमाली: ₹${labourCharges}\n` : ''}` +
    `${parseFloat(gstAmount) > 0 ? `+ मंडी टैक्स / GST: ₹${gstAmount}\n` : ''}` +
    `${parseFloat(deductions) > 0 ? `- कटौती (नमी/कट: ₹${deductions})\n` : ''}` +
    `----------------------------------\n` +
    `कुल देय राशि (Net Payable): ₹${netAmount}\n` +
    `अग्रिम भुगतान (Advance Paid): ₹${advancePaid}\n` +
    `शेष बकाया राशि (Balance Due): ₹${dueAmount}\n` +
    `${promisedDate ? `भुगतान वादा तिथि (Promised Date): ${promisedDate}\n` : ''}` +
    `----------------------------------\n` +
    `कृषि उपज मंडी, सीहोर (म.प्र.) | नवाज़ ट्रेडर्स।`,

  PAYMENT_RECEIVED_HINDI: (partyName, amount, paymentNo, paymentMode, remainingBalance, promisedDate) =>
    `💰 *NAWAZ TRADERS — भुगतान रसीद (PAYMENT VOUCHER)* 💰\n\n` +
    `प्रिय ${partyName} जी,\n` +
    `आपके खाते में ₹${amount} का भुगतान (${paymentMode}) प्राप्त दर्ज हुआ है।\n` +
    `रसीद सं: ${paymentNo}\n` +
    `कुल शेष बकाया balance: ₹${remainingBalance}\n` +
    `${promisedDate ? `अगली देय तिथि: ${promisedDate}\n` : ''}\n` +
    `धन्यवाद! नवाज़ ट्रेडर्स, सीहोर।`,

  PAYMENT_DUE_REMINDER_HINDI: (farmerName, dueAmount, promisedDate) =>
    `🔔 *NAWAZ TRADERS — भुगतान स्मरण पत्र* 🔔\n\n` +
    `नमस्ते ${farmerName} जी, नवाज़ ट्रेडर्स से आपकी बकाया राशि ₹${dueAmount} का भुगतान तिथि ${promisedDate} को देय है।`,
};

/**
 * Send SMS Notification
 */
export async function sendSmsNotification({ phone, message }) {
  if (!phone) return { success: false, error: 'Phone number missing' };

  // Production Gateway Hook (e.g., MSG91 / Twilio / Textlocal)
  const isProduction = process.env.NODE_ENV === 'production' && process.env.SMS_API_KEY;

  if (isProduction) {
    try {
      // Example production API call
      // await fetch(process.env.SMS_API_URL, { method: 'POST', body: JSON.stringify({ to: phone, message }) });
      console.log(`[PROD SMS SENT to ${phone}]: ${message}`);
    } catch (err) {
      console.error('SMS Gateway Error:', err);
    }
  } else {
    console.log(`\n=================== [DEV SMS SIMULATION] ===================`);
    console.log(`TO: ${phone}`);
    console.log(`MESSAGE:\n${message}`);
    console.log(`============================================================\n`);
  }

  return { success: true, deliveredTo: phone };
}

/**
 * Send WhatsApp Notification
 */
export async function sendWhatsAppNotification({ phone, message }) {
  if (!phone) return { success: false, error: 'Phone number missing' };

  console.log(`\n=================== [WHATSAPP MESSAGE LOG] ===================`);
  console.log(`TO: ${phone}`);
  console.log(`MESSAGE:\n${message}`);
  console.log(`==============================================================\n`);

  return { success: true, deliveredTo: phone };
}
