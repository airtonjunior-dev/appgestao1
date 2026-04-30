import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Users, Phone, Shield, MapPin, AtSign, Download, Filter, Edit3, Trash2, Plus, ChevronDown } from 'lucide-react';
import { Modal } from '../components/Modal';
import { RegisterTechnician } from '../components/RegisterTechnician';
import * as XLSX from 'xlsx';

export function MasterTechnicians() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [sortBy, setSortBy] = useState('nome-asc');

  useEffect(() => {
    fetchTechs();
  }, []);

  const fetchTechs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tecnicos')
      .select(`
        *,
        unidades(nome)
      `);
    
    if (data) setTechs(data);
    setLoading(false);
  };

  const deleteTech = async (id) => {
    if (confirm("Deseja realmente excluir este técnico?")) {
      await supabase.from('tecnicos').delete().eq('id', id);
      fetchTechs();
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(techs.map(t => ({
      'Unidade': t.sigla_unidade,
      'Nome Unidade': t.unidades?.nome,
      'Nome Completo': t.nome,
      'Cargo': t.cargo,
      'CPF': t.cpf,
      'Telefone': t.telefone,
      'Escala': t.escala,
      'Horário': t.horario
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tecnicos");
    XLSX.writeFile(wb, "PlanilhaMaster_Tecnicos.xlsx");
  };

  const filtered = techs.filter(t => 
    t.nome.toLowerCase().includes(search.toLowerCase()) ||
    t.sigla_unidade?.toLowerCase().includes(search.toLowerCase()) ||
    t.cargo?.toLowerCase().includes(search.toLowerCase()) ||
    t.cpf?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'nome-asc') return a.nome.localeCompare(b.nome);
    if (sortBy === 'nome-desc') return b.nome.localeCompare(a.nome);
    if (sortBy === 'unidade') return a.sigla_unidade.localeCompare(b.sigla_unidade);
    return 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic leading-none">
            Mestra: Técnicos
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> 
            {techs.length} COLABORADORES NO TIME
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setEditingTech(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase italic hover:bg-primary-light transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Novo Técnico
          </button>
          
          <div className="relative flex items-center bg-slate-50 rounded-2xl px-4">
            <Filter className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              className="bg-transparent border-none py-4 text-xs font-black uppercase italic outline-none text-slate-600 appearance-none pr-8 cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="nome-asc">Nome (A-Z)</option>
              <option value="nome-desc">Nome (Z-A)</option>
              <option value="unidade">Por Unidade</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-4 pointer-events-none" />
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por Nome, Cargo, Unidade..." 
              className="pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs w-80 outline-none focus:ring-2 ring-primary/20 transition-all font-sans"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={exportExcel}
            className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase italic hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" /> Exportar Lista
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400 italic">Carregando quadro de técnicos...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 italic">Nenhum técnico encontrado.</div>
        ) : filtered.map(t => (
          <div key={t.id} className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 hover:shadow-2xl hover:scale-[1.01] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/5 transition-colors -z-10"></div>
            
            <div className="flex justify-between items-start mb-6">
               <div className="bg-slate-100 p-4 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <Users className="w-8 h-8" />
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingTech(t);
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-slate-50 text-slate-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteTech(t.id)}
                    className="p-2 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
            
            <div className="mb-4">
               <span className="text-[10px] font-black bg-primary text-white px-2 py-1 rounded-lg uppercase shadow-sm">{t.sigla_unidade}</span>
               <p className="text-[9px] font-black text-slate-300 mt-2 uppercase italic leading-none">{t.unidades?.nome}</p>
            </div>

            <h3 className="font-black text-xl text-slate-800 uppercase italic mb-1 truncate">{t.nome}</h3>
            <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-6 italic">{t.cargo || 'EQUIPE TÉCNICA'}</p>

            <div className="space-y-3 border-t border-slate-50 pt-4 mb-6">
                <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                  <Shield className="w-4 h-4 text-slate-300" /> 
                  <span>CPF: {t.cpf || '---'}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                  <Phone className="w-4 h-4 text-slate-300" /> 
                  <span>TEL: {t.telefone || '---'}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Escala</p>
                  <p className="text-[11px] font-black text-slate-700 italic">{t.escala || '---'}</p>
               </div>
               <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Horário</p>
                  <p className="text-[11px] font-black text-slate-700 italic">{t.horario || '---'}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTech ? "Editar Técnico" : "Cadastrar Novo Técnico"}
      >
        <RegisterTechnician 
          initialData={editingTech} 
          onComplete={() => {
            setIsModalOpen(false);
            fetchTechs();
          }} 
        />
      </Modal>
    </div>
  );
}
