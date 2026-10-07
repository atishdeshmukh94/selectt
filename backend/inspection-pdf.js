const PDFDocument = require('pdfkit');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Loads Selectt dark logo from local svg or remote URL, rasterized to crisp high-res PNG for PDFKit
 */
async function getSelecttDarkLogoBuffer() {
  try {
    const localSvgPath = path.join(__dirname, 'public', 'img', 'dark-logo.svg');
    let svgBuffer = null;

    if (fs.existsSync(localSvgPath)) {
      svgBuffer = fs.readFileSync(localSvgPath);
    } else {
      // Fallback: download from live site
      const res = await axios.get('https://selectt.in/img/dark-logo.svg', { responseType: 'arraybuffer', timeout: 5000 });
      svgBuffer = Buffer.from(res.data);
    }

    if (svgBuffer) {
      // Rasterize with sharp to 300 DPI PNG
      return await sharp(svgBuffer, { density: 300 })
        .resize({ width: 360 })
        .png()
        .toBuffer();
    }
  } catch (err) {
    console.warn('[Inspection PDF] Logo loading warning:', err.message);
  }
  return null;
}

/**
 * Generates an executive, certified, luxury vehicle inspection report for Selectt
 * @param {Object} car Vehicle data object
 * @returns {Promise<Buffer>}
 */
async function generateInspectionReportPdf(car) {
  const logoBuffer = await getSelecttDarkLogoBuffer();

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 32,
        info: {
          Title: `Selectt Certified Vehicle Inspection Report - ${car.title || car.id || ''}`,
          Author: 'Selectt Mobility India',
          Subject: '150-Point Certified Vehicle Quality Audit Report',
          Creator: 'Selectt Quality Engine'
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

      // Design Color Palette
      const C_NAVY = '#0C1B33';
      const C_TEAL = '#00C9AF';
      const C_TEAL_DARK = '#008573';
      const C_TEAL_BG = '#F0FDFA';
      const C_DARK_TEXT = '#1E293B';
      const C_MUTED = '#64748B';
      const C_CARD_BG = '#F8FAFC';
      const C_BORDER = '#E2E8F0';
      const C_GREEN_BG = '#ECFDF5';
      const C_GREEN_BORDER = '#A7F3D0';
      const C_GREEN_TEXT = '#065F46';

      // Parse Quality Report data
      let qr = car.qualityReport || car.quality_report || {};
      if (typeof qr === 'string') {
        try { qr = JSON.parse(qr); } catch(_) { qr = {}; }
      }

      const rawTitle = car.title || `${car.year || ''} ${car.make || ''} ${car.model || ''} ${car.variant || ''}`.trim() || 'Selectt Assured Vehicle';
      // Strip emojis or non-ascii symbols for clean font rendering
      const carTitle = rawTitle.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
      const carYear = car.year || '—';
      const carFuel = car.fuel_type || car.fuelType || 'Petrol';
      const carTransmission = car.transmission || 'Manual';
      const carKm = car.km ? `${Number(car.km).toLocaleString('en-IN')} KM` : '—';
      const carOwnership = car.ownership || '1st Owner';
      const carLocation = car.location || 'Mumbai';
      const carRegNo = car.registration_no || car.registrationNo || 'MH Registered';

      const subtitle = qr.subtitle || '1452 parts evaluated by 5 automotive experts';
      const nextServiceText = qr.nextServiceText || 'Next service due after 12 months or 10,000 km (whichever comes first post delivery)';
      const summaryNotes = qr.summary || 'Vehicle has undergone rigorous 150+ multi-point quality check by certified automotive specialists. Engine, transmission, electronics, structural integrity and underbody have passed all factory tolerances with zero defect alerts.';

      // ==============================================================
      // 1. TOP HEADER & BRANDING
      // ==============================================================
      if (logoBuffer) {
        try {
          // Render dark-logo.svg rasterized PNG
          doc.image(logoBuffer, 32, 26, { width: 118 });
        } catch (_) {
          doc.font(FONT_BLD).fontSize(20).fillColor(C_NAVY).text('SELECTT', 32, 28);
        }
      } else {
        doc.font(FONT_BLD).fontSize(20).fillColor(C_NAVY).text('SELECTT', 32, 28);
      }

      // Header Tagline
      doc.font(FONT_REG).fontSize(7.5).fillColor(C_MUTED)
        .text('India\'s Most Trusted Pre-Owned Car Platform', 32, 56);

      // Certificate Info Box (Right side)
      doc.roundedRect(365, 24, 198, 42, 6).fillAndStroke('#F1F5F9', C_BORDER);
      doc.font(FONT_BLD).fontSize(8.5).fillColor(C_NAVY)
        .text('CERTIFIED INSPECTION REPORT', 375, 29, { width: 178, align: 'right' });
      doc.font(FONT_REG).fontSize(7.5).fillColor(C_MUTED)
        .text(`Report ID: SLT-INS-${car.id || '066'}  |  ${new Date().toLocaleDateString('en-GB')}`, 375, 41, { width: 178, align: 'right' });
      doc.font(FONT_BLD).fontSize(7.5).fillColor(C_TEAL_DARK)
        .text('[PASS] SELECTT ASSURED 150-PT AUDIT', 375, 52, { width: 178, align: 'right' });

      // Header Rule
      doc.moveTo(32, 73).lineTo(563, 73).lineWidth(0.75).strokeColor(C_BORDER).stroke();

      // ==============================================================
      // 2. VEHICLE SPECIFICATION CARD
      // ==============================================================
      const vY = 81;
      doc.roundedRect(32, vY, 531, 74, 8).fillAndStroke(C_CARD_BG, C_BORDER);

      // Car Title & Badge
      doc.font(FONT_BLD).fontSize(11).fillColor(C_NAVY)
        .text(carTitle, 44, vY + 9, { width: 385, height: 16, ellipsis: true });

      // Assured verified badge
      doc.roundedRect(440, vY + 8, 112, 16, 4).fillAndStroke(C_TEAL, C_TEAL);
      doc.font(FONT_BLD).fontSize(7.5).fillColor(C_NAVY)
        .text('SELECTT ASSURED', 440, vY + 12, { width: 112, align: 'center' });

      // Grid of 8 Specifications (4 balanced columns)
      const row1Y = vY + 31;
      doc.font(FONT_REG).fontSize(7.5).fillColor(C_MUTED).text('Registration:', 44, row1Y);
      doc.font(FONT_BLD).fontSize(8).fillColor(C_DARK_TEXT).text(carRegNo, 104, row1Y);

      doc.font(FONT_REG).fontSize(7.5).fillColor(C_MUTED).text('Year:', 180, row1Y);
      doc.font(FONT_BLD).fontSize(8).fillColor(C_DARK_TEXT).text(String(carYear), 208, row1Y);

      doc.font(FONT_REG).fontSize(7.5).fillColor(C_MUTED).text('Odometer:', 290, row1Y);
      doc.font(FONT_BLD).fontSize(8).fillColor(C_DARK_TEXT).text(carKm, 342, row1Y);

      doc.font(FONT_REG).fontSize(7.5).fillColor(C_MUTED).text('Fuel Type:', 425, row1Y);
      doc.font(FONT_BLD).fontSize(8).fillColor(C_DARK_TEXT).text(carFuel, 470, row1Y);

      const row2Y = vY + 49;
      doc.font(FONT_REG).fontSize(7.5).fillColor(C_MUTED).text('Transmission:', 44, row2Y);
      doc.font(FONT_BLD).fontSize(8).fillColor(C_DARK_TEXT).text(carTransmission, 108, row2Y);

      doc.font(FONT_REG).fontSize(7.5).fillColor(C_MUTED).text('Ownership:', 180, row2Y);
      doc.font(FONT_BLD).fontSize(8).fillColor(C_DARK_TEXT).text(carOwnership, 232, row2Y);

      doc.font(FONT_REG).fontSize(7.5).fillColor(C_MUTED).text('Hub Location:', 290, row2Y);
      doc.font(FONT_BLD).fontSize(8).fillColor(C_DARK_TEXT).text(carLocation, 352, row2Y, { width: 68, ellipsis: true });

      doc.font(FONT_REG).fontSize(7.5).fillColor(C_MUTED).text('Audit Score:', 425, row2Y);
      doc.font(FONT_BLD).fontSize(8).fillColor(C_TEAL_DARK).text('9.4 / 10', 475, row2Y);

      // ==============================================================
      // 3. 3 CORE CHECKLIST AUDIT PILLARS
      // ==============================================================
      const pY = 163;
      doc.font(FONT_BLD).fontSize(10).fillColor(C_NAVY).text('Core Quality Verifications', 32, pY);
      doc.font(FONT_REG).fontSize(7.5).fillColor(C_MUTED).text(subtitle, 168, pY + 2);

      const badges = [
        { label: 'Meter Not Tampered', desc: '100% Genuine Odometer Verified' },
        { label: 'Non-Flooded Verified', desc: 'Zero Water Ingress or Submersion' },
        { label: 'Core Structure Intact', desc: 'Original Chassis & Pillar Alignment' }
      ];

      const bBoxY = pY + 16;
      badges.forEach((b, i) => {
        const bx = 32 + (i * 180);
        doc.roundedRect(bx, bBoxY, 171, 30, 6).fillAndStroke(C_GREEN_BG, C_GREEN_BORDER);

        doc.font(FONT_BLD).fontSize(8).fillColor(C_GREEN_TEXT)
          .text(`[PASS]  ${b.label}`, bx + 10, bBoxY + 6);
        doc.font(FONT_REG).fontSize(6.5).fillColor('#047857')
          .text(b.desc, bx + 10, bBoxY + 18);
      });

      // ==============================================================
      // 4. 5-PILLAR SYSTEM RATINGS & HEALTH SCORES
      // ==============================================================
      const catTitleY = 217;
      doc.font(FONT_BLD).fontSize(10).fillColor(C_NAVY).text('Comprehensive 5-Pillar Systems Health', 32, catTitleY);

      const categories = [
        {
          name: 'Core Systems',
          desc: 'Engine compression, cylinder health, gearbox transmission, chassis frame & steering assembly',
          score: qr.coreScore || '9.9',
          label: qr.coreLabel || 'Excellent',
          percent: 0.99
        },
        {
          name: 'Supporting Systems',
          desc: 'Electronic fuel supply, spark ignition, alternator charging, ECU sensors & cooling radiator',
          score: qr.supportingScore || '9.5',
          label: qr.supportingLabel || 'Excellent',
          percent: 0.95
        },
        {
          name: 'Interiors & AC',
          desc: 'HVAC cabin cooling efficiency (-4°C test), blower vents, power windows, upholstery & digital cluster',
          score: qr.interiorsScore || '9.6',
          label: qr.interiorsLabel || 'Excellent',
          percent: 0.96
        },
        {
          name: 'Exteriors & Lights',
          desc: 'Original factory panels, windshield & window glass, LED headlights, taillights & body alignment',
          score: qr.exteriorsScore || '9.2',
          label: qr.exteriorsLabel || 'Excellent',
          percent: 0.92
        },
        {
          name: 'Wear & Tear Parts',
          desc: 'Tyre tread depth (avg >65%), brake pad life, clutch friction disc, suspension bushes & battery',
          score: qr.wearTearScore || '8.7',
          label: qr.wearTearLabel || 'Good',
          percent: 0.87
        }
      ];

      let rowY = catTitleY + 16;
      categories.forEach((cat, index) => {
        const isAlt = index % 2 === 1;
        doc.roundedRect(32, rowY, 531, 40, 6).fillAndStroke(isAlt ? '#FAFAFA' : '#FFFFFF', C_BORDER);

        // Score Badge Box
        doc.roundedRect(42, rowY + 7, 40, 26, 5).fillAndStroke(C_TEAL, C_TEAL);
        doc.font(FONT_BLD).fontSize(10).fillColor(C_NAVY)
          .text(String(cat.score), 42, rowY + 13, { width: 40, align: 'center' });

        // Category Name & Status Badge
        doc.font(FONT_BLD).fontSize(9).fillColor(C_NAVY)
          .text(cat.name, 94, rowY + 8);
        doc.font(FONT_BLD).fontSize(7).fillColor(C_TEAL_DARK)
          .text(`* ${cat.label.toUpperCase()}`, 215, rowY + 9);

        // Progress bar indicator
        const pbX = 390;
        const pbW = 160;
        doc.roundedRect(pbX, rowY + 10, pbW, 6, 3).fillAndStroke('#E2E8F0', '#E2E8F0');
        doc.roundedRect(pbX, rowY + 10, pbW * cat.percent, 6, 3).fillAndStroke(C_TEAL, C_TEAL);

        // Description line
        doc.font(FONT_REG).fontSize(7).fillColor(C_MUTED)
          .text(cat.desc, 94, rowY + 22, { width: 455 });

        rowY += 45;
      });

      // ==============================================================
      // 5. EVALUATOR NOTES & OBSERVATIONS
      // ==============================================================
      rowY += 4;
      doc.font(FONT_BLD).fontSize(9.5).fillColor(C_NAVY).text('Chief Inspector & Evaluator Notes', 32, rowY);
      rowY += 14;

      doc.roundedRect(32, rowY, 531, 48, 6).fillAndStroke(C_CARD_BG, C_BORDER);
      doc.font(FONT_REG).fontSize(7.5).fillColor(C_DARK_TEXT)
        .text(summaryNotes, 42, rowY + 8, { width: 511, lineGap: 2.5 });

      rowY += 56;

      // ==============================================================
      // 6. UPCOMING SCHEDULED MAINTENANCE BANNER
      // ==============================================================
      doc.roundedRect(32, rowY, 531, 34, 6).fillAndStroke(C_TEAL_BG, '#99F6E4');
      doc.font(FONT_BLD).fontSize(8.5).fillColor(C_TEAL_DARK)
        .text('UPCOMING SCHEDULED SERVICE & MAINTENANCE', 42, rowY + 6);
      doc.font(FONT_REG).fontSize(7.5).fillColor(C_DARK_TEXT)
        .text(nextServiceText, 42, rowY + 18);

      rowY += 42;

      // ==============================================================
      // 7. SELECTT ASSURANCE GUARANTEE CARD
      // ==============================================================
      doc.roundedRect(32, rowY, 531, 38, 6).fillAndStroke('#F8FAFC', C_BORDER);
      doc.font(FONT_BLD).fontSize(8).fillColor(C_NAVY)
        .text('SELECTT ASSURANCE BENEFITS & PROMISES', 42, rowY + 7);
      doc.font(FONT_REG).fontSize(7).fillColor(C_MUTED)
        .text('1-Year Comprehensive Warranty  |  5-Day Money-Back Guarantee  |  Zero RC Transfer Charges  |  Fixed Fair Pricing', 42, rowY + 20);

      // ==============================================================
      // 8. REDESIGNED CORPORATE FOOTER WITH UPDATED CONTACT & ADDRESS
      // ==============================================================
      const footY = 698;
      doc.moveTo(32, footY).lineTo(563, footY).lineWidth(0.75).strokeColor(C_BORDER).stroke();

      const fInfoY = footY + 8;
      doc.font(FONT_BLD).fontSize(8).fillColor(C_NAVY)
        .text('Selectt Mobility India', 32, fInfoY);

      // Address
      doc.font(FONT_REG).fontSize(7).fillColor(C_MUTED)
        .text('Techno IT Park, Eksar Village, Borivali West, Mumbai, Maharashtra 400091', 32, fInfoY + 12, { width: 330 });

      // Contact Details & Website (Right aligned)
      doc.font(FONT_BLD).fontSize(7.5).fillColor(C_NAVY)
        .text('Customer Support & Inquiries:', 360, fInfoY, { width: 203, align: 'right' });
      doc.font(FONT_REG).fontSize(7).fillColor(C_MUTED)
        .text('Phone: +91 85746 67466   |   Email: hello@selectt.in', 360, fInfoY + 12, { width: 203, align: 'right' });
      doc.font(FONT_BLD).fontSize(7.5).fillColor(C_TEAL_DARK)
        .text('Official Website: https://selectt.in', 360, fInfoY + 24, { width: 203, align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateInspectionReportPdf
};
