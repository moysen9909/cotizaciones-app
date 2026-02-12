import { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, Search, Download, Upload, UserPlus, FolderOpen, Pencil, Trash2, Check, X } from 'lucide-react';

const FOLDER_COLORS = [
  '#ADB8BB', // mist (default)
  '#153147', // navy
  '#E74C3C', // red
  '#27AE60', // green
  '#F39C12', // orange
  '#8E44AD', // purple
  '#2980B9', // blue
  '#1ABC9C', // teal
  '#D4A574', // tan
  '#E91E63', // pink
];

export default function Sidebar({ quotes, clients, activeId, onSelect, onNewQuote, onAddClient, onUpdateClient, onDeleteClient, onExportExcel, onImportExcel, role, t }) {
  const [search, setSearch] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [expandedClients, setExpandedClients] = useState({});
  const [editingClient, setEditingClient] = useState(null);
  const [editName, setEditName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(null);

  const toggleClient = (clientId) => {
    setExpandedClients((prev) => ({ ...prev, [clientId]: !prev[clientId] }));
  };

  const handleAddClient = () => {
    const name = newClientName.trim();
    if (!name) return;
    const client = onAddClient(name);
    if (client) {
      setNewClientName('');
      setShowAddClient(false);
      setExpandedClients((prev) => ({ ...prev, [client.id]: true }));
    }
  };

  const startEdit = (client) => {
    setEditingClient(client.id);
    setEditName(client.nombre);
  };

  const saveEdit = (clientId) => {
    if (editName.trim()) {
      onUpdateClient(clientId, { nombre: editName.trim() });
    }
    setEditingClient(null);
  };

  const cancelEdit = () => { setEditingClient(null); setEditName(''); };

  // Filter
  const q = search.toLowerCase();
  const filteredQuotes = q
    ? quotes.filter((qt) =>
        (qt.registro || '').toLowerCase().includes(q) ||
        (qt.cliente || '').toLowerCase().includes(q) ||
        (qt.producto || '').toLowerCase().includes(q) ||
        (qt.material || '').toLowerCase().includes(q) ||
        (qt.noCliente || '').toLowerCase().includes(q)
      )
    : quotes;

  const quotesById = {};
  const orphanQuotes = [];
  filteredQuotes.forEach((qt) => {
    if (qt.clienteId) {
      if (!quotesById[qt.clienteId]) quotesById[qt.clienteId] = [];
      quotesById[qt.clienteId].push(qt);
    } else {
      orphanQuotes.push(qt);
    }
  });

  const filteredClients = clients.filter((c) => {
    if (!q) return true;
    if (c.nombre.toLowerCase().includes(q)) return true;
    if (quotesById[c.id]?.length > 0) return true;
    return false;
  });

  return (
    <div className="w-72 bg-gradient-to-b from-noir to-noir/95 border-r border-ivory/5 flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-ivory/8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mist/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.buscarCotizacion}
            className="w-full pl-9 pr-3 py-2.5 bg-navy/40 border border-ivory/8 rounded-xl text-sm text-ivory placeholder-mist/40 focus:outline-none focus:ring-2 focus:ring-mist/20 focus:border-ivory/15 transition-all"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="p-3 border-b border-ivory/8 space-y-2">
        <div className="flex gap-2">
          <button onClick={() => setShowAddClient(!showAddClient)}
            className="flex-1 py-2.5 bg-gradient-to-r from-navy to-navy/80 hover:from-navy/90 hover:to-navy/70 text-ivory rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all text-xs border border-ivory/10 hover:border-ivory/20 shadow-sm">
            <UserPlus className="w-3.5 h-3.5" /> {t.nuevoClienteBtn}
          </button>
        <button onClick={onExportExcel} title={t.descargarExcel}
          className="px-3.5 py-2.5 bg-emerald-600/80 hover:bg-emerald-500/80 text-white rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md">
          <Download className="w-3.5 h-3.5" />
        </button>
        {role === 'manager' && onImportExcel && (
          <label title={t.importarExcel} className="px-3.5 py-2.5 bg-amber-600/80 hover:bg-amber-500/80 text-white rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".xlsx,.xls" className="hidden"
              onChange={(e) => { if (e.target.files[0]) { onImportExcel(e.target.files[0]); e.target.value = ''; } }} />
          </label>
        )}
        </div>
        <button onClick={() => onNewQuote(null)}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600/80 to-emerald-600/60 hover:from-emerald-500/80 hover:to-emerald-500/60 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all text-xs border border-emerald-400/20 hover:border-emerald-400/30 shadow-sm">
          <Plus className="w-3.5 h-3.5" /> {t.nuevaCotizacion}
        </button>
      </div>

      {/* Add client input */}
      {showAddClient && (
        <div className="px-3 py-3 border-b border-ivory/8 bg-navy/20">
          <label className="text-[10px] text-mist/60 mb-1.5 block uppercase tracking-wider font-medium">{t.nombreCliente}</label>
          <div className="flex gap-2">
            <input type="text" value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddClient(); if (e.key === 'Escape') { setShowAddClient(false); setNewClientName(''); } }}
              placeholder={t.ejemploClientes}
              autoFocus
              className="flex-1 px-3 py-2 bg-navy/50 border border-ivory/10 rounded-lg text-sm text-ivory placeholder-mist/40 focus:outline-none focus:ring-2 focus:ring-mist/20" />
            <button onClick={handleAddClient}
              className="px-3 py-2 bg-emerald-600/80 hover:bg-emerald-500/80 text-white rounded-lg text-xs font-medium transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Client list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 pt-2">
        {filteredClients.length === 0 && orphanQuotes.length === 0 && (
          <div className="text-center mt-12 px-4">
            <FolderOpen className="w-10 h-10 text-mist/15 mx-auto mb-3" />
            <p className="text-mist/40 text-xs">
              {search ? t.sinResultados : t.agregaCliente}
            </p>
          </div>
        )}

        {filteredClients.map((client) => {
          const clientQuotes = quotesById[client.id] || [];
          const isExpanded = expandedClients[client.id] ?? false;
          const totalQuotes = quotes.filter((qt) => qt.clienteId === client.id).length;
          const folderColor = client.color || '#ADB8BB';
          const isEditing = editingClient === client.id;

          return (
            <div key={client.id} className="mb-0.5">
              {/* Client header */}
              <div className="flex items-center group">
                <button onClick={() => toggleClient(client.id)}
                  className="flex-1 text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 hover:bg-ivory/5 transition-all">
                  {isExpanded
                    ? <ChevronDown className="w-3.5 h-3.5 text-mist/60 transition-transform" />
                    : <ChevronRight className="w-3.5 h-3.5 text-mist/60 transition-transform" />}
                  <FolderOpen className="w-4 h-4 flex-shrink-0 drop-shadow-sm" style={{ color: folderColor }} />
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input type="text" value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(client.id); if (e.key === 'Escape') cancelEdit(); }}
                          autoFocus
                          className="w-full px-1.5 py-0.5 bg-navy/50 border border-mist/30 rounded text-xs text-ivory focus:outline-none" />
                        <button onClick={() => saveEdit(client.id)} className="text-emerald-400 hover:text-emerald-300"><Check className="w-3 h-3" /></button>
                        <button onClick={cancelEdit} className="text-red-400 hover:text-red-300"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-ivory/90 truncate">{client.nombre}</div>
                        <div className="text-[10px] text-mist/40 font-medium">#{client.numero} · {totalQuotes} {t.cotiz}</div>
                      </>
                    )}
                  </div>
                </button>
                {/* Edit/Color buttons - visible on hover */}
                {!isEditing && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all pr-1">
                    <button onClick={() => setShowColorPicker(showColorPicker === client.id ? null : client.id)}
                      title={t.color}
                      className="p-1.5 rounded-lg hover:bg-ivory/10 transition-colors">
                      <div className="w-3 h-3 rounded-full border border-ivory/20 shadow-sm" style={{ backgroundColor: folderColor }} />
                    </button>
                    <button onClick={() => startEdit(client)} title={t.editar}
                      className="p-1.5 rounded-lg hover:bg-ivory/10 text-mist/60 hover:text-ivory transition-colors">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => { if (confirm(`${t.eliminarCliente} "${client.nombre}"?`)) onDeleteClient(client.id); }}
                      title={t.eliminar} className="p-1.5 rounded-lg hover:bg-red-500/15 text-mist/60 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Color picker */}
              {showColorPicker === client.id && (
                <div className="mx-3 mb-2 p-2.5 bg-navy/60 rounded-xl border border-ivory/8 flex flex-wrap gap-2">
                  {FOLDER_COLORS.map((color) => (
                    <button key={color}
                      onClick={() => { onUpdateClient(client.id, { color }); setShowColorPicker(null); }}
                      className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-125 ${folderColor === color ? 'border-ivory scale-110 shadow-md' : 'border-transparent hover:border-ivory/30'}`}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              )}

              {/* Expanded quotes */}
              {isExpanded && (
                <div className="ml-5 pl-3 border-l border-ivory/8 space-y-0.5 mt-0.5 mb-2">
                  {clientQuotes.map((qt) => {
                    const hasSubtotal = qt.subtotalMaterial !== null && qt.subtotalMaterial > 0;
                    const isActive = qt.id === activeId;
                    return (
                      <button key={qt.id} onClick={() => onSelect(qt.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-all text-xs ${
                          isActive ? 'bg-ivory/10 border border-ivory/10 shadow-sm' : 'hover:bg-ivory/5'
                        }`}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${hasSubtotal ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate flex items-center gap-1.5 ${isActive ? 'text-ivory' : 'text-ivory/70'}`}>
                            {qt.version && <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded bg-ivory/10 text-[9px] font-bold text-mist flex-shrink-0">{qt.version}</span>}
                            {qt.registro || qt.producto || `${t.cotizacion} ${qt.id.slice(-4)}`}
                          </div>
                          <div className="text-[10px] text-mist/40 truncate">{qt.material || t.sinMaterial}</div>
                        </div>
                      </button>
                    );
                  })}
                  <button onClick={() => onNewQuote(client.id)}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-xs text-mist/50 hover:text-ivory/70 hover:bg-ivory/5 transition-all">
                    <Plus className="w-3 h-3" /> {t.nuevaCotizacion}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Orphan quotes */}
        {orphanQuotes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-ivory/8">
            <div className="px-3 py-1.5 text-[10px] font-bold text-mist/30 uppercase tracking-[0.15em]">{t.sinCliente}</div>
            {orphanQuotes.map((qt) => {
              const hasSubtotal = qt.subtotalMaterial !== null && qt.subtotalMaterial > 0;
              const isActive = qt.id === activeId;
              return (
                <button key={qt.id} onClick={() => onSelect(qt.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all text-sm mb-0.5 ${
                    isActive ? 'bg-ivory/10 border border-ivory/10 shadow-sm' : 'hover:bg-ivory/5'
                  }`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${hasSubtotal ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate text-sm flex items-center gap-1.5 ${isActive ? 'text-ivory' : 'text-ivory/70'}`}>
                      {qt.version && <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-ivory/10 text-[9px] font-bold text-mist flex-shrink-0">{qt.version}</span>}
                      {qt.registro || qt.cliente || `${t.cotizacion} ${qt.id.slice(-4)}`}
                    </div>
                    <div className="text-[10px] text-mist/40 truncate">{qt.material || ''}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
