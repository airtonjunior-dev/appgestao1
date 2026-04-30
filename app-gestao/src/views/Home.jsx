import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export function Home() {
  const [stats, setStats] = useState({ totalAtivos: 0, criticalItems: 0, tecnicihos: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [ativos, estoque, techs] = await Promise.all([
        supabase.from('ativos_unidade').select('id', { count: 'exact' }),
        supabase.from('estoque_unidade').select('*'),
        supabase.from('tecnicos').select('id', { count: 'exact' })
      ]);

      const critical = (estoque.data || []).filter(e => e.estoque_real < e.estoque_obrigatorio).length;

      setStats({
        totalAtivos: ativos.count || 0,
        criticalItems: critical,
        tecnicihos: techs.count || 0
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <header className="mb-0">
        <h1 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">Status Geral Regional</h1>
        <p className="text-slate-500 font-medium italic text-sm">Monitoramento em tempo real de ativos e suprimentos</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase italic">Ativos Instalados</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalAtivos}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm flex items-center gap-4">
          <div className="bg-red-100 text-red-600 p-4 rounded-2xl">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-red-400 uppercase italic">Itens sem Estoque</p>
            <h3 className="text-3xl font-black text-red-600">{stats.criticalItems}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase italic">Técnicos Ativos</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.tecnicihos}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 text-center flex flex-col items-center justify-center">
         <div className="bg-slate-50 p-8 rounded-full mb-6">
            <img src="https://img.icons8.com/isometric/100/maintenance.png" alt="maintenance" className="w-24 h-24" />
         </div>
         <h2 className="text-2xl font-black text-slate-800 uppercase italic">Selecione uma Unidade</h2>
         <p className="text-slate-400 italic max-w-md mx-auto mt-2">
           Utilize o menu lateral para navegar entre as regionais e visualizar os detalhes de cada unidade operacional.
         </p>
      </div>
    </div>
  );
}
