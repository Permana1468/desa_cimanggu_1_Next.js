/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function generatePDF() {
  const mdPath = path.join(__dirname, '../rinciancatatan.md');
  const pdfPath = path.join(__dirname, '../catatan_kurikulum_si.pdf');
  const text = fs.readFileSync(mdPath, 'utf8');

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
  const { width, height } = page.getSize();
  const margin = 40;
  let y = height - margin;

  const lines = text.split('\n');

  function sanitize(str) {
    return str.replace(/[^\x00-\x7F]/g, '');
  }

  function checkPageBreak(neededHeight = 20) {

    if (y - neededHeight < margin) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = height - margin;
    }
  }

  // Cover / Header Banner
  page.drawRectangle({
    x: margin,
    y: y - 50,
    width: width - (margin * 2),
    height: 50,
    color: rgb(0.1, 0.35, 0.7),
  });
  page.drawText('CATATAN KURIKULUM PRODI SISTEM INFORMASI', {
    x: margin + 15,
    y: y - 32,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  y -= 70;

  for (let line of lines) {
    line = sanitize(line.replace(/\r/g, '').trim());
    if (!line) {

      y -= 8;
      continue;
    }

    if (line.startsWith('# ')) {
      checkPageBreak(30);
      const title = line.replace('# ', '');
      page.drawText(title, { x: margin, y, size: 16, font: boldFont, color: rgb(0.1, 0.25, 0.6) });
      y -= 24;
    } else if (line.startsWith('## ')) {
      checkPageBreak(26);
      const h2 = line.replace('## ', '');
      page.drawText(h2, { x: margin, y, size: 13, font: boldFont, color: rgb(0.15, 0.3, 0.5) });
      y -= 20;
    } else if (line.startsWith('### ')) {
      checkPageBreak(22);
      const h3 = line.replace('### ', '');
      page.drawText(h3, { x: margin, y, size: 11, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
      y -= 16;
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      checkPageBreak(16);
      let content = line.substring(2).replace(/\*\*/g, '').replace(/\*/g, '');
      // Wrap text
      const maxChars = 80;
      while (content.length > 0) {
        checkPageBreak(14);
        const chunk = content.substring(0, maxChars);
        content = content.substring(maxChars);
        page.drawText('• ' + chunk, { x: margin + 10, y, size: 9, font: font, color: rgb(0.2, 0.2, 0.2) });
        y -= 13;
      }
    } else if (line.startsWith('>')) {
      checkPageBreak(16);
      const quote = line.replace('>', '').replace(/\*\*/g, '').trim();
      page.drawText(quote, { x: margin + 10, y, size: 8.5, font: font, color: rgb(0.4, 0.4, 0.4) });
      y -= 14;
    } else if (line.startsWith('---')) {
      checkPageBreak(10);
      page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      y -= 12;
    } else {
      checkPageBreak(14);
      let cleanText = line.replace(/\*\*/g, '').replace(/`/g, '');
      const maxChars = 85;
      while (cleanText.length > 0) {
        checkPageBreak(14);
        const chunk = cleanText.substring(0, maxChars);
        cleanText = cleanText.substring(maxChars);
        page.drawText(chunk, { x: margin, y, size: 9, font: font, color: rgb(0.25, 0.25, 0.25) });
        y -= 13;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfPath, pdfBytes);
  console.log('PDF berhasil dibuat di:', pdfPath);
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
