export const MATERIALS = [
  'POLIETILENO',
  'PE HIGH GLOSS',
  'HDPE',
  'CPP',
  'BOPP',
  'BOPP ANTIFOG',
  'COMPOSTABLE',
  'PAPEL CRAFT',
  'POLIETILENO / POLIETILENO',
  'POLIETILENO/CPP',
  'POLIETILENO / BOPP',
  'PE (SUSTITUTO DE PET) POUCH',
  'POLIETILENO / NYLON',
  'POLIETILENO / PET NATURAL',
  'POLIETILENO/ PET METALIZADO',
  'CPP/CPP',
  'CPP/BOPP',
  'CPP/BOPP METALIZADO',
  'BOPP / BOPP',
  'BOPP / BOPP METALIZADO',
  'BOPP 15 / BOPP 15',
  'POLIETILENO / PET MET / BOPP NAT',
  'POLIETILENO / PET MET / BOPP MATE',
  'POLIETILENO / PET MET / PET NAT',
  'POLIETILENO / PET MET / NYLON',
];

// Densities by material (g/cm³)
export const MATERIAL_DENSITIES = {
  'POLIETILENO': 0.92,
  'PE HIGH GLOSS': 0.92,
  'HDPE': 0.95,
  'CPP': 0.90,
  'BOPP': 0.90,
  'BOPP ANTIFOG': 0.90,
  'COMPOSTABLE': 1.25,
  'PAPEL CRAFT': 0.70,
  'POLIETILENO / POLIETILENO': 0.92,
  'POLIETILENO/CPP': 0.91,
  'POLIETILENO / BOPP': 0.91,
  'PE (SUSTITUTO DE PET) POUCH': 0.92,
  'POLIETILENO / NYLON': 0.97,
  'POLIETILENO / PET NATURAL': 1.00,
  'POLIETILENO/ PET METALIZADO': 1.02,
  'CPP/CPP': 0.90,
  'CPP/BOPP': 0.90,
  'CPP/BOPP METALIZADO': 0.92,
  'BOPP / BOPP': 0.90,
  'BOPP / BOPP METALIZADO': 0.92,
  'BOPP 15 / BOPP 15': 0.90,
  'POLIETILENO / PET MET / BOPP NAT': 1.00,
  'POLIETILENO / PET MET / BOPP MATE': 1.00,
  'POLIETILENO / PET MET / PET NAT': 1.05,
  'POLIETILENO / PET MET / NYLON': 1.02,
};

// Price list from Excel: [S/IMP, 1ink, 2ink, 3ink, 4ink, 5ink, 6ink, 7ink, 8ink]
export const PRICE_LIST = {
  'POLIETILENO':                   [80.8, 85.0, 89.1, 93.3, 97.4, 101.6, 105.7, 112.0, 118.2],
  'PE HIGH GLOSS':                 [90.2, 94.4, 98.5, 102.7, 106.8, 111.0, 115.1, 121.4, 127.6],
  'HDPE':                          [82.8, 87.0, 91.1, 95.3, 99.4, 103.6, 107.7, 114.0, 120.2],
  'CPP':                           [93.3, 97.5, 101.6, 105.8, 109.9, 114.1, 118.2, 124.5, 130.7],
  'BOPP':                          [95.2, 99.4, 103.5, 107.7, 111.8, 116.0, 120.1, 126.4, 132.6],
  'BOPP ANTIFOG':                  [100.2, 104.4, 108.5, 112.7, 116.8, 121.0, 125.1, 131.4, 137.6],
  'COMPOSTABLE':                   [180.0, 184.2, 188.3, 192.5, 196.6, 200.8, 204.9, 211.2, 217.4],
  'PAPEL CRAFT':                   [150.0, 154.2, 158.3, 162.5, 166.6, 170.8, 174.9, 181.2, 187.4],
  'POLIETILENO / POLIETILENO':     [105.8, 110.0, 114.1, 118.3, 122.4, 126.6, 130.7, 137.0, 143.2],
  'POLIETILENO/CPP':               [115.7, 119.9, 124.0, 128.2, 132.3, 136.5, 140.6, 146.9, 153.1],
  'POLIETILENO / BOPP':            [118.2, 122.4, 126.5, 130.7, 134.8, 139.0, 143.1, 149.4, 155.6],
  'PE (SUSTITUTO DE PET) POUCH':   [120.1, 124.3, 128.4, 132.6, 136.7, 140.9, 145.0, 151.3, 157.5],
  'POLIETILENO / NYLON':           [146.8, 151.0, 155.1, 159.3, 163.4, 167.6, 171.7, 178.0, 184.2],
  'POLIETILENO / PET NATURAL':     [130.9, 135.1, 139.2, 143.4, 147.5, 151.7, 155.8, 162.1, 168.3],
  'POLIETILENO/ PET METALIZADO':   [142.0, 146.2, 150.3, 154.5, 158.6, 162.8, 166.9, 173.2, 179.4],
  'CPP/CPP':                       [118.2, 122.4, 126.5, 130.7, 134.8, 139.0, 143.1, 149.4, 155.6],
  'CPP/BOPP':                      [125.0, 129.2, 133.3, 137.5, 141.6, 145.8, 149.9, 156.2, 162.4],
  'CPP/BOPP METALIZADO':           [140.0, 144.2, 148.3, 152.5, 156.6, 160.8, 164.9, 171.2, 177.4],
  'BOPP / BOPP':                   [137.4, 141.6, 145.7, 149.9, 154.0, 158.2, 162.3, 168.6, 174.8],
  'BOPP / BOPP METALIZADO':        [152.9, 157.1, 161.2, 165.4, 169.5, 173.7, 177.8, 184.1, 190.3],
  'BOPP 15 / BOPP 15':             [138.2, 142.4, 146.5, 150.7, 154.8, 159.0, 163.1, 169.4, 175.6],
  'POLIETILENO / PET MET / BOPP NAT': [168.5, 172.7, 176.8, 181.0, 185.1, 189.3, 193.4, 199.7, 205.9],
  'POLIETILENO / PET MET / BOPP MATE': [184.2, 188.4, 192.5, 196.7, 200.8, 205.0, 209.1, 215.4, 221.6],
  'POLIETILENO / PET MET / PET NAT': [167.8, 172.0, 176.1, 180.3, 184.4, 188.6, 192.7, 199.0, 205.2],
  'POLIETILENO / PET MET / NYLON': [181.2, 185.4, 189.5, 193.7, 197.8, 202.0, 206.1, 212.4, 218.6],
};

export const COMPLEMENTOS = {
  'PIG REGULARES':      { precio: 5, unidad: 'KG' },
  'PIG ESPECIAL':       { precio: 6.5, unidad: 'KG' },
  'D2W':                { precio: 6, unidad: 'KG' },
  'TINTAS ESPECIALES':  { precio: 3.5, unidad: 'KG' },
  'PLASTAS MAYORES':    { precio: 3.5, unidad: 'KG' },
  'PCR 10%':            { precio: 3, unidad: 'KG' },
  'PCR 20%':            { precio: 6, unidad: 'KG' },
  'PCR 30%':            { precio: 9, unidad: 'KG' },
  'PCR 50%':            { precio: 12, unidad: 'KG' },
};

export const ACCESORIOS_CM = [
  { nombre: 'ZIPPER', bolseo: 0.011, poucheo: 0.02 },
  { nombre: 'INNO LOCK', bolseo: 0.04, poucheo: 0.04 },
  { nombre: 'VELCRO', bolseo: 0.02, poucheo: 0.03 },
  { nombre: 'ADHESIVO PEGA/DESPEGA', bolseo: 0.005, poucheo: null },
  { nombre: 'ADHESIVO PERMANENTE', bolseo: 0.008, poucheo: null },
  { nombre: 'ADHESIVO SEGURIDAD', bolseo: 0.035, poucheo: null },
  { nombre: 'ZIPPER PARA SLIDER', bolseo: 0.3, poucheo: null },
  { nombre: 'CANGURO', bolseo: 0.07, poucheo: null },
  { nombre: 'TYVEK', bolseo: null, poucheo: 0.28 },
];

export const ACCESORIOS_MILLAR = [
  { nombre: 'SLIDER', bolseo: 800, poucheo: 800 },
  { nombre: 'REFUERZO O ASA', bolseo: 300, poucheo: null },
  { nombre: 'PARCHE', bolseo: 340, poucheo: null },
  { nombre: 'FOLIO (INKJET)', bolseo: 200, poucheo: 200 },
  { nombre: 'FOLIO (THERMALINK)', bolseo: 350, poucheo: 350 },
  { nombre: 'VALVULA DE CAFÉ', bolseo: null, poucheo: 2000 },
  { nombre: 'VALVULA DOSIFICADORA INVIOLABLE', bolseo: null, poucheo: 1700 },
  { nombre: 'TIN-TIE', bolseo: null, poucheo: 3200 },
];

export const ACCESORIOS_KG = [
  { nombre: 'MICROPERFORACION', bolseo: 10, poucheo: 10 },
  { nombre: 'LASER', bolseo: 20, poucheo: 20 },
  { nombre: 'DIGIMARK', bolseo: 12, poucheo: 12 },
];

export const CONVERSIONES = [
  { nombre: 'EN POUCH DE TRASLAPE', precio: 350 },
  { nombre: 'EN POUCH DE 2 O 3 SELLOS', precio: 150 },
  { nombre: 'EN POUCH STAND-UP', precio: 200 },
  { nombre: 'EN POUCH DOY PACK', precio: 200 },
  { nombre: 'BOLSEO STD', precio: 50 },
  { nombre: 'BOLSEO ESPECIALIDAD', precio: 100 },
  { nombre: 'FLAT BUTTOM', precio: 600 },
  { nombre: 'WICKET', precio: 50 },
];

export const FLETE_OPTIONS = [
  'FOB PLANTA',
  'FOB CLIENTE',
  'LAREDO',
  'CLIENTE',
];

export const TIPO_OPTIONS = [
  'BOLSA',
  'POUCH',
  'ROLLO',
  'MANGA',
  'LAMINACIÓN',
];

export const CANTIDAD_UNIDAD_OPTIONS = ['MILLARES', 'PIEZAS', 'CAJAS'];

export const CALIBRE_UNITS = ['gauge', 'mm', 'mil', 'microns'];

// Conversion factors TO gauge
export function convertToGauge(value, fromUnit) {
  switch (fromUnit) {
    case 'gauge': return value;
    case 'mm': return value / 0.00025; // 1 gauge = 0.00025 mm -> gauge = mm / 0.00025
    case 'mil': return value * 100; // 1 mil = 100 gauge
    case 'microns': return value / 0.254; // 1 gauge = 0.254 microns -> gauge = microns / 0.254
    default: return value;
  }
}

export function convertFromGauge(gaugeValue, toUnit) {
  switch (toUnit) {
    case 'gauge': return gaugeValue;
    case 'mm': return gaugeValue * 0.00025;
    case 'mil': return gaugeValue / 100;
    case 'microns': return gaugeValue * 0.254;
    default: return gaugeValue;
  }
}

// Inches to CM conversion
export const INCHES_TO_CM = 2.54;
export const CM_TO_INCHES = 1 / 2.54;

export const EMPTY_COTIZACION = {
  id: '',
  registro: '',
  clienteId: '',
  noCliente: '',
  cliente: '',
  producto: '',
  tipo: '',
  cantidadValor: '',
  cantidadUnidad: 'MILLARES',
  cantidadKg: 0,
  flete: '',
  precioFlete: 0,
  idioma: 'ES',
  ancho: '',
  largo: '',
  fuelle: '',
  lengua: '',
  calibreValor: '',
  calibreUnidad: 'gauge',
  calibreGauge: 0,
  material: '',
  densidad: '',
  noTintas: 0,
  pcr: 'NO',
  pcrPct: 0,
  d2w: 'NO',
  pigmento: 'NO',
  tintaEspecial: 'NO',
  plastaMayor: 'NO',
  version: 'A',
  parentQuoteId: '',
  priceTiers: [
    { cantidad: '', precio: null },
  ],
  activeTierIndex: 0,
  subtotalMaterial: null,
  accesoriosCm: [
    { nombre: '', activo: false, precio: 0, total: 0 },
    { nombre: '', activo: false, precio: 0, total: 0 },
    { nombre: '', activo: false, precio: 0, total: 0 },
  ],
  accesoriosMillar: [
    { nombre: '', activo: false, precio: 0 },
    { nombre: '', activo: false, precio: 0 },
    { nombre: '', activo: false, precio: 0 },
  ],
  accesoriosKg: [
    { nombre: '', activo: false, precio: 0 },
    { nombre: '', activo: false, precio: 0 },
  ],
  conversion: '',
  conversionPrecio: 0,
  precioGrabadoUSD: 300,
  unidadMedida: 'CM', // 'CM' or 'IN' — independent from lang
  pesoXMillar: 0,
  precioFinal: 0,
  precioFinalUS: 0,
  precioKg: 0,
  precioKgUS: 0,
  enCajas: 'NO',
  cantidadPorCaja: '',
  numCajas: '',
  tipoCambio: 18,
  imagenes: [],
  notas: '',
  createdByRole: 'user',
  createdAt: '',
};
