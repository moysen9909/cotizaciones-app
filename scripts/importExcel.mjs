/**
 * Script to import quotes from "Cotizador US.xlsx"
 * Each sheet becomes a quote, sheet name = registro
 * Outputs a JSON array that can be merged into localStorage
 */
import XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';

const FILE = '/Users/moy/Desktop/Cotizador US.xlsx';
const SKIP_SHEETS = ['Lista de precios', 'COTIZADOR', 'Sheet1', 'Origen'];

// Material name mapping from the Excel
const MATERIALS_MAP = {
  'POLIETILENO': 'POLIETILENO',
  'PE HIGH GLOSS': 'PE HIGH GLOSS',
  'HDPE': 'HDPE',
  'CPP': 'CPP',
  'BOPP': 'BOPP',
  'BOPP ANTIFOG': 'BOPP ANTIFOG',
  'COMPOSTABLE': 'COMPOSTABLE',
  'PAPEL CRAFT': 'PAPEL CRAFT',
  'POLIETILENO / POLIETILENO': 'POLIETILENO / POLIETILENO',
  'POLIETILENO/CPP': 'POLIETILENO/CPP',
  'POLIETILENO / BOPP': 'POLIETILENO / BOPP',
  'PE (SUSTITUTO DE PET) POUCH': 'PE (SUSTITUTO DE PET) POUCH',
  'POLIETILENO / NYLON': 'POLIETILENO / NYLON',
  'POLIETILENO / PET NATURAL': 'POLIETILENO / PET NATURAL',
  'POLIETILENO/ PET METALIZADO': 'POLIETILENO/ PET METALIZADO',
  'CPP/CPP': 'CPP/CPP',
  'CPP/BOPP': 'CPP/BOPP',
  'CPP/BOPP METALIZADO': 'CPP/BOPP METALIZADO',
  'BOPP / BOPP': 'BOPP / BOPP',
  'BOPP / BOPP METALIZADO': 'BOPP / BOPP METALIZADO',
  'BOPP 15 / BOPP 15': 'BOPP 15 / BOPP 15',
  'POLIETILENO / PET MET / BOPP NAT': 'POLIETILENO / PET MET / BOPP NAT',
  'POLIETILENO / PET MET / BOPP MATE': 'POLIETILENO / PET MET / BOPP MATE',
  'POLIETILENO / PET MET / PET NAT': 'POLIETILENO / PET MET / PET NAT',
  'POLIETILENO / PET MET / NYLON': 'POLIETILENO / PET MET / NYLON',
};

const MATERIAL_DENSITIES = {
  'POLIETILENO': 0.92, 'PE HIGH GLOSS': 0.92, 'HDPE': 0.95, 'CPP': 0.90, 'BOPP': 0.90,
  'BOPP ANTIFOG': 0.90, 'COMPOSTABLE': 1.25, 'PAPEL CRAFT': 0.70,
  'POLIETILENO / POLIETILENO': 0.92, 'POLIETILENO/CPP': 0.91, 'POLIETILENO / BOPP': 0.91,
  'PE (SUSTITUTO DE PET) POUCH': 0.92, 'POLIETILENO / NYLON': 0.97,
  'POLIETILENO / PET NATURAL': 1.00, 'POLIETILENO/ PET METALIZADO': 1.02,
  'CPP/CPP': 0.90, 'CPP/BOPP': 0.90, 'CPP/BOPP METALIZADO': 0.92,
  'BOPP / BOPP': 0.90, 'BOPP / BOPP METALIZADO': 0.92, 'BOPP 15 / BOPP 15': 0.90,
  'POLIETILENO / PET MET / BOPP NAT': 1.00, 'POLIETILENO / PET MET / BOPP MATE': 1.00,
  'POLIETILENO / PET MET / PET NAT': 1.05, 'POLIETILENO / PET MET / NYLON': 1.02,
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function cell(data, row, col) {
  if (!data[row]) return '';
  return data[row][col] ?? '';
}

function parseNum(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function parseTintas(v) {
  if (v === '' || v === null || v === undefined || v === 'S/IMP' || v === 0) return 0;
  const n = parseInt(v);
  return isNaN(n) ? 0 : n;
}

function parseQuoteColumn(data, colOffset, sheetName, suffix) {
  // colOffset: 1 for first column (B), 9 for second column (J)
  const registro = sheetName + (suffix || '');

  // Check if this column has actual data (check cantidad row)
  const cantidadVal = cell(data, 5, colOffset + 1);
  if (cantidadVal === '' || cantidadVal === 0) return null;

  const noCliente = cell(data, 1, colOffset + 1);
  const cliente = cell(data, 2, colOffset + 1);
  const producto = cell(data, 3, colOffset + 1);
  const tipo = (cell(data, 4, colOffset + 1) || '').toString().toUpperCase();
  const cantidad = parseNum(cell(data, 5, colOffset + 1));
  const cantidadUnidad = (cell(data, 5, colOffset + 5) || 'MILLARES').toString().toUpperCase();
  const cantidadKg = parseNum(cell(data, 6, colOffset + 1));
  const flete = cell(data, 7, colOffset + 1) || '';
  const precioFlete = parseNum(cell(data, 8, colOffset + 1));

  // Dimensions: IN values in col+1, CM values in col+3
  const anchoIn = parseNum(cell(data, 11, colOffset + 1));
  const largoCm = parseNum(cell(data, 12, colOffset + 3));
  const anchoCm = parseNum(cell(data, 11, colOffset + 3));
  const largoIn = parseNum(cell(data, 12, colOffset + 1));
  const fuelleCm = parseNum(cell(data, 13, colOffset + 3));
  const lenguaCm = parseNum(cell(data, 14, colOffset + 3));

  // Calibre: IN value in col+1, gauge value in col+3
  const calibreInVal = cell(data, 15, colOffset + 1);
  const calibreGauge = parseNum(cell(data, 15, colOffset + 3));

  // Material: name in col+5
  const materialName = (cell(data, 16, colOffset + 5) || '').toString().trim();
  const material = materialName || '';
  const densidad = MATERIAL_DENSITIES[material] || '';

  const noTintas = parseTintas(cell(data, 17, colOffset + 1));

  const pcr = (cell(data, 18, colOffset + 1) || 'NO').toString().toUpperCase();
  const pcrPct = parseNum(cell(data, 18, colOffset + 2));
  const d2w = (cell(data, 19, colOffset + 1) || 'NO').toString().toUpperCase();
  const pigmento = (cell(data, 20, colOffset + 1) || 'NO').toString().toUpperCase();
  const tintaEspecial = (cell(data, 21, colOffset + 1) || 'NO').toString().toUpperCase();
  const plastaMayor = (cell(data, 22, colOffset + 1) || 'NO').toString().toUpperCase();

  const subtotalMaterial = parseNum(cell(data, 23, colOffset + 1)) || null;

  // Accesorios CM (rows 24-26)
  const accesoriosCm = [24, 25, 26].map(row => {
    const activo = (cell(data, row, colOffset + 1) || 'NO').toString().toUpperCase() === 'SI';
    const precio = parseNum(cell(data, row, colOffset + 2));
    const total = parseNum(cell(data, row, colOffset + 3));
    const nombre = (cell(data, row, colOffset + 5) || '').toString().trim();
    return { nombre, activo, precio, total };
  });

  // Accesorios Millar (rows 27-29)
  const accesoriosMillar = [27, 28, 29].map(row => {
    const activo = (cell(data, row, colOffset + 1) || 'NO').toString().toUpperCase() === 'SI';
    const precio = parseNum(cell(data, row, colOffset + 2));
    const nombre = (cell(data, row, colOffset + 5) || '').toString().trim();
    return { nombre, activo, precio };
  });

  // Accesorios KG (rows 30-31)
  const accesoriosKg = [30, 31].map(row => {
    const activo = (cell(data, row, colOffset + 1) || 'NO').toString().toUpperCase() === 'SI';
    const precio = parseNum(cell(data, row, colOffset + 2));
    const nombre = (cell(data, row, colOffset + 5) || '').toString().trim();
    return { nombre, activo, precio };
  });

  // Conversión (row 32)
  const convActivo = (cell(data, 32, colOffset + 1) || 'NO').toString().toUpperCase() === 'SI';
  const convPrecio = parseNum(cell(data, 32, colOffset + 2));
  const convNombre = (cell(data, 32, colOffset + 5) || '').toString().trim();
  const conversion = convActivo ? convNombre : '';
  const conversionPrecio = convActivo ? convPrecio : 0;

  const pesoXMillar = parseNum(cell(data, 33, colOffset + 1));

  // Flete detail (row 34)
  const fleteType = (cell(data, 34, colOffset + 1) || '').toString().trim();
  const fleteValue = fleteType || flete;

  const precioFinal = parseNum(cell(data, 36, colOffset + 1));
  const precioFinalUS = parseNum(cell(data, 37, colOffset + 1));

  // Build the quote object matching EMPTY_COTIZACION shape
  return {
    id: generateId(),
    registro,
    clienteId: '',
    noCliente: noCliente ? String(noCliente) : '',
    cliente: cliente ? String(cliente) : '',
    producto: producto ? String(producto) : '',
    tipo: tipo === 'POUCH' ? 'POUCH' : tipo === 'ROLLO' ? 'ROLLO' : tipo === 'MANGA' ? 'MANGA' : tipo === 'LAMINACIÓN' ? 'LAMINACIÓN' : tipo === 'BOLSA' ? 'BOLSA' : tipo || '',
    cantidadValor: cantidad ? String(cantidad) : '',
    cantidadUnidad: cantidadUnidad.includes('PIEZA') ? 'PIEZAS' : 'MILLARES',
    cantidadKg,
    flete: fleteValue,
    precioFlete,
    idioma: 'EN',
    ancho: anchoCm ? String(anchoCm) : '',
    largo: largoCm ? String(largoCm) : '',
    fuelle: fuelleCm ? String(fuelleCm) : '',
    lengua: lenguaCm ? String(lenguaCm) : '',
    calibreValor: calibreInVal ? String(calibreInVal) : '',
    calibreUnidad: 'gauge',
    calibreGauge: calibreGauge,
    material,
    densidad: densidad ? String(densidad) : '',
    noTintas,
    pcr: pcr === 'SI' ? 'SI' : 'NO',
    pcrPct: pcrPct || 0,
    d2w: d2w === 'SI' ? 'SI' : 'NO',
    pigmento: pigmento === 'SI' ? 'SI' : 'NO',
    tintaEspecial: tintaEspecial === 'SI' ? 'SI' : 'NO',
    plastaMayor: plastaMayor === 'SI' ? 'SI' : 'NO',
    version: 'A',
    parentQuoteId: '',
    priceTiers: [
      { cantidad: cantidad ? String(cantidad) : '', precio: subtotalMaterial },
    ],
    activeTierIndex: 0,
    subtotalMaterial,
    accesoriosCm,
    accesoriosMillar,
    accesoriosKg,
    conversion,
    conversionPrecio,
    precioGrabadoUSD: 300,
    pesoXMillar,
    precioFinal,
    precioFinalUS: precioFinalUS,
    tipoCambio: 18.5,
    imagenes: [],
    createdByRole: 'manager',
    createdAt: new Date().toISOString(),
  };
}

// Main
const wb = XLSX.readFile(FILE);
const allQuotes = [];

wb.SheetNames.forEach(name => {
  if (SKIP_SHEETS.includes(name)) return;

  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  // Check if valid quote sheet (row 0 should have REGISTRO)
  if (!data[0] || (cell(data, 0, 1) !== 'REGISTRO' && cell(data, 0, 9) !== 'REGISTRO')) {
    console.log(`⏭ Skipping "${name}" — no REGISTRO header`);
    return;
  }

  // Parse first column (always present)
  const q1 = parseQuoteColumn(data, 1, name, '');
  if (q1) {
    allQuotes.push(q1);
    console.log(`✅ ${name} — col 1 imported`);
  } else {
    console.log(`⚠ ${name} — col 1 empty, skipping`);
  }

  // Check for second column
  if (cell(data, 0, 9) === 'REGISTRO') {
    const cantVal2 = cell(data, 5, 10);
    if (cantVal2 !== '' && cantVal2 !== 0) {
      const q2 = parseQuoteColumn(data, 9, name, ' (B)');
      if (q2) {
        q2.version = 'B';
        q2.parentQuoteId = q1 ? q1.id : '';
        if (q1) q1.parentQuoteId = q1.id; // Link family
        allQuotes.push(q2);
        console.log(`✅ ${name} — col 2 imported as version B`);
      }
    }
  }
});

console.log(`\n📊 Total quotes imported: ${allQuotes.length}`);

// Write to JSON file
const outPath = '/Users/moy/Desktop/prueba/cotizaciones-app/scripts/imported_quotes.json';
writeFileSync(outPath, JSON.stringify(allQuotes, null, 2));
console.log(`💾 Saved to ${outPath}`);
