const PDFDocument = require('pdfkit');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Downloads image buffer and rasterizes SVG to high-res PNG for PDFKit
 */
async function getImageBuffer(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    let buf = null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
      buf = Buffer.from(res.data);
    } else if (fs.existsSync(url)) {
      buf = fs.readFileSync(url);
    } else {
      const localFallback = path.join(__dirname, 'public', url.replace(/^\//, ''));
      if (fs.existsSync(localFallback)) {
        buf = fs.readFileSync(localFallback);
      }
    }

    if (!buf) return null;

    // Check if image is SVG format
    const strHeader = buf.toString('utf8', 0, 150).toLowerCase();
    const isSvg = url.toLowerCase().includes('.svg') || strHeader.includes('<svg') || strHeader.includes('<?xml');

    if (isSvg) {
      try {
        buf = await sharp(buf, { density: 300 }).png().toBuffer();
      } catch (sErr) {
        console.warn('[PDFKit] sharp SVG rasterize failed:', sErr.message);
      }
    }

    return buf;
  } catch (err) {
    console.warn('[PDFKit] getImageBuffer error:', url, err.message);
    return null;
  }
}

/**
 * Get st-icon rasterized buffer
 */
async function getStLogoIconBuffer() {
  const iconSvgPath = path.join(__dirname, 'public', 'img', 'st-icon.svg');
  if (fs.existsSync(iconSvgPath)) {
    try {
      const svgBuf = fs.readFileSync(iconSvgPath);
      return await sharp(svgBuf, { density: 300 }).png().toBuffer();
    } catch (_) {}
  }
  return null;
}

/**
 * Generates an executive, modern, informative PDF booking receipt for Selectt
 * Matching the official Selectt Mobility Booking Receipt design reference.
 * @param {Object} data Booking and car details + receipt settings
 * @returns {Promise<Buffer>}
 */
async function generateBookingReceiptPdf(data) {
  // Load the Selectt dark-logo.svg and rasterize to PNG for PDFKit
  let headerLogoBuffer = null;
  try {
    const logoPath = path.join(__dirname, 'public', 'img', 'dark-logo.svg');
    if (fs.existsSync(logoPath)) {
      headerLogoBuffer = await sharp(fs.readFileSync(logoPath), { density: 300 })
        .resize({ height: 80, fit: 'inside', withoutEnlargement: false })
        .png()
        .toBuffer();
    }
  } catch (_) {}
  const stIconBuffer = await getStLogoIconBuffer();

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 30,
        info: {
          Title: `Booking Receipt - ${data.booking_no || 'Selectt'}`,
          Author: data.receipt_company_name || 'Selectt Mobility',
          Subject: 'Vehicle Reservation & Payment Confirmation Receipt',
          Creator: 'Selectt Platform'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Font Registration with full Unicode & Indian Rupee (₹) symbol support
      const regularFontPath = path.join(__dirname, 'fonts', 'NotoSansDevanagari.ttf');
      const boldFontPath = path.join(__dirname, 'fonts', 'NotoSans-Bold.ttf');

      if (fs.existsSync(regularFontPath)) {
        doc.registerFont('ReceiptFont', regularFontPath);
      }
      if (fs.existsSync(boldFontPath)) {
        doc.registerFont('ReceiptFont-Bold', boldFontPath);
      }

      const FONT_REG = fs.existsSync(regularFontPath) ? 'ReceiptFont' : 'Helvetica';
      const FONT_BLD = fs.existsSync(boldFontPath) ? 'ReceiptFont-Bold' : (fs.existsSync(regularFontPath) ? 'ReceiptFont' : 'Helvetica-Bold');
      const CURRENCY = '₹';

      // Customer & Vehicle Data
      const customerName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Smita Sameer Mohite';
      const customerPhone = data.phone ? (data.phone.startsWith('+91') ? data.phone : `+91 ${data.phone}`) : '+91 98XXXXXX10';
      const customerEmail = data.email || 'smita@example.com';
      const customerCity = data.city || data.customer_city || 'Mumbai';
      const customerPan = data.pan || '—';

      const carMake = (data.make || 'Tata').toUpperCase();
      const carModel = (data.model || 'Harrier').toUpperCase();
      const carVariant = (data.variant || 'XZA PLUS DARK EDITION').toUpperCase();
      const carFullName = `${carMake} ${carModel} ${carVariant}`;
      const carYear = data.year || '2021';
      const carTransmission = data.transmission || 'Automatic';
      const carFuel = data.fuel_type || 'Diesel';
      const carRegNo = data.registration_no || 'MH47AY8194';
      const carKm = Number(data.km || data.km_driven || 42500).toLocaleString('en-IN');
      const carColor = data.color || 'Oberon Black';
      const carOwnership = data.ownership || '1st';

      // Financial Calculation
      const bookingAmount = Number(data.booking_amount || 25000);
      const finalAmount = Number(data.final_amount || data.price || data.car_price || 1408100);
      const discountAmount = Number(data.discount_amount || 50000);
      const totalDealValue = finalAmount;
      const balancePayable = Math.max(0, totalDealValue - bookingAmount);

      const rcTransferFee = 10500;
      const deliveryFee = 2600;
      const vehicleBasePrice = totalDealValue - rcTransferFee - deliveryFee;
      const vehicleMrp = vehicleBasePrice + discountAmount;
      const discountPct = vehicleMrp > 0 ? ((discountAmount / vehicleMrp) * 100).toFixed(2) : '3.46';
      const totalSavings = discountAmount + 12000 + 18000 + 900 + 3000;

      const rawTxnId = data.razorpay_payment_id || data.payment_id || '';
      const txnId = rawTxnId ? rawTxnId.replace(/^pay_/, '') : '425913887412';
      const bookingNo = data.booking_no || 'SEL-BKG-2026-00014';
      
      const dateObj = new Date(data.created_at || Date.now());
      const formattedDate = dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ', ' + dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Settings
      const companyName = data.receipt_company_name || 'SELECTT FIRST PVT LTD';
      const companyGstin = data.receipt_gstin || '27AACE3859E1ZJ';
      const companyPhone = data.receipt_company_phone || '8591969394';
      const companyEmail = data.receipt_company_email || 'hello@selectt.in';
      const companyAddress = data.receipt_company_address || '906, 9th Floor, Techno IT Park, Near Eksar Metro, Link Road, Borivali West, Mumbai 400092';

      // Design Constants & Colors
      const TEAL = '#0D9488';
      const DARK_NAVY = '#0C1B33';
      const MUTED_LABEL = '#64748B';
      const DARK_TEXT = '#0F172A';
      const BORDER_LIGHT = '#E2E8F0';

      const startX = 30;
      const contentWidth = 535;

      // ==========================================
      // 1. HEADER — Clean professional corporate style
      // ==========================================
      let y = 28;

      // ── Top accent strip (teal bar, full width of content)
      const accentH = 5;
      doc.rect(startX, y, contentWidth, accentH).fill(TEAL);
      y += accentH;

      // ── White header area
      const headerHeight = 64;
      doc.rect(startX, y, contentWidth, headerHeight).fill('#FFFFFF');

      // ── Thin outer border around header
      doc.rect(startX, y, contentWidth, headerHeight).stroke(BORDER_LIGHT);

      // ── Left side: Selectt logo (dark-logo.svg rasterized)
      let logoPrintedW = 0;
      if (headerLogoBuffer) {
        try {
          const logoH = 34;
          doc.image(headerLogoBuffer, startX + 14, y + 15, { height: logoH });
          logoPrintedW = 130; // approximate rendered width
        } catch (_) {}
      }

      // If logo failed, fallback to company name text
      if (logoPrintedW === 0) {
        doc.font(FONT_BLD).fontSize(16).fillColor(TEAL).text('Selectt', startX + 14, y + 20);
        logoPrintedW = 80;
      }

      // ── Thin vertical divider between logo and right block
      const divX = startX + contentWidth - 190;
      doc.moveTo(divX, y + 12).lineTo(divX, y + headerHeight - 12).strokeColor(BORDER_LIGHT).lineWidth(0.8).stroke();

      // ── Right side: Receipt type label, booking no, date
      const rightBlockX = divX + 16;
      const rightBlockW = startX + contentWidth - rightBlockX - 12;

      // "BOOKING RECEIPT" label
      doc.font(FONT_BLD).fontSize(8).fillColor(TEAL)
        .text('BOOKING RECEIPT', rightBlockX, y + 14, { width: rightBlockW, align: 'right' });

      // Booking number
      doc.font(FONT_BLD).fontSize(13).fillColor(DARK_TEXT)
        .text(bookingNo, rightBlockX, y + 28, { width: rightBlockW, align: 'right' });

      // Date
      doc.font(FONT_REG).fontSize(7.5).fillColor(MUTED_LABEL)
        .text(formattedDate, rightBlockX, y + 48, { width: rightBlockW, align: 'right' });

      y += headerHeight;

      // ── Bottom info strip: company full name + PAN on light grey band
      const infoStripH = 20;
      doc.rect(startX, y, contentWidth, infoStripH).fill('#F8FAFC');
      doc.rect(startX, y, contentWidth, infoStripH).stroke(BORDER_LIGHT);

      doc.font(FONT_BLD).fontSize(8).fillColor(DARK_TEXT)
        .text(companyName, startX + 14, y + 6, { continued: true });
      doc.font(FONT_REG).fillColor(MUTED_LABEL)
        .text(`  •  ${companyGstin}  •  selectt.in`);

      y += infoStripH;

      // ==========================================
      // 2. DISCLAIMER BANNER (Orange Alert Bar)
      // ==========================================
      y += 10;
      const disclHeight = 24;
      doc.rect(startX, y, contentWidth, disclHeight).fill('#FFF8F0');
      // Left vertical accent bar
      doc.rect(startX, y, 4, disclHeight).fill('#EA580C');
      
      // Vector Warning Triangle icon
      const triX = startX + 14;
      const triY = y + 7;
      doc.polygon([triX + 4, triY], [triX + 8, triY + 9], [triX, triY + 9]).fill('#C2410C');

      doc.font(FONT_BLD).fontSize(7.5).fillColor('#9A3412').text(
        'This is a booking receipt only — NOT a final invoice. The final Bill of Supply will be issued at delivery.',
        startX + 27,
        y + 8
      );

      // ==========================================
      // 3. CUSTOMER SECTION
      // ==========================================
      y += disclHeight + 14;
      doc.font(FONT_BLD).fontSize(8.5).fillColor(TEAL).text('CUSTOMER', startX, y);

      y += 13;
      const col1LabelX = startX;
      const col1ValX = startX + 50;
      const col2LabelX = startX + 265;
      const rightMargin = startX + contentWidth;

      // Row 1: Name & Phone
      doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED_LABEL).text('Name', col1LabelX, y);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(DARK_TEXT).text(customerName, col1ValX, y);
      doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED_LABEL).text('Phone', col2LabelX, y);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(DARK_TEXT).text(customerPhone, col2LabelX + 50, y, { width: rightMargin - (col2LabelX + 50), align: 'right' });

      // Row 2: Email & City
      y += 18;
      doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED_LABEL).text('Email', col1LabelX, y);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(DARK_TEXT).text(customerEmail, col1ValX, y);
      doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED_LABEL).text('City', col2LabelX, y);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(DARK_TEXT).text(customerCity, col2LabelX + 50, y, { width: rightMargin - (col2LabelX + 50), align: 'right' });

      // Divider below customer
      y += 18;
      doc.moveTo(startX, y).lineTo(rightMargin, y).strokeColor(BORDER_LIGHT).lineWidth(0.6).stroke();

      // ==========================================
      // 4. VEHICLE SECTION
      // ==========================================
      y += 12;
      doc.font(FONT_BLD).fontSize(8.5).fillColor(TEAL).text('VEHICLE', startX, y);

      y += 12;
      // Vehicle Name & Specs (No image / badge - clean left alignment)
      doc.font(FONT_BLD).fontSize(11).fillColor(DARK_TEXT).text(carFullName, startX, y);
      doc.font(FONT_REG).fontSize(8).fillColor(MUTED_LABEL).text(`${carYear} • ${carTransmission} • ${carFuel}`, startX, y + 16);

      // Vehicle Details 2-Col Grid
      y += 34;
      doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED_LABEL).text('Reg. No.', col1LabelX, y);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(DARK_TEXT).text(carRegNo, col1ValX, y);
      
      doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED_LABEL).text('Colour', col2LabelX, y);
      // Dot + Colour text right-aligned without wrapping
      const colorText = carColor;
      doc.font(FONT_BLD).fontSize(8.5);
      const colorTextW = doc.widthOfString(colorText);
      const dotX = rightMargin - colorTextW - 9;
      doc.circle(dotX, y + 5.5, 3.2).fill('#1E293B');
      doc.fillColor(DARK_TEXT).text(colorText, rightMargin - colorTextW, y, { lineBreak: false });

      y += 18;
      doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED_LABEL).text('KMs Driven', col1LabelX, y);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(DARK_TEXT).text(`${carKm} km`, col1ValX, y);
      
      doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED_LABEL).text('Owner', col2LabelX, y);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(DARK_TEXT).text(carOwnership, col2LabelX + 50, y, { width: rightMargin - (col2LabelX + 50), align: 'right' });

      // Divider below vehicle
      y += 18;
      doc.moveTo(startX, y).lineTo(rightMargin, y).strokeColor(BORDER_LIGHT).lineWidth(0.6).stroke();

      // ==========================================
      // 5. PRICE BREAKUP TABLE
      // ==========================================
      y += 12;
      doc.font(FONT_BLD).fontSize(8.5).fillColor(TEAL).text('PRICE BREAKUP', startX, y);

      y += 12;
      const thHeight = 18;
      doc.rect(startX, y, contentWidth, thHeight).fill('#F8FAFC');
      doc.moveTo(startX, y).lineTo(rightMargin, y).strokeColor(BORDER_LIGHT).lineWidth(0.8).stroke();
      doc.moveTo(startX, y + thHeight).lineTo(rightMargin, y + thHeight).strokeColor(BORDER_LIGHT).lineWidth(0.8).stroke();

      // Table Header Titles
      const colItemX = startX + 8;
      const colMrpX = startX + 270;
      const colDiscX = startX + 375;
      const colAmtX = rightMargin - 8;

      doc.font(FONT_BLD).fontSize(7.5).fillColor(MUTED_LABEL).text('ITEM', colItemX, y + 5);
      doc.font(FONT_BLD).fontSize(7.5).fillColor(MUTED_LABEL).text('MRP', colMrpX - 40, y + 5, { width: 40, align: 'right' });
      doc.font(FONT_BLD).fontSize(7.5).fillColor(MUTED_LABEL).text('DISCOUNT', colDiscX - 70, y + 5, { width: 70, align: 'right' });
      doc.font(FONT_BLD).fontSize(7.5).fillColor(MUTED_LABEL).text('AMOUNT', colAmtX - 60, y + 5, { width: 60, align: 'right' });

      y += thHeight + 5;

      const renderTableRow = (itemText, mrpText, discText, amtText, isFree = false) => {
        doc.font(FONT_REG).fontSize(8).fillColor(DARK_TEXT).text(itemText, colItemX, y, { width: 200, ellipsis: true });
        doc.font(FONT_REG).fontSize(8).fillColor(DARK_TEXT).text(mrpText, colMrpX - 60, y, { width: 60, align: 'right' });
        doc.font(FONT_REG).fontSize(8).fillColor(DARK_TEXT).text(discText, colDiscX - 80, y, { width: 80, align: 'right' });
        if (isFree) {
          doc.font(FONT_BLD).fontSize(8).fillColor('#059669').text(amtText, colAmtX - 60, y, { width: 60, align: 'right' });
        } else {
          doc.font(FONT_REG).fontSize(8).fillColor(DARK_TEXT).text(amtText, colAmtX - 60, y, { width: 60, align: 'right' });
        }
        y += 16;
      };

      const formattedVehicleName = `Vehicle – ${carMake} ${carModel} ${carVariant}`.trim();
      renderTableRow(formattedVehicleName, `${CURRENCY}${vehicleMrp.toLocaleString('en-IN')}`, `${CURRENCY}${discountAmount.toLocaleString('en-IN')} (${discountPct}%)`, `${CURRENCY}${vehicleBasePrice.toLocaleString('en-IN')}`);
      renderTableRow('RC Transfer', `${CURRENCY}${rcTransferFee.toLocaleString('en-IN')}`, '—', `${CURRENCY}${rcTransferFee.toLocaleString('en-IN')}`);
      renderTableRow('Professional Detailing', `${CURRENCY}12,000`, '100%', 'FREE', true);
      renderTableRow('Standard Service', `${CURRENCY}18,000`, '100%', 'FREE', true);
      renderTableRow('Sun Visor', `${CURRENCY}900`, '100%', 'FREE', true);
      renderTableRow('Speaker (New)', `${CURRENCY}3,000`, '100%', 'FREE', true);
      renderTableRow('Car Delivery & Refueling', `${CURRENCY}${deliveryFee.toLocaleString('en-IN')}`, '—', `${CURRENCY}${deliveryFee.toLocaleString('en-IN')}`);

      // Subtotals
      y += 4;
      doc.font(FONT_REG).fontSize(8.5).fillColor(MUTED_LABEL).text('You save', colMrpX, y);
      doc.font(FONT_BLD).fontSize(8.5).fillColor('#0D9488').text(`${CURRENCY}${totalSavings.toLocaleString('en-IN')}`, colAmtX - 80, y, { width: 80, align: 'right' });

      y += 15;
      doc.moveTo(colMrpX, y).lineTo(rightMargin, y).strokeColor(DARK_TEXT).lineWidth(1).stroke();

      y += 7;
      doc.font(FONT_BLD).fontSize(10).fillColor(DARK_TEXT).text('Total Deal Value', colMrpX, y);
      doc.font(FONT_BLD).fontSize(10).fillColor(DARK_TEXT).text(`${CURRENCY}${totalDealValue.toLocaleString('en-IN')}`, colAmtX - 100, y, { width: 100, align: 'right' });

      // ==========================================
      // 6. PAYMENT HIGHLIGHT CARDS
      // ==========================================
      y += 20;

      // Card 1: Booking Amount Received (Light Green Card)
      const payCardH = 42;
      doc.roundedRect(startX, y, contentWidth, payCardH, 6).fill('#ECFDF5');
      doc.font(FONT_BLD).fontSize(10).fillColor('#065F46').text('Booking Amount Received', startX + 14, y + 8);
      doc.font(FONT_REG).fontSize(8).fillColor('#047857').text(`UPI • Txn ID ${txnId}`, startX + 14, y + 24);
      doc.font(FONT_BLD).fontSize(16).fillColor('#059669').text(`${CURRENCY}${bookingAmount.toLocaleString('en-IN')}`, rightMargin - 150, y + 11, { width: 136, align: 'right' });

      // Card 2: Balance Payable at Delivery (Light Slate Card)
      y += payCardH + 9;
      const balCardH = 34;
      doc.roundedRect(startX, y, contentWidth, balCardH, 6).fill('#F8FAFC');
      doc.font(FONT_BLD).fontSize(9.5).fillColor(DARK_TEXT).text('Balance Payable at Delivery', startX + 14, y + 10);
      doc.font(FONT_BLD).fontSize(12).fillColor(DARK_TEXT).text(`${CURRENCY}${balancePayable.toLocaleString('en-IN')}`, rightMargin - 150, y + 9, { width: 136, align: 'right' });

      // ==========================================
      // 7. TERMS & CONDITIONS
      // ==========================================
      y += balCardH + 18;
      doc.font(FONT_BLD).fontSize(8.5).fillColor(TEAL).text('TERMS & CONDITIONS', startX, y);

      y += 12;
      const terms = [
        '1. Vehicle sold on "As Is Where Is" basis after purchaser\'s inspection and acceptance.',
        '2. Ownership transfer, insurance, and statutory compliance are the purchaser\'s responsibility post-delivery.',
        '3. All liabilities, penalties, challans, or claims after delivery shall be borne by the purchaser.',
        '4. Goods/Vehicle once sold will not be returned, exchanged, or refunded.',
        '5. Subject to Mumbai Jurisdiction only.'
      ];

      doc.font(FONT_REG).fontSize(7.5).fillColor('#475569');
      terms.forEach(t => {
        doc.text(t, startX, y);
        y += 14;
      });

      // ==========================================
      // 8. FOOTER: BANK & CONTACT DETAILS
      // ==========================================
      y += 8;
      doc.moveTo(startX, y).lineTo(rightMargin, y).strokeColor(BORDER_LIGHT).lineWidth(0.8).stroke();

      y += 12;
      doc.font(FONT_BLD).fontSize(7.5).fillColor(DARK_TEXT).text('Bank: ', startX, y, { continued: true });
      doc.font(FONT_REG).fillColor('#475569').text('Selectt Mobility • IndusInd Bank, IC Colony Borivali | A/c 257878785288 • IFSC INDB0002144 • UPI 7878785288-7@ybl');

      y += 16;
      doc.font(FONT_BLD).fontSize(7.5).fillColor(DARK_TEXT).text('Contact: ', startX, y, { continued: true });
      doc.font(FONT_REG).fillColor('#475569').text(`${companyPhone} • ${companyEmail}`);

      y += 14;
      doc.font(FONT_REG).fontSize(7).fillColor('#94A3B8').text(companyAddress, startX, y);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateBookingReceiptPdf, getImageBuffer };
