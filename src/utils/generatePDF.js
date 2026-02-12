import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LOGO_BASE64 } from '../data/logoBase64';
import { INCHES_TO_CM, CM_TO_INCHES } from '../data/constants';

const NAVY = [21, 49, 71];
const NOIR = [35, 42, 47];
const MIST = [173, 184, 187];
const IVORY = [249, 248, 247];
const ALMOND = [237, 234, 228];
const WHITE = [255, 255, 255];

// pdfLang: 'ES' = cm/kg, 'EN' = in/lbs
export function generateQuotePDF(quote, isManager, pdfLang = 'ES') {
  const doc = new jsPDF('p', 'mm', 'letter');
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 0;

  const isEN = pdfLang === 'EN';
  const dimUnit = isEN ? 'in' : 'cm';
  const weightUnit = isEN ? 'lbs' : 'kg';

  // Convert stored dimensions to display units
  const storedIsInches = (quote.unidadMedida || 'CM') === 'IN';
  const toDimDisplay = (val) => {
    const v = parseFloat(val) || 0;
    if (isEN && !storedIsInches) return (v * CM_TO_INCHES).toFixed(3);
    if (!isEN && storedIsInches) return (v * INCHES_TO_CM).toFixed(2);
    return val || '0';
  };

  const pesoKg = quote.pesoXMillar || 0;
  const pesoLbs = pesoKg * 2.20462;
  const cantKg = quote.cantidadKg || 0;
  const cantLbs = cantKg * 2.20462;
  const pesoDisplay = isEN ? pesoLbs.toFixed(4) : pesoKg.toFixed(4);
  const cantDisplay = isEN ? cantLbs.toFixed(4) : cantKg.toFixed(4);
  const pesoAlt = isEN ? `${pesoKg.toFixed(4)} kg` : `${pesoLbs.toFixed(4)} lbs`;
  const cantAlt = isEN ? `${cantKg.toFixed(4)} kg` : `${cantLbs.toFixed(4)} lbs`;

  // Grabados
  const tintas = parseInt(quote.noTintas) || 0;
  const precioGrabadoUSD = parseFloat(quote.precioGrabadoUSD) || 300;
  const tc = parseFloat(quote.tipoCambio) || 18;
  const totalGrabadoUSD = precioGrabadoUSD * tintas;
  const totalGrabadoMXN = totalGrabadoUSD * tc;

  // Labels
  const L = isEN ? {
    quote: 'QUOTE', version: 'Version', specs: 'SPECIFICATIONS',
    type: 'Type', qty: 'Quantity', qtyWeight: `Quantity ${weightUnit.toUpperCase()}`,
    freight: 'Freight', material: 'Material', density: 'Density',
    gauge: 'Gauge', inks: 'No. Inks', width: 'Width', length: 'Length',
    gusset: 'Gusset', lip: 'Lip', complements: 'COMPLEMENTS',
    accessories: 'ACCESSORIES', accessory: 'Accessory', unit: 'Unit', price: 'Price',
    conversion: 'CONVERSION', engraving: 'ENGRAVING', engravingCost: 'Engraving Cost',
    priceSummary: 'PRICING SUMMARY', subtotalMat: 'Subtotal Material',
    weightPerM: 'Weight per Thousand', finalMXN: 'Final Price MXN', finalUSD: 'Final Price USD',
    perThousand: 'per thousand', orderTotal: 'Order Total', generated: 'Generated',
  } : {
    quote: 'COTIZACIÓN', version: 'Versión', specs: 'ESPECIFICACIONES',
    type: 'Tipo', qty: 'Cantidad', qtyWeight: `Cantidad ${weightUnit.toUpperCase()}`,
    freight: 'Flete', material: 'Material', density: 'Densidad',
    gauge: 'Calibre', inks: 'No. Tintas', width: 'Ancho', length: 'Largo',
    gusset: 'Fuelle', lip: 'Lengua', complements: 'COMPLEMENTOS',
    accessories: 'ACCESORIOS', accessory: 'Accesorio', unit: 'Unidad', price: 'Precio',
    conversion: 'CONVERSIÓN', engraving: 'GRABADOS', engravingCost: 'Costo Grabados',
    priceSummary: 'RESUMEN DE PRECIOS', subtotalMat: 'Subtotal Material',
    weightPerM: 'Peso x Millar', finalMXN: 'Precio Final MXN', finalUSD: 'Precio Final USD',
    perThousand: 'por millar', orderTotal: 'Total Orden', generated: 'Generado',
  };

  // ── Header bar ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 38, 'F');

  try {
    doc.addImage(LOGO_BASE64, 'PNG', margin, 6, 55, 26);
  } catch (e) { /* fallback */ }

  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${L.quote} — ${L.version} ${quote.version || 'A'}`, pageW - margin, 14, { align: 'right' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(quote.registro || `#${quote.id?.slice(-6) || '---'}`, pageW - margin, 22, { align: 'right' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const locale = isEN ? 'en-US' : 'es-MX';
  const dateStr = quote.createdAt ? new Date(quote.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  doc.text(dateStr, pageW - margin, 28, { align: 'right' });

  y = 44;

  // ── Client info box ──
  doc.setFillColor(...IVORY);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, 'F');
  doc.setDrawColor(...ALMOND);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, 'S');

  doc.setTextColor(...MIST);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(isEN ? 'CLIENT' : 'CLIENTE', margin + 5, y + 6);
  doc.text(isEN ? 'CLIENT No.' : 'No. CLIENTE', margin + 75, y + 6);
  doc.text(isEN ? 'PRODUCT' : 'PRODUCTO', margin + 110, y + 6);

  doc.setTextColor(...NOIR);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(quote.cliente || '—', margin + 5, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.noCliente ? `#${quote.noCliente}` : '—', margin + 75, y + 14);
  doc.text(quote.producto || '—', margin + 110, y + 14);

  y += 28;

  // ── Specifications table ──
  doc.setTextColor(...NAVY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(L.specs, margin, y);
  y += 5;

  // Cajas calculation
  const isCajas = quote.cantidadUnidad === 'CAJAS' && quote.cantidadPorCaja > 0 && quote.cantidadValor > 0;
  const numCajas = parseFloat(quote.cantidadValor) || 0;
  const pzasPorCaja = parseFloat(quote.cantidadPorCaja) || 0;
  const totalPiezas = numCajas * pzasPorCaja;

  const isRollType = ['ROLLO', 'MANGA', 'LAMINACIÓN'].includes(quote.tipo);

  const specData = [
    [L.type, quote.tipo || '—', L.qty, `${quote.cantidadValor || '—'} ${quote.cantidadUnidad || ''}`],
    [L.qtyWeight, `${cantDisplay} ${weightUnit} (${cantAlt})`, L.freight, quote.flete || '—'],
    [L.material, quote.material || '—', L.density, quote.densidad || '—'],
    [L.gauge, `${quote.calibreGauge?.toFixed(0) || '—'} gauge`, L.inks, String(quote.noTintas || 0)],
    [L.width, `${toDimDisplay(quote.ancho)} ${dimUnit}`, L.length, `${toDimDisplay(quote.largo)} ${dimUnit}`],
    [L.gusset, `${toDimDisplay(quote.fuelle)} ${dimUnit}`, L.lip, `${toDimDisplay(quote.lengua)} ${dimUnit}`],
  ];
  if (isCajas) {
    specData.push([isEN ? 'Pcs/Box' : 'Pzas/Caja', String(pzasPorCaja), isEN ? 'Total Pieces' : 'Total Piezas', String(totalPiezas)]);
  }

  autoTable(doc, {
    startY: y,
    body: specData,
    theme: 'plain',
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
      textColor: NOIR,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: MIST, cellWidth: 30 },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', textColor: MIST, cellWidth: 30 },
      3: { cellWidth: 55 },
    },
    alternateRowStyles: { fillColor: IVORY },
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── Complementos ──
  const complementos = [];
  if (quote.pcr === 'SI') complementos.push(`PCR ${quote.pcrPct || 10}%`);
  if (quote.d2w === 'SI') complementos.push('D2W');
  if (quote.pigmento === 'SI') complementos.push(isEN ? 'Pigment' : 'Pigmento');
  if (quote.tintaEspecial === 'SI') complementos.push(isEN ? 'Special Ink' : 'Tinta Especial');
  if (quote.plastaMayor === 'SI') complementos.push(isEN ? 'Major Plate' : 'Plasta Mayor');

  if (complementos.length > 0) {
    doc.setTextColor(...NAVY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(L.complements, margin, y);
    y += 5;
    doc.setFillColor(...IVORY);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
    doc.setTextColor(...NOIR);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(complementos.join('  |  '), margin + 5, y + 6.5);
    y += 16;
  }

  // ── Accesorios ──
  const activeAccCm = (quote.accesoriosCm || []).filter(a => a.activo && a.nombre);
  const activeAccMil = (quote.accesoriosMillar || []).filter(a => a.activo && a.nombre);
  const activeAccKg = (quote.accesoriosKg || []).filter(a => a.activo && a.nombre);
  const hasAccessories = activeAccCm.length + activeAccMil.length + activeAccKg.length > 0;

  if (hasAccessories) {
    doc.setTextColor(...NAVY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(L.accessories, margin, y);
    y += 5;

    const accRows = [];
    activeAccCm.forEach(a => accRows.push([a.nombre, isEN ? 'Linear CM' : 'CM Lineal', isManager ? `$${a.precio}` : '—']));
    activeAccMil.forEach(a => accRows.push([a.nombre, isEN ? 'Thousand' : 'Millar', isManager ? `$${a.precio}` : '—']));
    activeAccKg.forEach(a => accRows.push([a.nombre, 'KG', isManager ? `$${a.precio}` : '—']));

    autoTable(doc, {
      startY: y,
      head: [[L.accessory, L.unit, L.price]],
      body: accRows,
      theme: 'plain',
      margin: { left: margin, right: margin },
      headStyles: { fillColor: NAVY, textColor: WHITE, fontSize: 7, fontStyle: 'bold', cellPadding: { top: 2, bottom: 2, left: 4, right: 4 } },
      styles: { fontSize: 8, cellPadding: { top: 2, bottom: 2, left: 4, right: 4 }, textColor: NOIR },
      alternateRowStyles: { fillColor: IVORY },
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // ── Conversion ──
  if (quote.conversion) {
    doc.setTextColor(...NAVY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(L.conversion, margin, y);
    y += 5;
    doc.setFillColor(...IVORY);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
    doc.setTextColor(...NOIR);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.conversion, margin + 5, y + 6.5);
    y += 16;
  }

  // ── Grabados ──
  const hasPricing = !!(quote.precioFinal && quote.precioFinal > 0);
  if (tintas > 0) {
    doc.setTextColor(...NAVY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(L.engraving, margin, y);
    y += 5;
    doc.setFillColor(...IVORY);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
    doc.setTextColor(...NOIR);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    if (isManager || hasPricing) {
      doc.text(`${tintas} ${isEN ? 'colors' : 'tintas'} × $${precioGrabadoUSD.toFixed(0)} USD = $${totalGrabadoUSD.toFixed(2)} USD  |  $${totalGrabadoMXN.toFixed(2)} MXN`, margin + 5, y + 6.5);
    } else {
      doc.text(`${tintas} ${tintas === 1 ? (isEN ? 'color' : 'tinta') : (isEN ? 'colors' : 'tintas')}`, margin + 5, y + 6.5);
    }
    y += 16;
  }

  // ── Pricing summary (manager only) ──
  if (isManager) {
    // Calculate order total
    const precioFinalMillar = quote.precioFinal || 0;
    const cantidadMillares = parseFloat(quote.cantidadValor) || 0;
    const orderTotalMXN = precioFinalMillar * cantidadMillares;
    const orderTotalUSD = orderTotalMXN / tc;
    const grandTotalMXN = orderTotalMXN + totalGrabadoMXN;
    const grandTotalUSD = orderTotalUSD + totalGrabadoUSD;

    // Main pricing box — final price + grabados + optional precio/kg
    const hasKgRow = isRollType;
    let boxH = 34;
    if (tintas > 0) boxH += 18;
    if (hasKgRow) boxH += 16;
    doc.setFillColor(...NAVY);
    doc.roundedRect(margin, y, contentW, boxH, 3, 3, 'F');

    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(L.priceSummary, margin + 6, y + 8);

    const col1 = margin + 6;
    const col2 = margin + contentW / 4;
    const col3 = margin + contentW / 2;
    const col4 = margin + (contentW * 3) / 4;

    // Row 1 labels
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MIST);
    doc.text(L.subtotalMat, col1, y + 16);
    doc.text(L.weightPerM, col2, y + 16);
    doc.text(L.finalMXN, col3, y + 16);
    doc.text(L.finalUSD, col4, y + 16);

    // Row 1 values
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(`$${quote.subtotalMaterial || 0}/kg`, col1, y + 24);
    doc.text(`${pesoDisplay} ${weightUnit}`, col2, y + 24);

    doc.setFontSize(7);
    doc.setTextColor(...MIST);
    doc.text(pesoAlt, col2, y + 30);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(74, 222, 128);
    doc.text(`$${precioFinalMillar.toFixed(2)}`, col3, y + 24);
    doc.setTextColor(147, 197, 253);
    doc.text(`$${(quote.precioFinalUS || 0).toFixed(2)}`, col4, y + 24);

    doc.setFontSize(7);
    doc.setTextColor(...MIST);
    doc.text(L.perThousand, col3, y + 30);
    doc.text(`TC: ${quote.tipoCambio || 18}`, col4, y + 30);

    // Precio por KG row for ROLLO/MANGA/LAMINACIÓN
    let kgRowOffset = 0;
    if (hasKgRow) {
      kgRowOffset = 16;
      const kgY = y + 34;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MIST);
      doc.text(isEN ? 'Price per KG (MXN)' : 'Precio por KG (MXN)', col1, kgY);
      doc.text(isEN ? 'Price per KG (USD)' : 'Precio por KG (USD)', col2, kgY);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(251, 191, 36);
      doc.text(`$${(quote.precioKg || 0).toFixed(2)}`, col1, kgY + 8);
      doc.text(`$${(quote.precioKgUS || 0).toFixed(2)}`, col2, kgY + 8);
    }

    // Grabados row
    if (tintas > 0) {
      const r2y = y + 38 + kgRowOffset;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MIST);
      doc.text(L.engravingCost, col1, r2y);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(251, 191, 36);
      doc.text(`${tintas} × $${precioGrabadoUSD.toFixed(0)} = $${totalGrabadoUSD.toFixed(2)} USD  |  $${totalGrabadoMXN.toFixed(2)} MXN`, col1, r2y + 8);
    }

    y += boxH + 8;
  } else if (hasPricing) {
    // Non-manager with pricing set: show weight + final price + grabados (no order total)
    const precioFinalMillar = quote.precioFinal || 0;

    let boxH = 34;
    if (tintas > 0) boxH += 18;
    doc.setFillColor(...NAVY);
    doc.roundedRect(margin, y, contentW, boxH, 3, 3, 'F');

    const col1 = margin + 6;
    const col2 = margin + contentW / 4;
    const col3 = margin + contentW / 2;
    const col4 = margin + (contentW * 3) / 4;

    // Row 1 labels
    doc.setTextColor(...MIST);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(L.weightPerM, col1, y + 8);
    doc.text(L.qtyWeight, col2, y + 8);
    doc.text(L.finalMXN, col3, y + 8);
    doc.text(L.finalUSD, col4, y + 8);

    // Row 1 values
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(`${pesoDisplay} ${weightUnit}`, col1, y + 16);
    doc.text(`${cantDisplay} ${weightUnit}`, col2, y + 16);

    doc.setFontSize(7);
    doc.setTextColor(...MIST);
    doc.text(pesoAlt, col1, y + 21);
    doc.text(cantAlt, col2, y + 21);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(74, 222, 128);
    doc.text(`$${precioFinalMillar.toFixed(2)}`, col3, y + 16);
    doc.setTextColor(147, 197, 253);
    doc.text(`$${(quote.precioFinalUS || 0).toFixed(2)}`, col4, y + 16);

    doc.setFontSize(7);
    doc.setTextColor(...MIST);
    doc.text(L.perThousand, col3, y + 21);
    doc.text(`TC: ${quote.tipoCambio || 18}`, col4, y + 21);

    // Grabados row
    if (tintas > 0) {
      const r2y = y + 30;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MIST);
      doc.text(L.engravingCost, col1, r2y);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(251, 191, 36);
      doc.text(`${tintas} × $${precioGrabadoUSD.toFixed(0)} = $${totalGrabadoUSD.toFixed(2)} USD  |  $${totalGrabadoMXN.toFixed(2)} MXN`, col1, r2y + 8);
    }

    y += boxH + 8;
  } else {
    // Non-manager without pricing: just show weight info
    doc.setFillColor(...NAVY);
    doc.roundedRect(margin, y, contentW, 20, 3, 3, 'F');

    doc.setTextColor(...MIST);
    doc.setFontSize(7);
    doc.text(L.weightPerM, margin + 6, y + 8);
    doc.text(L.qtyWeight, margin + contentW / 2, y + 8);

    doc.setTextColor(...WHITE);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${pesoDisplay} ${weightUnit}  (${pesoAlt})`, margin + 6, y + 15);
    doc.text(`${cantDisplay} ${weightUnit}  (${cantAlt})`, margin + contentW / 2, y + 15);

    y += 26;
  }

  // ── Footer ──
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...ALMOND);
  doc.rect(0, pageH - 12, pageW, 12, 'F');
  doc.setTextColor(...MIST);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(isEN ? 'Multibolsas Plasticas® — Your brand deserves it!' : 'Multibolsas Plasticas® — Tu marca lo merece!', margin, pageH - 5);
  doc.text(`${L.generated}: ${new Date().toLocaleDateString(locale)}`, pageW - margin, pageH - 5, { align: 'right' });

  // Save
  const langSuffix = isEN ? '_EN' : '_ES';
  const fileName = `Cotizacion_${quote.registro || quote.id?.slice(-6) || 'nueva'}${langSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
