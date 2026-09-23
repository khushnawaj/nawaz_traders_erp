/**
 * Server-side Printable HTML Invoice Generator for Nawaz Traders ERP
 */

export function generatePurchaseSlipHtml(purchase) {
  const p = purchase;
  const items = p.items || [];
  const farmer = p.party || {};
  const godown = p.godown || {};

  const formattedDate = p.date ? new Date(p.date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

  const itemsRows = items.map((item, index) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px; text-align: center;">${index + 1}</td>
      <td style="padding: 10px;"><strong>${item.commodity?.localName || item.commodity?.name || 'Grain'}</strong></td>
      <td style="padding: 10px; text-align: right;">${item.displayQuantity} ${item.unit?.code || 'QTL'}</td>
      <td style="padding: 10px; text-align: right;">₹${item.ratePerUnit}</td>
      <td style="padding: 10px; text-align: right; font-weight: bold;">₹${item.amount}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="UTF-8">
      <title>Purchase Slip - ${p.purchaseNo}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #0f172a; background: #ffffff; }
        .header { text-align: center; border-bottom: 2px solid #064e3b; padding-bottom: 15px; margin-bottom: 20px; }
        .brand { font-size: 24px; font-weight: 800; color: #064e3b; letter-spacing: 1px; }
        .tagline { font-size: 11px; color: #d97706; font-weight: bold; margin-top: 4px; }
        .address { font-size: 12px; color: #475569; margin-top: 4px; }
        .flex-between { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        th { background: #064e3b; color: #ffffff; padding: 10px; text-align: left; }
        .totals { width: 300px; margin-left: auto; font-size: 13px; line-height: 1.8; }
        .totals-row { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding: 4px 0; }
        .grand-total { font-weight: 800; font-size: 15px; color: #064e3b; border-top: 2px solid #064e3b; padding-top: 6px; }
        .footer-signatures { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">NAWAZ TRADERS (नवाज़ ट्रेडर्स)</div>
        <div class="tagline">GRAINS TODAY • A STRONGER TOMORROW</div>
        <div class="address">Krishi Upaj Mandi, Sehore (M.P.) - 466001 | Mo: 98260 00000</div>
      </div>

      <div class="flex-between">
        <div class="box" style="width: 48%;">
          <strong>FARMER / KISAN DETAILS:</strong><br/>
          Name: <strong>${farmer.name || 'N/A'}</strong><br/>
          Code: ${farmer.partyCode || 'N/A'} | Phone: ${farmer.phone || 'N/A'}<br/>
          City/Village: ${farmer.city || 'Sehore'}
        </div>
        <div class="box" style="width: 45%;">
          <strong>PURCHASE VOUCHER:</strong><br/>
          Voucher No: <strong style="color: #064e3b;">${p.purchaseNo}</strong><br/>
          Date: ${formattedDate}<br/>
          Godown: ${godown.name || 'Main Warehouse'}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: center;">#</th>
            <th>Commodity (जिंस)</th>
            <th style="text-align: right;">Quantity</th>
            <th style="text-align: right;">Rate / Unit</th>
            <th style="text-align: right;">Gross Value</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row"><span>Gross Amount:</span> <span>₹${p.grossAmount}</span></div>
        <div class="totals-row"><span>Palledari / Labour:</span> <span>₹${p.labourCharges || 0}</span></div>
        <div class="totals-row"><span>Mandi Tax / GST:</span> <span>₹${p.gstAmount || 0}</span></div>
        <div class="totals-row"><span>Deductions:</span> <span>-₹${p.totalDeductions || 0}</span></div>
        <div class="totals-row grand-total"><span>Net Payable:</span> <span>₹${p.netAmount}</span></div>
        <div class="totals-row"><span>Advance Paid:</span> <span>₹${p.paidAmount || 0}</span></div>
        <div class="totals-row" style="color: #dc2626; font-weight: bold;"><span>Balance Due:</span> <span>₹${p.dueAmount || 0}</span></div>
      </div>

      <div class="footer-signatures">
        <div>Farmer Signature: _______________</div>
        <div>Authorized Signatory: _______________</div>
      </div>
    </body>
    </html>
  `;
}
