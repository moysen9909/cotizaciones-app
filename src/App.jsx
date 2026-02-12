import { useState, useEffect, useCallback, useMemo } from 'react';
import { LogOut, Globe, User, Shield, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import QuoteForm from './components/QuoteForm';
import { translations } from './data/translations';
import { EMPTY_COTIZACION, MATERIAL_DENSITIES } from './data/constants';

const STORAGE_QUOTES = 'cotizaciones_data';
const STORAGE_CLIENTS = 'cotizaciones_clientes';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function load(key, fallback) {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
  catch { return fallback; }
}

export default function App() {
  const [role, setRole] = useState(null);
  const [lang, setLang] = useState('ES');
  const [quotes, setQuotes] = useState(() => {
    const data = load(STORAGE_QUOTES, []);
    // One-time migration: move all manager quotes to user visibility
    if (!localStorage.getItem('migration_manager_to_user_done')) {
      const migrated = data.map(q => q.createdByRole === 'manager' ? { ...q, createdByRole: 'user' } : q);
      localStorage.setItem('migration_manager_to_user_done', '1');
      localStorage.setItem(STORAGE_QUOTES, JSON.stringify(migrated));
      return migrated;
    }
    // One-time migration: set all existing quotes to inches
    if (!localStorage.getItem('migration_unidad_inches_done')) {
      const migrated = data.map(q => ({ ...q, unidadMedida: 'IN' }));
      localStorage.setItem('migration_unidad_inches_done', '1');
      localStorage.setItem(STORAGE_QUOTES, JSON.stringify(migrated));
      return migrated;
    }
    return data;
  });
  const [clients, setClients] = useState(() => load(STORAGE_CLIENTS, []));
  const [activeId, setActiveId] = useState(null);

  const t = translations[lang];

  useEffect(() => { localStorage.setItem(STORAGE_QUOTES, JSON.stringify(quotes)); }, [quotes]);
  useEffect(() => { localStorage.setItem(STORAGE_CLIENTS, JSON.stringify(clients)); }, [clients]);

  /* ── Client system ── */
  const addClient = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const existing = clients.find((c) => c.nombre.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    const nextNum = clients.length + 1;
    const newClient = {
      id: generateId(),
      numero: nextNum,
      nombre: trimmed,
      color: '#ADB8BB',
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [...prev, newClient]);
    return newClient;
  }, [clients]);

  const updateClient = useCallback((clientId, updates) => {
    setClients((prev) => prev.map((c) => c.id === clientId ? { ...c, ...updates } : c));
    // If name changed, update all quotes with this client
    if (updates.nombre) {
      setQuotes((prev) => prev.map((q) =>
        q.clienteId === clientId ? { ...q, cliente: updates.nombre } : q
      ));
    }
  }, []);

  const deleteClient = useCallback((clientId) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    // Unassign quotes from this client
    setQuotes((prev) => prev.map((q) =>
      q.clienteId === clientId ? { ...q, clienteId: '', cliente: '', noCliente: '' } : q
    ));
  }, []);

  /* ── Quotes ── */
  const handleNewQuote = useCallback((clientId) => {
    const client = clientId ? clients.find((c) => c.id === clientId) : null;
    const newQuote = {
      ...EMPTY_COTIZACION,
      id: generateId(),
      clienteId: client?.id || '',
      cliente: client?.nombre || '',
      noCliente: client ? String(client.numero) : '',
      createdAt: new Date().toISOString(),
      idioma: lang,
      unidadMedida: lang === 'EN' ? 'IN' : 'CM',
      createdByRole: role || 'user',
    };
    setQuotes((prev) => [newQuote, ...prev]);
    setActiveId(newQuote.id);
  }, [lang, clients, role]);

  // Manager sees all quotes; users can't see manager-created quotes
  const visibleQuotes = useMemo(() => {
    if (role === 'manager') return quotes;
    return quotes.filter((q) => q.createdByRole !== 'manager');
  }, [quotes, role]);

  const handleSaveQuote = useCallback((updatedQuote) => {
    setQuotes((prev) => prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q)));
  }, []);

  const handleDeleteQuote = useCallback((id) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    setActiveId(null);
  }, []);

  const handleDuplicateQuote = useCallback((quoteId) => {
    const original = quotes.find((q) => q.id === quoteId);
    if (!original) return;
    // Find all versions of this quote family (same parentQuoteId or same id as parent)
    const familyId = original.parentQuoteId || original.id;
    const siblings = quotes.filter((q) =>
      q.id === familyId || q.parentQuoteId === familyId
    );
    // Get next version letter
    const usedVersions = siblings.map((q) => q.version || 'A');
    let nextCharCode = 'A'.charCodeAt(0);
    usedVersions.forEach((v) => {
      const code = v.charCodeAt(0);
      if (code >= nextCharCode) nextCharCode = code + 1;
    });
    const nextVersion = String.fromCharCode(nextCharCode);

    const newQuote = {
      ...original,
      id: generateId(),
      version: nextVersion,
      parentQuoteId: familyId,
      createdAt: new Date().toISOString(),
      createdByRole: role || 'user',
    };
    // Also set parentQuoteId on original if it doesn't have one
    if (!original.parentQuoteId) {
      setQuotes((prev) => prev.map((q) =>
        q.id === original.id ? { ...q, parentQuoteId: original.id, version: q.version || 'A' } : q
      ));
    }
    setQuotes((prev) => [newQuote, ...prev]);
    setActiveId(newQuote.id);
  }, [quotes, role]);

  /* ── Excel export ── */
  const handleExportExcel = useCallback(() => {
    const rows = quotes.map((q) => ({
      Registro: q.registro,
      Versión: q.version || 'A',
      'No. Cliente': q.noCliente,
      Cliente: q.cliente,
      Producto: q.producto,
      Tipo: q.tipo,
      Cantidad: q.cantidadValor,
      Unidad: q.cantidadUnidad,
      'Cantidad KG': q.cantidadKg?.toFixed(4),
      Flete: q.flete,
      Material: q.material,
      'Calibre (gauge)': q.calibreGauge?.toFixed(1),
      'Ancho (cm)': q.ancho,
      'Largo (cm)': q.largo,
      Densidad: q.densidad,
      'No. Tintas': q.noTintas,
      'Subtotal Material': q.subtotalMaterial,
      Conversión: q.conversion,
      'Peso x Millar': q.pesoXMillar?.toFixed(4),
      'Precio Final MXN': q.precioFinal?.toFixed(2),
      'Precio Final USD': q.precioFinalUS?.toFixed(2),
      Creado: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cotizaciones');
    const clientRows = clients.map((c) => ({
      'No.': c.numero, Nombre: c.nombre,
      Cotizaciones: quotes.filter((q) => q.clienteId === c.id).length,
    }));
    const ws2 = XLSX.utils.json_to_sheet(clientRows);
    XLSX.utils.book_append_sheet(wb, ws2, 'Clientes');
    XLSX.writeFile(wb, `Cotizaciones_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [quotes, clients]);

  /* ── Excel import (Cotizador US format) ── */
  const handleImportExcel = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const SKIP = ['Lista de precios', 'COTIZADOR', 'Sheet1', 'Origen'];
        const imported = [];

        const cell = (data, r, c) => (data[r] ? data[r][c] ?? '' : '');
        const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
        const parseTintas = (v) => (v === '' || v === null || v === 'S/IMP' || v === 0) ? 0 : (parseInt(v) || 0);

        const parseCol = (data, off, sheetName, suffix) => {
          const cantVal = cell(data, 5, off + 1);
          if (cantVal === '' || cantVal === 0) return null;

          const materialName = (cell(data, 16, off + 5) || '').toString().trim();
          const cantidad = num(cell(data, 5, off + 1));
          const subtotal = num(cell(data, 23, off + 1)) || null;
          const calibreGauge = num(cell(data, 15, off + 3));
          const anchoCm = num(cell(data, 11, off + 3));
          const largoCm = num(cell(data, 12, off + 3));
          const fuelleCm = num(cell(data, 13, off + 3));
          const lenguaCm = num(cell(data, 14, off + 3));

          const convActivo = (cell(data, 32, off + 1) || '').toString().toUpperCase() === 'SI';
          const convNombre = (cell(data, 32, off + 5) || '').toString().trim();
          const convPrecio = num(cell(data, 32, off + 2));

          return {
            ...EMPTY_COTIZACION,
            id: generateId(),
            registro: sheetName + (suffix || ''),
            clienteId: '',
            noCliente: cell(data, 1, off + 1) ? String(cell(data, 1, off + 1)) : '',
            cliente: cell(data, 2, off + 1) ? String(cell(data, 2, off + 1)) : '',
            producto: cell(data, 3, off + 1) ? String(cell(data, 3, off + 1)) : '',
            tipo: (cell(data, 4, off + 1) || '').toString().toUpperCase() || '',
            cantidadValor: cantidad ? String(cantidad) : '',
            cantidadUnidad: (cell(data, 5, off + 5) || '').toString().toUpperCase().includes('PIEZA') ? 'PIEZAS' : 'MILLARES',
            cantidadKg: num(cell(data, 6, off + 1)),
            flete: (cell(data, 34, off + 1) || cell(data, 7, off + 1) || '').toString().trim(),
            precioFlete: num(cell(data, 8, off + 1)),
            idioma: 'EN',
            ancho: anchoCm ? String(anchoCm) : '',
            largo: largoCm ? String(largoCm) : '',
            fuelle: fuelleCm ? String(fuelleCm) : '',
            lengua: lenguaCm ? String(lenguaCm) : '',
            calibreValor: cell(data, 15, off + 1) ? String(cell(data, 15, off + 1)) : '',
            calibreUnidad: 'gauge',
            calibreGauge,
            material: materialName,
            densidad: MATERIAL_DENSITIES[materialName] ? String(MATERIAL_DENSITIES[materialName]) : '',
            noTintas: parseTintas(cell(data, 17, off + 1)),
            pcr: (cell(data, 18, off + 1) || '').toString().toUpperCase() === 'SI' ? 'SI' : 'NO',
            pcrPct: num(cell(data, 18, off + 2)),
            d2w: (cell(data, 19, off + 1) || '').toString().toUpperCase() === 'SI' ? 'SI' : 'NO',
            pigmento: (cell(data, 20, off + 1) || '').toString().toUpperCase() === 'SI' ? 'SI' : 'NO',
            tintaEspecial: (cell(data, 21, off + 1) || '').toString().toUpperCase() === 'SI' ? 'SI' : 'NO',
            plastaMayor: (cell(data, 22, off + 1) || '').toString().toUpperCase() === 'SI' ? 'SI' : 'NO',
            version: 'A',
            parentQuoteId: '',
            priceTiers: [{ cantidad: cantidad ? String(cantidad) : '', precio: subtotal }],
            activeTierIndex: 0,
            subtotalMaterial: subtotal,
            accesoriosCm: [24, 25, 26].map(r => ({
              nombre: (cell(data, r, off + 5) || '').toString().trim(),
              activo: (cell(data, r, off + 1) || '').toString().toUpperCase() === 'SI',
              precio: num(cell(data, r, off + 2)),
              total: num(cell(data, r, off + 3)),
            })),
            accesoriosMillar: [27, 28, 29].map(r => ({
              nombre: (cell(data, r, off + 5) || '').toString().trim(),
              activo: (cell(data, r, off + 1) || '').toString().toUpperCase() === 'SI',
              precio: num(cell(data, r, off + 2)),
            })),
            accesoriosKg: [30, 31].map(r => ({
              nombre: (cell(data, r, off + 5) || '').toString().trim(),
              activo: (cell(data, r, off + 1) || '').toString().toUpperCase() === 'SI',
              precio: num(cell(data, r, off + 2)),
            })),
            conversion: convActivo ? convNombre : '',
            conversionPrecio: convActivo ? convPrecio : 0,
            precioGrabadoUSD: 300,
            pesoXMillar: num(cell(data, 33, off + 1)),
            precioFinal: num(cell(data, 36, off + 1)),
            precioFinalUS: num(cell(data, 37, off + 1)),
            tipoCambio: 18,
            imagenes: [],
            createdByRole: 'manager',
            createdAt: new Date().toISOString(),
          };
        };

        wb.SheetNames.forEach((name) => {
          if (SKIP.includes(name)) return;
          const ws = wb.Sheets[name];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          if (!data[0] || (cell(data, 0, 1) !== 'REGISTRO' && cell(data, 0, 9) !== 'REGISTRO')) return;

          const q1 = parseCol(data, 1, name, '');
          if (q1) imported.push(q1);

          if (cell(data, 0, 9) === 'REGISTRO') {
            const q2 = parseCol(data, 9, name, ' (B)');
            if (q2) {
              q2.version = 'B';
              if (q1) { q2.parentQuoteId = q1.id; q1.parentQuoteId = q1.id; }
              imported.push(q2);
            }
          }
        });

        if (imported.length > 0) {
          setQuotes((prev) => [...imported, ...prev]);
          alert(`✅ Se importaron ${imported.length} cotizaciones`);
        } else {
          alert('No se encontraron cotizaciones en el archivo');
        }
      } catch (err) {
        console.error(err);
        alert('Error al importar: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const activeQuote = visibleQuotes.find((q) => q.id === activeId);

  if (!role) return <Login onLogin={setRole} t={t} />;

  return (
    <div className="h-screen flex flex-col bg-ivory text-noir">
      {/* Header */}
      <header className="h-14 bg-gradient-to-r from-navy to-noir flex items-center justify-between px-5 flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Multibolsas" className="h-9 object-contain drop-shadow-md" />
          <div className="hidden sm:block h-6 w-px bg-ivory/15" />
          <span className="hidden sm:block text-ivory/40 text-xs font-light tracking-widest uppercase">Cotizaciones</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang((p) => p === 'ES' ? 'EN' : 'ES')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ivory/8 hover:bg-ivory/15 rounded-lg text-xs font-medium transition-all text-ivory/90 hover:text-ivory border border-ivory/5 hover:border-ivory/15">
            <Globe className="w-3.5 h-3.5" />
            {lang === 'ES' ? 'ES / CM' : 'EN / IN'}
          </button>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            role === 'manager'
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
              : 'bg-ivory/8 border-ivory/5 text-ivory/80'
          }`}>
            {role === 'manager'
              ? <Shield className="w-3.5 h-3.5" />
              : <User className="w-3.5 h-3.5" />}
            <span>{role === 'manager' ? 'Manager' : t.usuario}</span>
          </div>
          <button onClick={() => setRole(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-500/15 rounded-lg text-xs text-mist/80 hover:text-red-300 transition-all border border-transparent hover:border-red-400/20">
            <LogOut className="w-3.5 h-3.5" /> {t.cerrarSesion}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          quotes={visibleQuotes}
          clients={clients}
          activeId={activeId}
          onSelect={setActiveId}
          onNewQuote={handleNewQuote}
          onAddClient={addClient}
          onUpdateClient={updateClient}
          onDeleteClient={deleteClient}
          onExportExcel={handleExportExcel}
          onImportExcel={handleImportExcel}
          role={role}
          t={t}
        />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-ivory to-almond/30">
          {activeQuote ? (
            <QuoteForm
              key={activeQuote.id}
              quote={activeQuote}
              clients={clients}
              onSave={handleSaveQuote}
              onDelete={handleDeleteQuote}
              onDuplicate={handleDuplicateQuote}
              onAddClient={addClient}
              role={role}
              t={t}
              lang={lang}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-mist">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-navy rounded-3xl blur-md scale-110 opacity-80" />
                <div className="relative bg-navy rounded-2xl px-10 py-6">
                  <img src="/logo.png" alt="Multibolsas" className="h-16 opacity-90" />
                </div>
              </div>
              <p className="text-xl font-light text-noir/50 tracking-wide">{t.seleccionaCotizacion}</p>
              <p className="text-sm mt-3 text-mist/70 font-light">{t.agregaClienteInicio}</p>
              <div className="mt-8 flex items-center gap-2 text-xs text-mist/40">
                <div className="w-8 h-px bg-mist/20" />
                <span>Multibolsas Plásticas</span>
                <div className="w-8 h-px bg-mist/20" />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
