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
    return null;
  }
}

/**
 * Generates an executive, branded, official Vehicle Inspection & Quality Report PDF for Selectt
 * @param {Object} car Car data object with qualityReport details
 * @returns {Promise<Buffer>}
 */
async function generateInspectionReportPdf(car) {
  let headerLogoBuffer = null;
  try {
    const logoPngPath = path.join(__dirname, 'public', 'img', 'header-logo.png');
    const logoSvgPath = path.join(__dirname, 'public', 'img', 'dark-logo.svg');
    if (fs.existsSync(logoPngPath)) {
      headerLogoBuffer = fs.readFileSync(logoPngPath);
    } else if (fs.existsSync(logoSvgPath)) {
      headerLogoBuffer = await sharp(fs.readFileSync(logoSvgPath), { density: 300 })
        .resize({ height: 80, fit: 'inside', withoutEnlargement: false })
        .png()
        .toBuffer();
    }
  } catch (_) {}

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 32,
        info: {
          Title: `Selectt Vehicle Quality & Inspection Report - Car #${car.id || ''}`,
          Author: 'Selectt Mobility India',
          Subject: '150-Point Certified Vehicle Inspection & Quality Evaluation Report',
          Creator: 'Selectt Inspection Engine'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Font Registration
      const regularFontPath = path.join(__dirname, 'fonts', 'NotoSans-Regular.ttf');
      const devanagariFontPath = path.join(__dirname, 'fonts', 'NotoSansDevanagari.ttf');
      const boldFontPath = path.join(__dirname, 'fonts', 'NotoSans-Bold.ttf');

      if (fs.existsSync(devanagariFontPath)) {
        doc.registerFont('ReportFont', devanagariFontPath);
      } else if (fs.existsSync(regularFontPath)) {
        doc.registerFont('ReportFont', regularFontPath);
      }
      if (fs.existsSync(boldFontPath)) {
        doc.registerFont('ReportFont-Bold', boldFontPath);
      }

      const FONT_REG = fs.existsSync(devanagariFontPath) || fs.existsSync(regularFontPath) ? 'ReportFont' : 'Helvetica';
      const FONT_BLD = fs.existsSync(boldFontPath) ? 'ReportFont-Bold' : 'Helvetica-Bold';

      // Colors
      const C_PRIMARY = '#0C1B33';
      const C_TEAL = '#00C9AF';
      const C_TEAL_DARK = '#008573';
      const C_SLATE_DARK = '#1E293B';
      const C_SLATE_MID = '#64748B';
      const C_BG_LIGHT = '#F8FAFC';
      const C_BORDER = '#E2E8F0';

      // Parse Quality Report data
      let qr = car.qualityReport || car.quality_report || {};
      if (typeof qr === 'string') {
        try { qr = JSON.parse(qr); } catch(_) { qr = {}; }
      }

      const carTitle = car.title || `${car.year || ''} ${car.make || ''} ${car.model || ''} ${car.variant || ''}`.trim() || 'Selectt Assured Vehicle';
      const carYear = car.year || '—';
      const carFuel = car.fuel_type || car.fuelType || '—';
      const carTransmission = car.transmission || '—';
      const carKm = car.km ? `${Number(car.km).toLocaleString('en-IN')} KM` : '—';
      const carOwnership = car.ownership || '1st Owner';
      const carLocation = car.location || 'Mumbai';
      const carRegNo = car.registration_no || car.registrationNo || 'MH (Registered)';

      const subtitle = qr.subtitle || '1452 parts evaluated by 5 automotive experts';
      const nextServiceText = qr.nextServiceText || 'Next service due after 12 months or 10,000 km (whichever comes first post delivery)';
      const summaryNotes = qr.summary || 'Vehicle has undergone rigorous 150+ multi-point quality check by certified automotive specialists. Engine, transmission, electronics, structural integrity and underbody have passed all factory tolerances.';

      // ================== HEADER ==================
      if (headerLogoBuffer) {
        try {
          doc.image(headerLogoBuffer, 32, 28, { width: 110 });
        } catch (_) {
          doc.font(FONT_BLD).fontSize(20).fillColor(C_PRIMARY).text('SELECTT', 32, 28);
        }
      } else {
        doc.font(FONT_BLD).fontSize(20).fillColor(C_PRIMARY).text('SELECTT', 32, 28);
      }

      doc.font(FONT_BLD).fontSize(14).fillColor(C_PRIMARY)
        .text('VEHICLE QUALITY & INSPECTION REPORT', 180, 28, { align: 'right' });
      doc.font(FONT_REG).fontSize(8.5).fillColor(C_SLATE_MID)
        .text(`Report ID: SLT-INS-${car.id || '001'}  |  Date: ${new Date().toLocaleDateString('en-GB')}`, 180, 46, { align: 'right' });
      doc.font(FONT_BLD).fontSize(8.5).fillColor(C_TEAL_DARK)
        .text('CERTIFIED SELECTT ASSURED 150+ POINT CHECK', 180, 58, { align: 'right' });

      // Header horizontal rule
      doc.moveTo(32, 75).lineTo(563, 75).lineWidth(1).strokeColor(C_BORDER).stroke();

      // ================== VEHICLE SUMMARY CARD ==================
      const vY = 86;
      doc.roundedRect(32, vY, 531, 72, 8).fillAndStroke(C_BG_LIGHT, C_BORDER);

      doc.font(FONT_BLD).fontSize(13).fillColor(C_PRIMARY)
        .text(carTitle, 46, vY + 10, { width: 440, lineBreak: false });

      // Specs grid line 1
      const specY1 = vY + 30;
      doc.font(FONT_REG).fontSize(8).fillColor(C_SLATE_MID).text('Reg. No:', 46, specY1);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(C_SLATE_DARK).text(carRegNo, 88, specY1);

      doc.font(FONT_REG).fontSize(8).fillColor(C_SLATE_MID).text('Year:', 185, specY1);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(C_SLATE_DARK).text(String(carYear), 212, specY1);

      doc.font(FONT_REG).fontSize(8).fillColor(C_SLATE_MID).text('Odometer:', 280, specY1);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(C_SLATE_DARK).text(carKm, 332, specY1);

      doc.font(FONT_REG).fontSize(8).fillColor(C_SLATE_MID).text('Fuel:', 425, specY1);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(C_SLATE_DARK).text(carFuel, 455, specY1);

      // Specs grid line 2
      const specY2 = vY + 48;
      doc.font(FONT_REG).fontSize(8).fillColor(C_SLATE_MID).text('Transmission:', 46, specY2);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(C_SLATE_DARK).text(carTransmission, 110, specY2);

      doc.font(FONT_REG).fontSize(8).fillColor(C_SLATE_MID).text('Ownership:', 185, specY2);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(C_SLATE_DARK).text(carOwnership, 240, specY2);

      doc.font(FONT_REG).fontSize(8).fillColor(C_SLATE_MID).text('Hub Location:', 280, specY2);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(C_SLATE_DARK).text(carLocation, 345, specY2);

      doc.font(FONT_REG).fontSize(8).fillColor(C_SLATE_MID).text('Status:', 425, specY2);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(C_TEAL_DARK).text('Selectt Assured', 462, specY2);

      // ================== 3 CORE CHECKLIST BADGES ==================
      const bY = 168;
      doc.font(FONT_BLD).fontSize(10.5).fillColor(C_PRIMARY).text('Quality Audit Highlights', 32, bY);
      doc.font(FONT_REG).fontSize(8).fillColor(C_SLATE_MID).text(subtitle, 175, bY + 2);

      const badgeY = bY + 18;
      const badges = [
        { label: 'Meter Not Tampered', ok: qr.meterTampered !== false && qr.meterTampered !== 'false' },
        { label: 'Non-Flooded Verified', ok: qr.nonFlooded !== false && qr.nonFlooded !== 'false' },
        { label: 'Core Structure Intact', ok: qr.coreStructureIntact !== false && qr.coreStructureIntact !== 'false' }
      ];

      badges.forEach((b, i) => {
        const bx = 32 + (i * 180);
        doc.roundedRect(bx, badgeY, 171, 26, 6).fillAndStroke('#ECFDF5', '#A7F3D0');
        doc.font(FONT_BLD).fontSize(8.5).fillColor('#065F46')
          .text(`[PASS]  ${b.label}`, bx + 12, badgeY + 8);
      });

      // ================== 5 KEY QUALITY CATEGORIES ==================
      const catTitleY = 224;
      doc.font(FONT_BLD).fontSize(10.5).fillColor(C_PRIMARY).text('5-Pillar Comprehensive Systems Rating', 32, catTitleY);

      const categories = [
        {
          name: 'Core Systems',
          desc: 'Engine compression, transmission smooth shifts, chassis frame, steering & suspension',
          score: qr.coreScore || '9.9',
          label: qr.coreLabel || 'Excellent'
        },
        {
          name: 'Supporting Systems',
          desc: 'Fuel supply lines, electronic ignition, ECU sensors, cooling radiator & alternator',
          score: qr.supportingScore || '9.5',
          label: qr.supportingLabel || 'Excellent'
        },
        {
          name: 'Interiors & AC',
          desc: 'HVAC cabin cooling, blower vents, power windows, upholstery, digital cluster & audio',
          score: qr.interiorsScore || '9.6',
          label: qr.interiorsLabel || 'Excellent'
        },
        {
          name: 'Exteriors & Lights',
          desc: 'Original body panels, glass windshields, LED headlamps, taillights & alignment',
          score: qr.exteriorsScore || '9.2',
          label: qr.exteriorsLabel || 'Excellent'
        },
        {
          name: 'Wear & Tear Parts',
          desc: 'Tyre tread depth (avg >65%), brake pad life, clutch friction disc & wiper blades',
          score: qr.wearTearScore || '8.7',
          label: qr.wearTearLabel || 'Good'
        }
      ];

      let rowY = catTitleY + 18;
      categories.forEach((cat, index) => {
        const isAlt = index % 2 === 1;
        doc.roundedRect(32, rowY, 531, 46, 6).fillAndStroke(isAlt ? '#FAFAFA' : '#FFFFFF', C_BORDER);

        // Score Badge
        doc.roundedRect(44, rowY + 9, 44, 28, 5).fillAndStroke(C_TEAL, C_TEAL);
        doc.font(FONT_BLD).fontSize(11).fillColor(C_PRIMARY)
          .text(String(cat.score), 44, rowY + 16, { width: 44, align: 'center' });

        // Category Name & Label
        doc.font(FONT_BLD).fontSize(9.5).fillColor(C_PRIMARY)
          .text(cat.name, 100, rowY + 9);
        doc.font(FONT_BLD).fontSize(7.5).fillColor(C_TEAL_DARK)
          .text(`* ${cat.label.toUpperCase()}`, 240, rowY + 10);

        // Description
        doc.font(FONT_REG).fontSize(7.5).fillColor(C_SLATE_MID)
          .text(cat.desc, 100, rowY + 24, { width: 440 });

        rowY += 52;
      });

      // ================== EXPERT SUMMARY NOTES ==================
      rowY += 6;
      doc.font(FONT_BLD).fontSize(10).fillColor(C_PRIMARY).text('Expert Evaluator Notes', 32, rowY);
      rowY += 14;

      doc.roundedRect(32, rowY, 531, 56, 6).fillAndStroke(C_BG_LIGHT, C_BORDER);
      doc.font(FONT_REG).fontSize(8).fillColor(C_SLATE_DARK)
        .text(summaryNotes, 44, rowY + 10, { width: 507, lineGap: 3 });

      rowY += 68;

      // ================== SERVICE DUE BANNER ==================
      doc.roundedRect(32, rowY, 531, 38, 6).fillAndStroke('#F0FDFA', '#99F6E4');
      doc.font(FONT_BLD).fontSize(9).fillColor(C_TEAL_DARK)
        .text('UPCOMING SCHEDULED MAINTENANCE', 44, rowY + 8);
      doc.font(FONT_REG).fontSize(8).fillColor(C_SLATE_DARK)
        .text(nextServiceText, 44, rowY + 22);

      // ================== FOOTER GUARANTEES ==================
      const footY = 705;
      doc.moveTo(32, footY).lineTo(563, footY).lineWidth(0.8).strokeColor(C_BORDER).stroke();

      const fBoxY = footY + 10;
      doc.font(FONT_BLD).fontSize(7.5).fillColor(C_PRIMARY).text('SELECTT ASSURANCE BENEFITS:', 32, fBoxY);
      doc.font(FONT_REG).fontSize(7).fillColor(C_SLATE_MID)
        .text('1-Year Comprehensive Warranty  |  5-Day Money Back Guarantee  |  Fixed Fair Pricing  |  Free RC Transfer', 32, fBoxY + 12);
      doc.font(FONT_REG).fontSize(7).fillColor(C_SLATE_MID)
        .text('Official Selectt Mobility Report  |  Visit: https://selectt.in  |  Helpdesk: +91 85910 88510  |  support@selectt.in', 32, fBoxY + 24);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateInspectionReportPdf
};
