import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Save, Trash2, Lock, Unlock, Globe, ImagePlus, X, EyeOff, FileDown, Copy, Plus, Minus } from 'lucide-react';
import {
  MATERIALS, MATERIAL_DENSITIES, PRICE_LIST,
  TIPO_OPTIONS, CANTIDAD_UNIDAD_OPTIONS, FLETE_OPTIONS,
  CALIBRE_UNITS, convertToGauge, convertFromGauge,
  INCHES_TO_CM, CM_TO_INCHES,
  ACCESORIOS_CM, ACCESORIOS_MILLAR, ACCESORIOS_KG,
  CONVERSIONES, COMPLEMENTOS,
} from '../data/constants';
import { generateQuotePDF } from '../utils/generatePDF';
import { DROPDOWN_LABELS } from '../data/translations';

/* ── Reusable sub-components ── */

function SelectField({ label, value, onChange, options, disabled, error }) {
  return (
    <div>
      <label className={`block text-[11px] font-semibold mb-1.5 uppercase tracking-wider ${error ? 'text-red-500' : 'text-navy/50'}`}>{label}{error && ' *'}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className={`w-full px-3 py-2.5 bg-white border rounded-xl text-noir text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/30 disabled:opacity-50 disabled:cursor-not-allowed appearance-none transition-all shadow-sm ${error ? 'border-red-400 ring-1 ring-red-200' : 'border-almond hover:border-mist/50'}`}>
        <option value="">--</option>
        {options.map((opt) => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', disabled, readOnly, suffix, error }) {
  return (
    <div>
      <label className={`block text-[11px] font-semibold mb-1.5 uppercase tracking-wider ${error ? 'text-red-500' : 'text-navy/50'}`}>{label}{error && ' *'}</label>
      <div className="relative">
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} readOnly={readOnly}
          className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm ${
            readOnly ? 'bg-almond/40 border-almond text-mist cursor-not-allowed' : error ? 'bg-white border-red-400 ring-1 ring-red-200 text-noir' : 'bg-white border-almond hover:border-mist/50 text-noir'
          }`} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-mist/70 uppercase">{suffix}</span>}
      </div>
    </div>
  );
}

function ToggleField({ label, value, onChange, tSi, tNo }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-navy/50 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex gap-0.5 bg-almond/50 rounded-xl p-0.5">
        <button type="button" onClick={() => onChange('SI')}
          className={`flex-1 py-2 text-xs rounded-lg font-semibold transition-all ${value === 'SI' ? 'bg-emerald-500 text-white shadow-sm' : 'text-mist hover:text-noir hover:bg-white/50'}`}>
          {tSi}
        </button>
        <button type="button" onClick={() => onChange('NO')}
          className={`flex-1 py-2 text-xs rounded-lg font-semibold transition-all ${value === 'NO' ? 'bg-red-400 text-white shadow-sm' : 'text-mist hover:text-noir hover:bg-white/50'}`}>
          {tNo}
        </button>
      </div>
    </div>
  );
}

function PriceField({ label, value, readOnly, onChange, isManager, type = 'number', suffix }) {
  if (!isManager) {
    return (
      <div>
        <label className="block text-[11px] font-semibold text-navy/50 mb-1.5 uppercase tracking-wider">{label}</label>
        <div className="w-full px-3 py-2.5 bg-almond/30 border border-almond rounded-xl text-sm text-mist/60 flex items-center gap-1.5 shadow-sm">
          <EyeOff className="w-3.5 h-3.5" /> <span className="tracking-widest">***</span>
        </div>
      </div>
    );
  }
  return <InputField label={label} value={value} onChange={onChange} type={type} readOnly={readOnly} suffix={suffix} />;
}

/* ── Main Component ── */

export default function QuoteForm({ quote, clients, onSave, onDelete, onDuplicate, onAddClient, role, t, lang }) {
  const [form, setForm] = useState(quote);
  const [previewImg, setPreviewImg] = useState(null);
  const [newClientInput, setNewClientInput] = useState('');
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const isManager = role === 'manager';

  const tipoOpts = useMemo(() => TIPO_OPTIONS.map(v => ({ value: v, label: DROPDOWN_LABELS.tipo[lang]?.[v] || v })), [lang]);
  const fleteOpts = useMemo(() => FLETE_OPTIONS.map(v => ({ value: v, label: DROPDOWN_LABELS.flete[lang]?.[v] || v })), [lang]);
  const unidadOpts = useMemo(() => CANTIDAD_UNIDAD_OPTIONS.map(v => ({ value: v, label: DROPDOWN_LABELS.cantidadUnidad[lang]?.[v] || v })), [lang]);
  const convOpts = useMemo(() => CONVERSIONES.map(c => ({
    value: c.nombre,
    label: isManager
      ? `${DROPDOWN_LABELS.conversiones[lang]?.[c.nombre] || c.nombre} ($${c.precio})`
      : DROPDOWN_LABELS.conversiones[lang]?.[c.nombre] || c.nombre,
  })), [lang, isManager]);

  useEffect(() => { setForm(quote); }, [quote]);
  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.cantidadValor || parseFloat(form.cantidadValor) <= 0) e.cantidadValor = true;
    if (!form.ancho || parseFloat(form.ancho) <= 0) e.ancho = true;
    if (!form.largo || parseFloat(form.largo) <= 0) e.largo = true;
    if (!form.calibreValor || parseFloat(form.calibreValor) <= 0) e.calibreValor = true;
    if (!form.clienteId) e.clienteId = true;
    if (!form.tipo) e.tipo = true;
    if (!form.material) e.material = true;
    if (form.noTintas === undefined || form.noTintas === '' || parseInt(form.noTintas) < 0) e.noTintas = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Image handlers ──
  const handleImageUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev) => ({ ...prev,
          imagenes: [...(prev.imagenes || []), { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: file.name, data: ev.target.result }],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };
  const removeImage = (imgId) => {
    setForm((prev) => ({ ...prev, imagenes: (prev.imagenes || []).filter((img) => img.id !== imgId) }));
    if (previewImg === imgId) setPreviewImg(null);
  };

  useEffect(() => {
    if (form.material && MATERIAL_DENSITIES[form.material])
      setForm((prev) => ({ ...prev, densidad: MATERIAL_DENSITIES[prev.material] || '' }));
  }, [form.material]);

  useEffect(() => {
    if (form.calibreValor && form.calibreUnidad) {
      const g = convertToGauge(parseFloat(form.calibreValor) || 0, form.calibreUnidad);
      setForm((prev) => ({ ...prev, calibreGauge: g }));
    }
  }, [form.calibreValor, form.calibreUnidad]);

  const isInches = (form.unidadMedida || 'CM') === 'IN';
  const getAnchoCm  = () => { const v = parseFloat(form.ancho)  || 0; return isInches ? v * INCHES_TO_CM : v; };
  const getLargoCm  = () => { const v = parseFloat(form.largo)  || 0; return isInches ? v * INCHES_TO_CM : v; };
  const getFuelleCm = () => { const v = parseFloat(form.fuelle) || 0; return isInches ? v * INCHES_TO_CM : v; };
  const getLenguaCm = () => { const v = parseFloat(form.lengua) || 0; return isInches ? v * INCHES_TO_CM : v; };

  useEffect(() => {
    const anchoCm = getAnchoCm(), largoCm = getLargoCm(), fuelleCm = getFuelleCm(), lenguaCm = getLenguaCm();
    const calibreGauge = form.calibreGauge || 0;
    const densidad = parseFloat(form.densidad) || 1;
    // Peso x Millar = ancho × (largo + fuelle + (lengua / 2)) × (calibre / 20000) × densidad
    const pesoMillarKg = anchoCm * (largoCm + fuelleCm + (lenguaCm / 2)) * (calibreGauge / 20000) * densidad;
    const cantidadVal = parseFloat(form.cantidadValor) || 0;
    let totalPiezas = cantidadVal;
    if (form.cantidadUnidad === 'MILLARES') totalPiezas = cantidadVal * 1000;
    else if (form.cantidadUnidad === 'CAJAS') totalPiezas = cantidadVal * (parseFloat(form.cantidadPorCaja) || 0);
    const cantidadKg = pesoMillarKg * totalPiezas / 1000;
    setForm((prev) => ({ ...prev, pesoXMillar: pesoMillarKg, cantidadKg }));
  }, [form.ancho, form.largo, form.fuelle, form.lengua, form.calibreGauge, form.densidad, form.cantidadValor, form.cantidadUnidad, form.cantidadPorCaja, form.unidadMedida]);

  // Sync subtotalMaterial from active tier
  useEffect(() => {
    const tiers = form.priceTiers || [{ cantidad: '', precio: null }];
    const idx = form.activeTierIndex || 0;
    const activeTier = tiers[idx];
    if (activeTier && activeTier.precio !== null && activeTier.precio !== undefined) {
      const precio = parseFloat(activeTier.precio);
      if (!isNaN(precio) && precio !== form.subtotalMaterial) {
        setForm((prev) => ({ ...prev, subtotalMaterial: precio }));
      }
    }
  }, [form.priceTiers, form.activeTierIndex]);

  useEffect(() => {
    const subtotalMat = parseFloat(form.subtotalMaterial) || 0;
    const pesoMillar = form.pesoXMillar || 0;
    let precioBase = subtotalMat * pesoMillar;
    if (form.pcr === 'SI') { const k = `PCR ${form.pcrPct || 10}%`; if (COMPLEMENTOS[k]) precioBase += COMPLEMENTOS[k].precio * pesoMillar; }
    if (form.d2w === 'SI') precioBase += COMPLEMENTOS['D2W'].precio * pesoMillar;
    if (form.pigmento === 'SI') precioBase += COMPLEMENTOS['PIG REGULARES'].precio * pesoMillar;
    if (form.tintaEspecial === 'SI') precioBase += COMPLEMENTOS['TINTAS ESPECIALES'].precio * pesoMillar;
    if (form.plastaMayor === 'SI') precioBase += COMPLEMENTOS['PLASTAS MAYORES'].precio * pesoMillar;
    let accCmTotal = 0, accMillarTotal = 0, accKgTotal = 0;
    (form.accesoriosCm || []).forEach((a) => { if (a.activo && a.nombre) accCmTotal += (parseFloat(a.precio) || 0) * getAnchoCm() * 1000; });
    (form.accesoriosMillar || []).forEach((a) => { if (a.activo && a.nombre) accMillarTotal += parseFloat(a.precio) || 0; });
    (form.accesoriosKg || []).forEach((a) => { if (a.activo && a.nombre) accKgTotal += (parseFloat(a.precio) || 0) * pesoMillar; });
    let conversionTotal = 0;
    if (form.conversion) { const c = CONVERSIONES.find((x) => x.nombre === form.conversion); if (c) conversionTotal = c.precio; }
    const precioFinal = precioBase + accCmTotal + accMillarTotal + accKgTotal + conversionTotal;
    const tc = parseFloat(form.tipoCambio) || 18;
    // Precio por KG for ROLLO/PELICULA: subtotal + complementos per kg (no accessories/conversion)
    const precioKg = subtotalMat + (form.pcr === 'SI' ? (COMPLEMENTOS[`PCR ${form.pcrPct || 10}%`]?.precio || 0) : 0)
      + (form.d2w === 'SI' ? COMPLEMENTOS['D2W'].precio : 0)
      + (form.pigmento === 'SI' ? COMPLEMENTOS['PIG REGULARES'].precio : 0)
      + (form.tintaEspecial === 'SI' ? COMPLEMENTOS['TINTAS ESPECIALES'].precio : 0)
      + (form.plastaMayor === 'SI' ? COMPLEMENTOS['PLASTAS MAYORES'].precio : 0);
    setForm((prev) => ({ ...prev, precioFinal, precioFinalUS: precioFinal / tc, precioKg, precioKgUS: precioKg / tc }));
  }, [form.subtotalMaterial, form.pesoXMillar, form.cantidadKg, form.cantidadValor,
      form.pcr, form.pcrPct, form.d2w, form.pigmento, form.tintaEspecial, form.plastaMayor,
      form.accesoriosCm, form.accesoriosMillar, form.accesoriosKg, form.conversion, form.tipoCambio, form.unidadMedida]);

  const handleAccCmChange = (i, field, value) => {
    setForm((prev) => {
      const a = [...prev.accesoriosCm]; a[i] = { ...a[i], [field]: value };
      if (field === 'nombre') { const f = ACCESORIOS_CM.find((x) => x.nombre === value); if (f) { a[i].precio = f.bolseo; a[i].activo = true; } }
      return { ...prev, accesoriosCm: a };
    });
  };
  const handleAccMillarChange = (i, field, value) => {
    setForm((prev) => {
      const a = [...prev.accesoriosMillar]; a[i] = { ...a[i], [field]: value };
      if (field === 'nombre') { const f = ACCESORIOS_MILLAR.find((x) => x.nombre === value); if (f) { a[i].precio = f.bolseo || f.poucheo || 0; a[i].activo = true; } }
      return { ...prev, accesoriosMillar: a };
    });
  };
  const handleAccKgChange = (i, field, value) => {
    setForm((prev) => {
      const a = [...prev.accesoriosKg]; a[i] = { ...a[i], [field]: value };
      if (field === 'nombre') { const f = ACCESORIOS_KG.find((x) => x.nombre === value); if (f) { a[i].precio = f.bolseo; a[i].activo = true; } }
      return { ...prev, accesoriosKg: a };
    });
  };

  // ── Price tier handlers ──
  const addTier = () => {
    setForm((prev) => ({
      ...prev,
      priceTiers: [...(prev.priceTiers || []), { cantidad: '', precio: null }],
    }));
  };
  const removeTier = (idx) => {
    setForm((prev) => {
      const tiers = [...(prev.priceTiers || [])];
      if (tiers.length <= 1) return prev;
      tiers.splice(idx, 1);
      const newActiveIdx = prev.activeTierIndex >= tiers.length ? tiers.length - 1 : prev.activeTierIndex;
      return { ...prev, priceTiers: tiers, activeTierIndex: newActiveIdx };
    });
  };
  const updateTier = (idx, field, value) => {
    setForm((prev) => {
      const tiers = [...(prev.priceTiers || [])];
      tiers[idx] = { ...tiers[idx], [field]: value };
      return { ...prev, priceTiers: tiers };
    });
  };
  const selectTier = (idx) => {
    const tiers = form.priceTiers || [];
    const tier = tiers[idx];
    if (tier) {
      setForm((prev) => ({
        ...prev,
        activeTierIndex: idx,
        subtotalMaterial: tier.precio !== null ? parseFloat(tier.precio) : prev.subtotalMaterial,
        cantidadValor: tier.cantidad || prev.cantidadValor,
      }));
    }
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, updatedAt: new Date().toISOString() });
  };
  const handleDownloadPDF = (pdfLang) => {
    if (!validate()) return;
    generateQuotePDF(form, isManager, pdfLang);
  };
  const handleDuplicate = () => { handleSave(); if (Object.keys(errors).length === 0) onDuplicate(form.id); };

  const sectionClass = "bg-white rounded-2xl p-6 border border-almond/80 shadow-sm hover:shadow-md transition-shadow";
  const headingClass = "text-xs font-bold text-navy/70 mb-5 uppercase tracking-[0.15em] flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-almond";

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-ivory">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-6 py-4 border border-almond/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center text-ivory font-bold text-lg shadow-sm">
              {form.version || 'A'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy tracking-tight">
                {form.registro || `${t.cotizacion || 'Cotización'} ${form.id?.slice(-4) || ''}`}
              </h2>
              <p className="text-xs text-mist mt-0.5">
                {form.cliente ? `${form.cliente} ${form.noCliente ? `· #${form.noCliente}` : ''}` : ''}
                {form.cliente ? ' · ' : ''}{t.version} {form.version || 'A'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDuplicate} title={lang === 'EN' ? 'Duplicate quote (new version)' : 'Duplicar cotización (nueva versión)'}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-50 to-amber-50/50 hover:from-amber-100 hover:to-amber-50 text-amber-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-all border border-amber-200 hover:border-amber-300 shadow-sm">
              <Copy className="w-4 h-4" /> {t.duplicar}
            </button>
            <div className="flex rounded-xl border border-navy/15 overflow-hidden shadow-sm">
              <button onClick={() => handleDownloadPDF('ES')}
                className="px-3 py-2.5 bg-gradient-to-r from-navy/10 to-navy/5 hover:from-navy/20 hover:to-navy/10 text-navy text-sm font-medium flex items-center gap-1.5 transition-all border-r border-navy/15">
                <FileDown className="w-4 h-4" /> ES
              </button>
              <button onClick={() => handleDownloadPDF('EN')}
                className="px-3 py-2.5 bg-gradient-to-r from-navy/10 to-navy/5 hover:from-navy/20 hover:to-navy/10 text-navy text-sm font-medium flex items-center gap-1.5 transition-all">
                <FileDown className="w-4 h-4" /> EN
              </button>
            </div>
            <button onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-navy to-navy/90 hover:from-navy/95 hover:to-navy/85 text-ivory rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-navy/20 hover:shadow-lg hover:shadow-navy/30">
              <Save className="w-4 h-4" /> {t.guardar}
            </button>
            {onDelete && (
              <button onClick={() => onDelete(form.id)}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-medium flex items-center gap-2 transition-all border border-red-100 hover:border-red-200">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Validation error banner */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm animate-pulse">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="text-red-500 font-bold text-sm">!</span>
            </div>
            <p className="text-sm text-red-600 font-medium">
              {lang === 'EN' ? 'Please fill in all required fields (marked in red) to save or generate the quote.' : 'Llena todos los campos obligatorios (marcados en rojo) para guardar o generar la cotización.'}
            </p>
          </div>
        )}

        {/* Basic Info */}
        <div className={sectionClass}>
          <h3 className={headingClass}>{t.infoGeneral}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label={t.registro} value={form.registro} onChange={(v) => update('registro', v)} />
            {/* Cliente selector */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${errors.clienteId ? 'text-red-500' : 'text-mist'}`}>{t.cliente}{errors.clienteId ? ' *' : ''}</label>
              <select value={form.clienteId || ''}
                onChange={(e) => {
                  const cid = e.target.value;
                  const c = clients.find((x) => x.id === cid);
                  setForm((prev) => ({ ...prev, clienteId: c?.id || '', cliente: c?.nombre || '', noCliente: c ? String(c.numero) : '' }));
                  setErrors((prev) => ({ ...prev, clienteId: false }));
                }}
                className={`w-full px-3 py-2 bg-almond border rounded-lg text-noir text-sm focus:outline-none focus:ring-2 focus:ring-navy/50 appearance-none ${errors.clienteId ? 'border-red-400 ring-1 ring-red-200' : 'border-mist/30'}`}>
                <option value="">{t.seleccionarCliente}</option>
                {clients.map((c) => <option key={c.id} value={c.id}>#{c.numero} — {c.nombre}</option>)}
              </select>
              <div className="flex gap-1 mt-1.5">
                <input type="text" value={newClientInput} onChange={(e) => setNewClientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newClientInput.trim()) {
                      const c = onAddClient(newClientInput.trim());
                      if (c) { setForm((prev) => ({ ...prev, clienteId: c.id, cliente: c.nombre, noCliente: String(c.numero) })); setNewClientInput(''); }
                    }
                  }}
                  placeholder={t.nuevoCliente}
                  className="flex-1 px-2 py-1 bg-ivory border border-mist/30 rounded text-xs text-noir placeholder-mist/50 focus:outline-none focus:ring-1 focus:ring-navy/30" />
                {newClientInput.trim() && (
                  <button type="button" onClick={() => {
                    const c = onAddClient(newClientInput.trim());
                    if (c) { setForm((prev) => ({ ...prev, clienteId: c.id, cliente: c.nombre, noCliente: String(c.numero) })); setNewClientInput(''); }
                  }} className="px-2 py-1 bg-navy hover:bg-navy/80 text-ivory rounded text-xs">+</button>
                )}
              </div>
            </div>
            <InputField label={t.noCliente} value={form.noCliente ? `#${form.noCliente}` : 'Auto'} readOnly onChange={() => {}} />
            <InputField label={t.producto} value={form.producto} onChange={(v) => update('producto', v)} />
            <SelectField label={t.tipo} value={form.tipo} onChange={(v) => update('tipo', v)} options={tipoOpts} error={errors.tipo} />
            <div className="grid grid-cols-2 gap-2">
              <InputField label={t.cantidad} value={form.cantidadValor} onChange={(v) => update('cantidadValor', v)} type="number" error={errors.cantidadValor} />
              <SelectField label={t.unidad} value={form.cantidadUnidad} onChange={(v) => update('cantidadUnidad', v)} options={unidadOpts} />
            </div>
            <InputField label={t.cantidadKg} value={form.cantidadKg?.toFixed(4) || '0'} readOnly onChange={() => {}} />
            {form.cantidadUnidad === 'CAJAS' && (
              <InputField label={t.piezasPorCaja} value={form.cantidadPorCaja} onChange={(v) => update('cantidadPorCaja', v)} type="number" />
            )}
            {form.cantidadUnidad === 'CAJAS' && form.cantidadPorCaja > 0 && form.cantidadValor > 0 && (
              <InputField label={t.totalPiezas} value={
                (parseFloat(form.cantidadValor) || 0) * (parseFloat(form.cantidadPorCaja) || 0)
              } readOnly onChange={() => {}} />
            )}
            <SelectField label={t.flete} value={form.flete} onChange={(v) => update('flete', v)} options={fleteOpts} />
            <PriceField label={t.precioFlete} value={form.precioFlete} readOnly isManager={isManager} onChange={() => {}} />
          </div>
        </div>

        {/* Imágenes */}
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-5">
            <h3 className={headingClass + ' mb-0 flex-1'}>{t.imagenes}</h3>
            <button onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-gradient-to-r from-navy to-navy/90 hover:from-navy/95 text-ivory rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
              <ImagePlus className="w-3.5 h-3.5" /> {t.agregar}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </div>
          {(!form.imagenes || form.imagenes.length === 0) ? (
            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-mist/30 rounded-2xl p-10 text-center cursor-pointer hover:border-navy/40 hover:bg-almond/30 transition-all group">
              <ImagePlus className="w-12 h-12 text-mist/30 mx-auto mb-3 group-hover:text-navy/40 transition-colors" />
              <p className="text-sm text-mist/70 font-medium">{t.clickAgregarImg}</p>
              <p className="text-xs text-mist/40 mt-1">PNG, JPG, WEBP</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {form.imagenes.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.data} alt={img.name} onClick={() => setPreviewImg(previewImg === img.id ? null : img.id)}
                    className="w-full h-32 object-cover rounded-lg border border-almond cursor-pointer hover:border-navy transition-colors" />
                  <button onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-mist mt-1 truncate">{img.name}</p>
                </div>
              ))}
              <div onClick={() => fileInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-mist/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-navy/50 hover:bg-almond/50 transition-colors">
                <ImagePlus className="w-6 h-6 text-mist/50" />
                <span className="text-xs text-mist/50 mt-1">{t.agregar}</span>
              </div>
            </div>
          )}
          {previewImg && form.imagenes && (() => {
            const img = form.imagenes.find((i) => i.id === previewImg);
            if (!img) return null;
            return (
              <div className="mt-4 relative">
                <img src={img.data} alt={img.name} className="max-w-full max-h-96 rounded-lg border border-almond mx-auto" />
                <button onClick={() => setPreviewImg(null)}
                  className="absolute top-2 right-2 bg-noir/80 hover:bg-noir text-ivory rounded-full w-8 h-8 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })()}
        </div>

        {/* Notes */}
        <div className={sectionClass}>
          <h3 className={headingClass}>{t.notas}</h3>
          <textarea
            value={form.notas || ''}
            onChange={(e) => update('notas', e.target.value)}
            placeholder={t.notasPlaceholder}
            rows={3}
            className="w-full px-4 py-3 bg-white border border-almond hover:border-mist/50 rounded-xl text-sm text-noir placeholder-mist/40 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/30 transition-all shadow-sm resize-y"
          />
        </div>

        {/* Dimensions */}
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={headingClass + ' mb-0'}>{t.dimensionesSection}</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-mist/60 uppercase tracking-wider mr-1">{t.unidadMedida}</span>
              <div className="flex gap-0.5 bg-almond/50 rounded-lg p-0.5">
                <button type="button" onClick={() => update('unidadMedida', 'CM')}
                  className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-all ${!isInches ? 'bg-navy text-ivory shadow-sm' : 'text-mist hover:text-noir hover:bg-white/50'}`}>
                  CM
                </button>
                <button type="button" onClick={() => update('unidadMedida', 'IN')}
                  className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-all ${isInches ? 'bg-navy text-ivory shadow-sm' : 'text-mist hover:text-noir hover:bg-white/50'}`}>
                  IN
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputField label={t.ancho} value={form.ancho} onChange={(v) => update('ancho', v)} type="number" suffix={isInches ? 'in' : 'cm'} error={errors.ancho} />
            <InputField label={t.largo} value={form.largo} onChange={(v) => update('largo', v)} type="number" suffix={isInches ? 'in' : 'cm'} error={errors.largo} />
            <InputField label={t.fuelle} value={form.fuelle} onChange={(v) => update('fuelle', v)} type="number" suffix={isInches ? 'in' : 'cm'} />
            <InputField label={t.lengua} value={form.lengua} onChange={(v) => update('lengua', v)} type="number" suffix={isInches ? 'in' : 'cm'} />
          </div>
          {isInches && (form.ancho || form.largo) && (
            <div className="mt-3 p-2 bg-navy/5 rounded-lg text-xs text-navy">
              → {t.ancho}: {getAnchoCm().toFixed(2)} cm | {t.largo}: {getLargoCm().toFixed(2)} cm
              {form.fuelle ? ` | ${t.fuelle}: ${getFuelleCm().toFixed(2)} cm` : ''}{form.lengua ? ` | ${t.lengua}: ${getLenguaCm().toFixed(2)} cm` : ''}
            </div>
          )}
        </div>

        {/* Calibre & Material */}
        <div className={sectionClass}>
          <h3 className={headingClass}>{t.calibreMaterial}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid grid-cols-2 gap-2">
              <InputField label={t.calibre} value={form.calibreValor} onChange={(v) => update('calibreValor', v)} type="number" error={errors.calibreValor} />
              <SelectField label={t.unidad} value={form.calibreUnidad} onChange={(v) => update('calibreUnidad', v)} options={CALIBRE_UNITS} />
            </div>
            {form.calibreValor && form.calibreUnidad !== 'gauge' && (
              <InputField label={t.igualGauge} value={form.calibreGauge?.toFixed(1) || '0'} readOnly onChange={() => {}} />
            )}
            <SelectField label={t.material} value={form.material} onChange={(v) => update('material', v)} options={MATERIALS} error={errors.material} />
            <InputField label={t.densidad} value={form.densidad} onChange={(v) => update('densidad', v)} type="number" />
            <InputField label={t.noTintas} value={form.noTintas} onChange={(v) => update('noTintas', parseInt(v) || 0)} type="number" error={errors.noTintas} />
          </div>
          {form.calibreGauge > 0 && (form.calibreGauge < 100 || form.calibreGauge > 600) && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">{t.rangoRecomendado}: 100-600 {t.gauge} ({t.actual}: {form.calibreGauge.toFixed(1)})</div>
          )}
        </div>

        {/* Complementos */}
        <div className={sectionClass}>
          <h3 className={headingClass}>{t.complementos}</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ToggleField label={t.pcr} value={form.pcr} onChange={(v) => update('pcr', v)} tSi={t.si} tNo={t.no} />
            {form.pcr === 'SI' && <SelectField label="PCR %" value={form.pcrPct} onChange={(v) => update('pcrPct', parseInt(v) || 0)} options={[{value:10,label:'10%'},{value:20,label:'20%'},{value:30,label:'30%'},{value:50,label:'50%'}]} />}
            <ToggleField label={t.d2w} value={form.d2w} onChange={(v) => update('d2w', v)} tSi={t.si} tNo={t.no} />
            <ToggleField label={t.pigmento} value={form.pigmento} onChange={(v) => update('pigmento', v)} tSi={t.si} tNo={t.no} />
            <ToggleField label={t.tintaEspecial} value={form.tintaEspecial} onChange={(v) => update('tintaEspecial', v)} tSi={t.si} tNo={t.no} />
            <ToggleField label={t.plastaMayor} value={form.plastaMayor} onChange={(v) => update('plastaMayor', v)} tSi={t.si} tNo={t.no} />
          </div>
        </div>

        {/* Subtotal Material — Price Tiers */}
        <div className={`rounded-2xl p-6 border shadow-sm transition-shadow hover:shadow-md ${isManager ? 'bg-gradient-to-br from-emerald-50 to-emerald-50/50 border-emerald-200/70' : 'bg-white border-almond/80'}`}>
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-navy/70 uppercase tracking-[0.15em] flex-1">{t.subtotalMaterial}</h3>
            {isManager
              ? <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium"><Unlock className="w-3.5 h-3.5" /> {t.editable}</div>
              : <div className="flex items-center gap-1.5 text-xs text-mist"><Lock className="w-3.5 h-3.5" /> {t.bloqueado}</div>}
          </div>

          {isManager ? (
            <div className="mt-4 space-y-2">
              {(form.priceTiers || [{ cantidad: '', precio: null }]).map((tier, idx) => {
                const isActive = idx === (form.activeTierIndex || 0);
                return (
                  <div key={idx}
                    onClick={() => selectTier(idx)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isActive
                        ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                        : 'border-almond/50 bg-white hover:border-mist/50'
                    }`}>
                    {/* Radio indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'border-emerald-500' : 'border-mist/40'
                    }`}>
                      {isActive && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                    </div>
                    {/* Cantidad */}
                    <div className="flex-1">
                      <label className="block text-[10px] text-mist/60 uppercase tracking-wider mb-0.5">{t.cantidadMillares}</label>
                      <input type="number" value={tier.cantidad}
                        onChange={(e) => updateTier(idx, 'cantidad', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={`${t.ejemplo}: 100`}
                        className="w-full px-3 py-2 bg-white border border-almond rounded-lg text-sm text-noir focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                    </div>
                    {/* Precio */}
                    <div className="flex-1">
                      <label className="block text-[10px] text-mist/60 uppercase tracking-wider mb-0.5">{t.precioKgLabel}</label>
                      <input type="number" value={tier.precio ?? ''}
                        onChange={(e) => updateTier(idx, 'precio', e.target.value === '' ? null : parseFloat(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="0.00"
                        className={`w-full px-3 py-2 border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
                          isActive ? 'bg-white border-emerald-300 text-emerald-700' : 'bg-white border-almond text-noir'
                        }`} />
                    </div>
                    {/* Calculated precio final for this tier */}
                    {tier.precio && form.pesoXMillar > 0 && (
                      <div className="text-right flex-shrink-0 min-w-[80px]">
                        <label className="block text-[10px] text-mist/60 uppercase tracking-wider mb-0.5">{t.dolarMillar}</label>
                        <div className={`text-sm font-bold ${isActive ? 'text-emerald-600' : 'text-noir/60'}`}>
                          ${(parseFloat(tier.precio) * form.pesoXMillar).toFixed(2)}
                        </div>
                      </div>
                    )}
                    {/* Remove tier */}
                    {(form.priceTiers || []).length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); removeTier(idx); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-mist hover:text-red-500 transition-colors flex-shrink-0">
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
              <button onClick={addTier}
                className="w-full py-2.5 border-2 border-dashed border-emerald-300/50 hover:border-emerald-400 rounded-xl text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> {t.agregarPrecioCantidad}
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-4">
              <div className="w-52 px-4 py-3.5 bg-almond/30 border border-almond rounded-xl text-xl font-bold text-mist/50 flex items-center gap-2">
                <EyeOff className="w-5 h-5" /> <span className="tracking-widest">***</span>
              </div>
              <span className="text-xs text-mist/70">{t.soloManager}</span>
            </div>
          )}
        </div>

        {/* Accesorios CM */}
        <div className={sectionClass}>
          <h3 className={headingClass}>{t.accesorioCm}</h3>
          {(form.accesoriosCm || []).map((acc, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 mb-2">
              <SelectField label={`${t.accesorioCm} ${i+1}`} value={acc.nombre} onChange={(v) => handleAccCmChange(i,'nombre',v)} options={ACCESORIOS_CM.map(a=>a.nombre)} />
              <ToggleField label={t.activo} value={acc.activo?'SI':'NO'} onChange={(v)=>handleAccCmChange(i,'activo',v==='SI')} tSi={t.si} tNo={t.no} />
              <PriceField label={t.precio} value={acc.precio} isManager={isManager} onChange={(v)=>handleAccCmChange(i,'precio',parseFloat(v)||0)} />
              <PriceField label={t.total} value={acc.activo&&acc.precio?(acc.precio*getAnchoCm()*1000).toFixed(2):'0'} readOnly isManager={isManager} onChange={()=>{}} />
            </div>
          ))}
        </div>

        {/* Accesorios Millar */}
        <div className={sectionClass}>
          <h3 className={headingClass}>{t.accesorioMillar}</h3>
          {(form.accesoriosMillar || []).map((acc, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 mb-2">
              <SelectField label={`${t.accesorioMillar} ${i+1}`} value={acc.nombre} onChange={(v)=>handleAccMillarChange(i,'nombre',v)} options={ACCESORIOS_MILLAR.map(a=>a.nombre)} />
              <ToggleField label={t.activo} value={acc.activo?'SI':'NO'} onChange={(v)=>handleAccMillarChange(i,'activo',v==='SI')} tSi={t.si} tNo={t.no} />
              <PriceField label={t.dolarMillar} value={acc.precio} isManager={isManager} onChange={(v)=>handleAccMillarChange(i,'precio',parseFloat(v)||0)} />
            </div>
          ))}
        </div>

        {/* Accesorios KG */}
        <div className={sectionClass}>
          <h3 className={headingClass}>{t.accesorioKg}</h3>
          {(form.accesoriosKg || []).map((acc, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 mb-2">
              <SelectField label={`${t.accesorioKg} ${i+1}`} value={acc.nombre} onChange={(v)=>handleAccKgChange(i,'nombre',v)} options={ACCESORIOS_KG.map(a=>a.nombre)} />
              <ToggleField label={t.activo} value={acc.activo?'SI':'NO'} onChange={(v)=>handleAccKgChange(i,'activo',v==='SI')} tSi={t.si} tNo={t.no} />
              <PriceField label={t.dolarKg} value={acc.precio} isManager={isManager} onChange={(v)=>handleAccKgChange(i,'precio',parseFloat(v)||0)} />
            </div>
          ))}
        </div>

        {/* Conversión */}
        <div className={sectionClass}>
          <h3 className={headingClass}>{t.conversion}</h3>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label={t.conversion} value={form.conversion}
              onChange={(v) => { const conv = CONVERSIONES.find(c=>c.nombre===v); update('conversion',v); if(conv) update('conversionPrecio',conv.precio); }}
              options={convOpts} />
            <PriceField label={t.dolarMillar} value={form.conversionPrecio||0} readOnly isManager={isManager} onChange={()=>{}} />
          </div>
        </div>

        {/* Grabados */}
        <div className={sectionClass}>
          <h3 className={headingClass}>{t.grabados}</h3>
          {(() => {
            const tintas = parseInt(form.noTintas) || 0;
            const precioGrabadoUSD = parseFloat(form.precioGrabadoUSD) || 300;
            const tc = parseFloat(form.tipoCambio) || 18;
            const totalGrabadoUSD = precioGrabadoUSD * tintas;
            const totalGrabadoMXN = totalGrabadoUSD * tc;
            return (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-navy/50 mb-1.5 uppercase tracking-wider">{t.noTintas}</label>
                    <div className="px-3 py-2.5 bg-almond/40 border border-almond rounded-xl text-sm font-bold text-navy">{tintas}</div>
                  </div>
                  {isManager ? (
                    <InputField label={t.precioColor} value={form.precioGrabadoUSD ?? 300}
                      onChange={(v) => update('precioGrabadoUSD', parseFloat(v) || 0)} type="number" suffix="USD" />
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-navy/50 mb-1.5 uppercase tracking-wider">{t.precioColor}</label>
                      <div className="px-3 py-2.5 bg-almond/40 border border-almond rounded-xl text-sm font-bold text-navy">${precioGrabadoUSD.toFixed(0)} USD</div>
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-semibold text-navy/50 mb-1.5 uppercase tracking-wider">{t.totalUSD}</label>
                    <div className="px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-sm font-bold text-blue-700">
                      ${totalGrabadoUSD.toFixed(2)} USD
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-navy/50 mb-1.5 uppercase tracking-wider">{t.totalMXN}</label>
                    <div className="px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700">
                      ${totalGrabadoMXN.toFixed(2)} MXN
                    </div>
                  </div>
                </div>
                {tintas > 0 && (
                  <div className="p-3 bg-navy/5 rounded-xl text-xs text-navy/70">
                    {tintas} {tintas === 1 ? t.tinta : t.tintas} × ${precioGrabadoUSD.toFixed(0)} USD = <span className="font-bold">${totalGrabadoUSD.toFixed(2)} USD</span> · <span className="font-bold">${totalGrabadoMXN.toFixed(2)} MXN</span> (TC: {tc})
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-navy to-noir rounded-2xl p-6 shadow-lg shadow-navy/20">
          <h3 className="text-xs font-bold text-ivory/50 mb-5 uppercase tracking-[0.2em]">{t.resumen}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-ivory/8 rounded-xl p-4 border border-ivory/5">
              <div className="text-[10px] text-mist/70 uppercase tracking-wider font-medium mb-1">{t.pesoXMillar}</div>
              <div className="text-xl font-bold text-ivory">{form.pesoXMillar?.toFixed(4)||'0'}</div>
              <div className="text-[10px] text-mist/50 mt-0.5">kg · {((form.pesoXMillar || 0) * 2.20462).toFixed(4)} lbs</div>
            </div>
            <div className="bg-ivory/8 rounded-xl p-4 border border-ivory/5">
              <div className="text-[10px] text-mist/70 uppercase tracking-wider font-medium mb-1">{t.cantidadKg}</div>
              <div className="text-xl font-bold text-ivory">{form.cantidadKg?.toFixed(4)||'0'}</div>
              <div className="text-[10px] text-mist/50 mt-0.5">kg · {((form.cantidadKg || 0) * 2.20462).toFixed(4)} lbs</div>
            </div>
            <div className="bg-ivory/8 rounded-xl p-4 border border-ivory/5">
              <div className="text-[10px] text-mist/70 uppercase tracking-wider font-medium mb-1">{t.precioFinal} (MXN)</div>
              <div className="text-xl font-bold text-emerald-400">${form.precioFinal?.toFixed(2)||'0.00'}</div>
              <div className="text-[10px] text-emerald-400/50 mt-0.5">{t.porMillar}</div>
            </div>
            <div className="bg-ivory/8 rounded-xl p-4 border border-ivory/5">
              <div className="text-[10px] text-mist/70 uppercase tracking-wider font-medium mb-1">{t.precioFinalUS}</div>
              <div className="text-xl font-bold text-blue-300">${form.precioFinalUS?.toFixed(2)||'0.00'}</div>
              {isManager ? (
                <div className="text-[10px] text-mist/50 mt-0.5">TC: <input type="number" value={form.tipoCambio}
                  onChange={(e)=>update('tipoCambio',parseFloat(e.target.value)||18)}
                  className="w-14 bg-transparent border-b border-ivory/20 text-ivory text-[10px] focus:outline-none" /></div>
              ) : (
                <div className="text-[10px] text-mist/50 mt-0.5">TC: {form.tipoCambio || 18}</div>
              )}
            </div>
          </div>
          {/* Precio por KG for ROLLO/PELICULA/MANGA */}
          {(form.tipo === 'ROLLO' || form.tipo === 'LAMINACIÓN' || form.tipo === 'MANGA') && isManager && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-amber-500/15 rounded-xl p-4 border border-amber-400/20">
                <div className="text-[10px] text-amber-300/80 uppercase tracking-wider font-medium mb-1">{t.precioKgMXN}</div>
                <div className="text-xl font-bold text-amber-300">${form.precioKg?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="bg-amber-500/15 rounded-xl p-4 border border-amber-400/20">
                <div className="text-[10px] text-amber-300/80 uppercase tracking-wider font-medium mb-1">{t.precioKgUSD}</div>
                <div className="text-xl font-bold text-amber-300">${form.precioKgUS?.toFixed(2) || '0.00'}</div>
              </div>
            </div>
          )}
          {/* Cajas info */}
          {form.cantidadUnidad === 'CAJAS' && form.cantidadPorCaja > 0 && form.cantidadValor > 0 && (
            <div className="mt-4">
              <div className="bg-ivory/5 rounded-xl p-4 border border-ivory/5 flex items-center gap-4">
                <div><span className="text-mist/60 text-[10px] uppercase tracking-wider">{t.noCajas}</span><div className="text-ivory font-semibold mt-0.5">{form.cantidadValor}</div></div>
                <div className="w-px h-8 bg-ivory/10" />
                <div><span className="text-mist/60 text-[10px] uppercase tracking-wider">{t.piezasCaja}</span><div className="text-ivory font-semibold mt-0.5">{form.cantidadPorCaja}</div></div>
                <div className="w-px h-8 bg-ivory/10" />
                <div><span className="text-mist/60 text-[10px] uppercase tracking-wider">{t.totalPiezas}</span><div className="text-ivory font-semibold mt-0.5">{(parseFloat(form.cantidadValor) || 0) * (parseFloat(form.cantidadPorCaja) || 0)}</div></div>
              </div>
            </div>
          )}
          {isManager && form.subtotalMaterial && (
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div className="bg-ivory/5 rounded-xl p-3 border border-ivory/5"><span className="text-mist/60 text-[10px] uppercase tracking-wider">{t.subtotalMaterial}</span><div className="text-ivory font-semibold mt-0.5">${form.subtotalMaterial}/kg</div></div>
              <div className="bg-ivory/5 rounded-xl p-3 border border-ivory/5"><span className="text-mist/60 text-[10px] uppercase tracking-wider">{t.calibre}</span><div className="text-ivory font-semibold mt-0.5">{form.calibreGauge?.toFixed(0)||'-'} {t.gauge}</div></div>
              <div className="bg-ivory/5 rounded-xl p-3 border border-ivory/5"><span className="text-mist/60 text-[10px] uppercase tracking-wider">{t.material}</span><div className="text-ivory font-semibold mt-0.5">{form.material||'-'}</div></div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
