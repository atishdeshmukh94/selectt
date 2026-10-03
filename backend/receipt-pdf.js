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
 * Generates a clean, modern, informative PDF booking receipt for Selectt Cars
 * @param {Object} data Booking and car details + receipt settings
 * @returns {Promise<Buffer>}
 */
async function generateBookingReceiptPdf(data) {
  let logoBuffer = null;
  let signatureBuffer = null;

  const logoUrl = data.receipt_logo_url || 'https://selectt.in/img/dark-logo.svg';
  logoBuffer = await getImageBuffer(logoUrl);

  // If remote logo fails, fallback to local logo if present
  if (!logoBuffer) {
    const localLogo = path.join(__dirname, 'public', 'img', 'dark-logo.svg');
    if (fs.existsSync(localLogo)) {
      logoBuffer = await getImageBuffer(localLogo);
    }
  }

  if (data.receipt_signature_url) {
    signatureBuffer = await getImageBuffer(data.receipt_signature_url);
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Booking Receipt - ${data.booking_no || 'Selectt'}`,
          Author: data.receipt_company_name || 'Selectt Cars India',
          Subject: 'Payment Confirmation & Vehicle Reservation Receipt',
          Creator: 'Selectt Platform'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Font Registration for Indian Rupee Symbol (₹) and Unicode
      const devanagariFontPath = path.join(__dirname, 'fonts', 'NotoSansDevanagari.ttf');
      const regularFontPath = path.join(__dirname, 'fonts', 'NotoSans-Regular.ttf');
      const boldFontPath = path.join(__dirname, 'fonts', 'NotoSans-Bold.ttf');

      const hasDevFont = fs.existsSync(devanagariFontPath);
      const hasCustomFonts = fs.existsSync(regularFontPath) && fs.existsSync(boldFontPath);

      if (hasDevFont) {
        doc.registerFont('ReceiptFont', devanagariFontPath);
        doc.registerFont('ReceiptFont-Bold', devanagariFontPath);
      } else if (hasCustomFonts) {
        doc.registerFont('ReceiptFont', regularFontPath);
        doc.registerFont('ReceiptFont-Bold', boldFontPath);
      }

      const FONT_REG = (hasDevFont || hasCustomFonts) ? 'ReceiptFont' : 'Helvetica';
      const FONT_BLD = (hasDevFont || hasCustomFonts) ? 'ReceiptFont-Bold' : 'Helvetica-Bold';
      const CURRENCY = hasDevFont ? '₹' : 'Rs. ';

      const customerName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Valued Customer';
      const carTitle = `${data.year || ''} ${data.make || ''} ${data.model || ''} ${data.variant || ''}`.trim() || 'Reserved Vehicle';
      const carUrl = `https://selectt.in/car/${data.car_id || ''}`;
      const bookingAmount = Number(data.booking_amount || 0);
      const totalPrice = Number(data.final_amount || data.price || data.car_price || 0);
      const remainingBalance = Math.max(0, totalPrice - bookingAmount);
      const formattedDate = new Date(data.created_at || Date.now()).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Dynamic Settings with defaults
      const companyName = data.receipt_company_name || 'Selectt Cars India Private Limited';
      const companyPhone = data.receipt_company_phone || '+91 85746 67466';
      const companyEmail = data.receipt_company_email || 'hello@selectt.in';
      const companyWebsite = data.receipt_company_website || 'https://selectt.in';
      const companyAddress = data.receipt_company_address || 'Selectt Experience Hub, Andheri East, Mumbai, Maharashtra 400069';
      const gstin = data.receipt_gstin || '';
      const receiptTitle = (data.receipt_title || 'Payment Receipt').toUpperCase();
      const receiptSubtitle = data.receipt_subtitle || 'PRE-OWNED CARS • ASSURED QUALITY';
      const guaranteeText = data.receipt_guarantee_text || `This token booking advance of ${CURRENCY}${bookingAmount.toLocaleString('en-IN')} is 100% refundable anytime prior to vehicle handover, plus backed by our 5-Day Money-Back Guarantee and 200-Point Quality Inspection.`;
      const footerNote = data.receipt_footer_note || '*All warranties start from the date of physical vehicle handover. Verified Selectt Assured certified inventory.';
      const signatoryName = data.receipt_signatory_name || 'Authorized Signatory';
      const signatoryTitle = data.receipt_signatory_title || 'Selectt Fulfillment & Operations';
      const showDigitalStamp = data.receipt_show_digital_stamp !== 'false';

      // Brand Colors
      const TEAL = '#00C9AF';
      const DARK_TEAL = '#008F7C';
      const NAVY = '#0C1B33';
      const SLATE = '#475569';
      const LIGHT_BG = '#F8FAFC';
      const BORDER_COLOR = '#E2E8F0';

      // Top decorative brand bar
      doc.rect(40, 40, 515, 6).fill(TEAL);

      // Header row
      let y = 58;

      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 40, y, { fit: [140, 36] });
          doc.font(FONT_BLD).fontSize(10.5).fillColor(NAVY).text(companyName, 40, y + 40);
          doc.font(FONT_REG).fontSize(8.5).fillColor(SLATE).text(receiptSubtitle, 40, y + 54);
        } catch (_) {
          doc.font(FONT_BLD).fontSize(22).fillColor(NAVY).text('Selectt', 40, y, { continued: true });
          doc.fillColor(TEAL).text('.');
          doc.font(FONT_REG).fontSize(8.5).fillColor(SLATE).text(receiptSubtitle, 40, y + 26);
        }
      } else {
        doc.font(FONT_BLD).fontSize(22).fillColor(NAVY).text('Selectt', 40, y, { continued: true });
        doc.fillColor(TEAL).text('.');
        doc.font(FONT_BLD).fontSize(10).fillColor(NAVY).text(companyName, 40, y + 26);
        doc.font(FONT_REG).fontSize(8.5).fillColor(SLATE).text(receiptSubtitle, 40, y + 40);
      }

      // Right Side: Receipt Title & Number
      doc.font(FONT_BLD).fontSize(15).fillColor(NAVY).text(receiptTitle, 300, y, { align: 'right', width: 255 });
      doc.font(FONT_BLD).fontSize(11).fillColor(DARK_TEAL).text(`#${data.booking_no || 'BK-CONFIRMED'}`, 300, y + 20, { align: 'right', width: 255 });
      doc.font(FONT_REG).fontSize(8.5).fillColor(SLATE).text(`Date: ${formattedDate}`, 300, y + 35, { align: 'right', width: 255 });

      // Horizontal Divider
      y = 125;
      doc.moveTo(40, y).lineTo(555, y).strokeColor(BORDER_COLOR).lineWidth(1).stroke();

      // Status Badge
      y = 135;
      doc.roundedRect(40, y, 140, 22, 11).fill('#ECFDF5');
      doc.roundedRect(40, y, 140, 22, 11).strokeColor('#A7F3D0').lineWidth(1).stroke();
      doc.font(FONT_BLD).fontSize(8.5).fillColor('#047857').text('PAYMENT CONFIRMED', 45, y + 6, { width: 130, align: 'center' });

      // 2 Column Info Cards
      y = 168;
      const colWidth = 250;
      const leftColX = 40;
      const rightColX = 305;
      const cardHeight = 110;

      // Left Box: Customer Details
      doc.roundedRect(leftColX, y, colWidth, cardHeight, 8).fill(LIGHT_BG);
      doc.roundedRect(leftColX, y, colWidth, cardHeight, 8).strokeColor(BORDER_COLOR).lineWidth(1).stroke();

      doc.font(FONT_BLD).fontSize(8.5).fillColor(SLATE).text('CUSTOMER DETAILS', leftColX + 14, y + 12);
      doc.font(FONT_BLD).fontSize(11.5).fillColor(NAVY).text(customerName, leftColX + 14, y + 26, { width: colWidth - 28 });
      doc.font(FONT_REG).fontSize(9).fillColor(SLATE).text(`Phone: +${data.phone || 'N/A'}`, leftColX + 14, y + 44);
      doc.font(FONT_REG).fontSize(9).fillColor(SLATE).text(`Email: ${data.email || 'N/A'}`, leftColX + 14, y + 58);
      doc.font(FONT_REG).fontSize(8.5).fillColor(SLATE).text(`Location: ${data.city || 'Mumbai, India'}`, leftColX + 14, y + 72);

      // Right Box: Transaction & Payment Details
      doc.roundedRect(rightColX, y, colWidth, cardHeight, 8).fill(LIGHT_BG);
      doc.roundedRect(rightColX, y, colWidth, cardHeight, 8).strokeColor(BORDER_COLOR).lineWidth(1).stroke();

      doc.font(FONT_BLD).fontSize(8.5).fillColor(SLATE).text('TRANSACTION SUMMARY', rightColX + 14, y + 12);
      doc.font(FONT_BLD).fontSize(15).fillColor('#047857').text(`${CURRENCY}${bookingAmount.toLocaleString('en-IN')}`, rightColX + 14, y + 26);
      doc.font(FONT_REG).fontSize(8.5).fillColor(SLATE).text('Token Booking Advance (Paid Online)', rightColX + 14, y + 44);
      doc.font(FONT_REG).fontSize(8.5).fillColor(NAVY).text(`Transaction ID: `, rightColX + 14, y + 59, { continued: true });
      doc.font(FONT_BLD).text(data.razorpay_payment_id || 'pay_verified');
      doc.font(FONT_REG).fontSize(8.5).fillColor(SLATE).text(`Payment Method: Online (Razorpay Verified)`, rightColX + 14, y + 73);

      // Car Details Section
      y = 290;
      doc.roundedRect(40, y, 515, 88, 8).fill('#F0FDF4');
      doc.roundedRect(40, y, 515, 88, 8).strokeColor('#BBF7D0').lineWidth(1).stroke();

      doc.font(FONT_BLD).fontSize(8.5).fillColor('#166534').text('RESERVED VEHICLE', 54, y + 10);
      doc.font(FONT_BLD).fontSize(13.5).fillColor(NAVY).text(carTitle, 54, y + 24, { width: 490 });

      const carSpecs = [
        data.km || data.km_driven ? `${Number(data.km || data.km_driven).toLocaleString('en-IN')} KM` : null,
        data.fuel_type || 'Petrol',
        data.transmission || 'Manual'
      ].filter(Boolean).join(' • ');

      doc.font(FONT_REG).fontSize(9).fillColor(SLATE).text(carSpecs, 54, y + 41);

      // Car Web Link
      doc.font(FONT_REG).fontSize(8.5).fillColor(SLATE).text('View vehicle on website: ', 54, y + 58, { continued: true });
      doc.font(FONT_BLD).fillColor(DARK_TEAL).text(carUrl, { link: carUrl, underline: true });

      // Financial Breakdown Table
      y = 390;
      doc.font(FONT_BLD).fontSize(10.5).fillColor(NAVY).text('FINANCIAL BREAKDOWN', 40, y);

      y = 408;
      const tableW = 515;
      doc.roundedRect(40, y, tableW, 105, 8).fill(LIGHT_BG);
      doc.roundedRect(40, y, tableW, 105, 8).strokeColor(BORDER_COLOR).lineWidth(1).stroke();

      // Row 1: On-road Price
      let rowY = y + 11;
      doc.font(FONT_REG).fontSize(9.5).fillColor(NAVY).text('Total Vehicle On-Road Price', 54, rowY);
      doc.font(FONT_BLD).fontSize(9.5).fillColor(NAVY).text(`${CURRENCY}${totalPrice.toLocaleString('en-IN')}`, 400, rowY, { align: 'right', width: 140 });

      // Line
      rowY += 21;
      doc.moveTo(54, rowY).lineTo(540, rowY).strokeColor(BORDER_COLOR).lineWidth(0.8).stroke();

      // Row 2: Token Paid
      rowY += 9;
      doc.font(FONT_BLD).fontSize(10).fillColor('#047857').text('Token Booking Advance (Paid Online)', 54, rowY);
      doc.font(FONT_BLD).fontSize(10.5).fillColor('#047857').text(`- ${CURRENCY}${bookingAmount.toLocaleString('en-IN')}`, 400, rowY, { align: 'right', width: 140 });

      // Line
      rowY += 21;
      doc.moveTo(54, rowY).lineTo(540, rowY).strokeColor(BORDER_COLOR).lineWidth(0.8).stroke();

      // Row 3: Remaining Balance
      rowY += 9;
      doc.font(FONT_BLD).fontSize(10).fillColor(NAVY).text('Remaining Balance Due at Handover', 54, rowY);
      doc.font(FONT_BLD).fontSize(10.5).fillColor(NAVY).text(`${CURRENCY}${remainingBalance.toLocaleString('en-IN')}`, 400, rowY, { align: 'right', width: 140 });

      // Selectt Guarantee Box
      y = 525;
      doc.roundedRect(40, y, 515, 68, 8).fill('#F0FDFA');
      doc.roundedRect(40, y, 515, 68, 8).strokeColor('#CCFBF1').lineWidth(1).stroke();

      doc.font(FONT_BLD).fontSize(9).fillColor('#0F766E').text('SELECTT ASSURED® 100% REFUNDABLE PROMISE', 54, y + 10);
      doc.font(FONT_REG).fontSize(8.5).fillColor('#115E59').text(
        guaranteeText,
        54,
        y + 24,
        { lineGap: 2.5, width: 485 }
      );

      // Contact & Company Details
      y = 605;
      doc.font(FONT_BLD).fontSize(9).fillColor(NAVY).text('COMPANY & SUPPORT INFORMATION', 40, y);
      doc.font(FONT_REG).fontSize(8.5).fillColor(SLATE).text(
        `${companyName}\n` +
        `Phone: ${companyPhone}   |   Email: ${companyEmail}   |   Website: ${companyWebsite}\n` +
        `Registered Office: ${companyAddress}${gstin ? `   |   GSTIN: ${gstin}` : ''}`,
        40,
        y + 14,
        { lineGap: 2, width: 330 }
      );

      // Signatory Box on Right
      const sigBoxX = 390;
      const sigBoxY = 605;

      if (signatureBuffer) {
        try {
          doc.image(signatureBuffer, sigBoxX, sigBoxY, { fit: [120, 32] });
        } catch (_) {}
      } else if (showDigitalStamp) {
        doc.roundedRect(sigBoxX, sigBoxY, 130, 20, 5).fill('#F0FDFA');
        doc.roundedRect(sigBoxX, sigBoxY, 130, 20, 5).strokeColor('#99F6E4').lineWidth(0.8).stroke();
        doc.font(FONT_BLD).fontSize(8).fillColor(DARK_TEAL).text('DIGITALLY VERIFIED', sigBoxX, sigBoxY + 5, { align: 'center', width: 130 });
      }

      doc.font(FONT_BLD).fontSize(9).fillColor(NAVY).text(signatoryName, sigBoxX, sigBoxY + 36, { width: 165 });
      doc.font(FONT_REG).fontSize(7.5).fillColor(SLATE).text(signatoryTitle, sigBoxX, sigBoxY + 48, { width: 165 });

      // Footer
      y = 735;
      doc.moveTo(40, y).lineTo(555, y).strokeColor(BORDER_COLOR).lineWidth(0.8).stroke();
      doc.font(FONT_REG).fontSize(7.5).fillColor('#94A3B8').text(
        footerNote,
        40,
        y + 8,
        { align: 'center', width: 515 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateBookingReceiptPdf, getImageBuffer };
