import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Phone, Shield, Calendar, Clock, Save, Loader2 } from 'lucide-react';

export function RegisterTechnician({ unit, initialData, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    cpf: '',
    telefone: '',
    escala: '',
    horario: '',
    sigla_unidade: unit || ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Remove campos de relacionamento (join) antes de salvar, para não dar erro de coluna inexistente
      const { unidades, ...payload } = formData;

      const { error } = await supabase
        .from('tecnicos')
        .upsert({
          ...payload,
          sigla_unidade: formData.sigla_unidade || unit
        }, { onConflict: 'cpf' });

      if (error) throw error;
      onComplete();
    } catch (err) {
      alert("Erro ao salvar técnico: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs outline-none focus:ring-2 ring-primary/20 transition-all font-sans"
              placeholder="Ex: João Silva"
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value.toUpperCase()})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cargo / Função</label>
          <input 
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs outline-none focus:ring-2 ring-primary/20 transition-all font-sans"
            placeholder="Ex: TÉCNICO I"
            value={formData.cargo}
            onChange={e => setFormData({...formData, cargo: e.target.value.toUpperCase()})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">CPF (Único)</label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              required
              disabled={!!initialData}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs outline-none focus:ring-2 ring-primary/20 transition-all font-sans disabled:opacity-50"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={e => setFormData({...formData, cpf: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Telefone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs outline-none focus:ring-2 ring-primary/20 transition-all font-sans"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={e => setFormData({...formData, telefone: e.target.value})}
            />
          </div>
        </div>

        {!unit && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Unidade (Sigla)</label>
            <input 
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs outline-none focus:ring-2 ring-primary/20 transition-all font-sans"
              placeholder="Ex: SSC1"
              value={formData.sigla_unidade}
              onChange={e => setFormData({...formData, sigla_unidade: e.target.value.toUpperCase()})}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Escala</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs outline-none focus:ring-2 ring-primary/20 transition-all font-sans"
              placeholder="Ex: 6x1"
              value={formData.escala}
              onChange={e => setFormData({...formData, escala: e.target.value.toUpperCase()})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Horário</label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs outline-none focus:ring-2 ring-primary/20 transition-all font-sans"
              placeholder="Ex: 08:00 - 17:00"
              value={formData.horario}
              onChange={e => setFormData({...formData, horario: e.target.value})}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-5 rounded-3xl font-black uppercase italic hover:bg-primary-light transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {initialData ? "Salvar Alterações" : "Cadastrar Técnico"}
      </button>
    </form>
  );
}
