import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, FileSpreadsheet, Download, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

export function MasterAssets({ type }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    const { data: assets, error } = await supabase
      .from('ativos_unidade')
      .select(`
        *,
        modelos_equipamento!inner(*)
      `)
      .eq('modelos_equipamento.tipo', type);
    
    if (assets) setData(assets);
    setLoading(false);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(a => ({
      'Unidade': a.sigla_unidade,
      'TAG': a.tag,
      'Modelo': a.modelos_equipamento?.modelo_chave,
      'Marca': a.modelos_equipamento?.marca,
      'Qtd Módulos': a.qtd_modulos,
      'Rastreio': a.codigo_rastreio,
      'Localização': a.localizacao,
      'Info Adicional': a.info_adicional
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ativos");
    XLSX.writeFile(wb, `PlanilhaMaster_${type}.xlsx`);
  };

  const filtered = data.filter(a => 
    a.tag.toLowerCase().includes(search.toLowerCase()) ||
    a.sigla_unidade.toLowerCase().includes(search.toLowerCase()) ||
    a.modelos_equipamento?.modelo_chave.toLowerCase().includes(search.toLowerCase()) ||
    a.codigo_rastreio?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic leading-none">
            Mestra: {type === 'esteira' ? 'Esteiras' : 'Painéis'}
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> 
            {data.length} ATIVOS CADASTRADOS NO TOTAL
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por TAG, Unidade ou Rastreio..." 
              className="pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs w-80 outline-none focus:ring-2 ring-primary/20 transition-all font-sans"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={exportExcel}
            className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase italic hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase italic tracking-widest border-b border-slate-100">Unidade</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase italic tracking-widest border-b border-slate-100">TAG</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase italic tracking-widest border-b border-slate-100">Modelo / Marca</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase italic tracking-widest border-b border-slate-100">Módulos</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase italic tracking-widest border-b border-slate-100">ID Rastreio</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase italic tracking-widest border-b border-slate-100">Localização / Info</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-slate-300 italic">Carregando dados globais...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-slate-300 italic">Nenhum ativo encontrado com estes filtros.</td>
              </tr>
            ) : filtered.map(a => (
              <tr key={a.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-5">
                  <span className="text-[10px] font-black bg-primary text-white px-2 py-1 rounded-lg shadow-sm">{a.sigla_unidade}</span>
                </td>
                <td className="px-6 py-5">
                  <p className="font-black text-primary uppercase italic text-sm">{a.tag}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-800 text-[11px] uppercase leading-none">{a.modelos_equipamento?.modelo_chave}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase mt-1 italic">{a.modelos_equipamento?.marca}</p>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[11px] font-mono font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    {a.qtd_modulos} Mod.
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-[11px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg inline-block">{a.codigo_rastreio || '---'}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-[10px] text-slate-600 font-medium max-w-xs">{a.localizacao || a.info_adicional || 'S/I'}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
