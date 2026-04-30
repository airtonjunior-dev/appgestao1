import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus } from 'lucide-react';

export function RegisterAsset({ unit, onComplete, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    tag: '',
    modelo_chave: '',
    tipo: 'esteira',
    marca: '',
    qtd_modulos: 1,
    comprimento_modulo: 0,
    info_adicional: '',
    localizacao: '',
    codigo_rastreio: ''
  });
  const [modelos, setModelos] = useState([]);

  useEffect(() => {
    async function fetchModelos() {
       const { data } = await supabase.from('modelos_equipamento').select('modelo_chave');
       if (data) setModelos(data);
    }
    fetchModelos();
  }, []);

  const handleSave = async () => {
    if (!formData.tag || !formData.modelo_chave) return alert("Preencha TAG e Modelo");
    
    try {
      // 1. Garantir que o modelo existe ou Criar um Novo
      let { data: modelo } = await supabase
        .from('modelos_equipamento')
        .select('id')
        .eq('modelo_chave', formData.modelo_chave)
        .maybeSingle();
      
      if (!modelo) {
        // Criação automática do modelo se não existir
        const { data: newModel, error: modelError } = await supabase
          .from('modelos_equipamento')
          .insert({ 
            modelo_chave: formData.modelo_chave, 
            tipo: formData.tipo, 
            marca: formData.marca || 'S/I' 
          })
          .select()
          .single();
        
        if (modelError) throw modelError;
        modelo = newModel;
      }

      const payload = {
        sigla_unidade: unit,
        tag: formData.tag,
        modelo_id: modelo.id,
        qtd_modulos: formData.qtd_modulos || 1,
        comprimento_modulo: formData.comprimento_modulo || 0,
        info_adicional: formData.info_adicional,
        localizacao: formData.localizacao,
        codigo_rastreio: formData.codigo_rastreio
      };

      const { error } = initialData?.id 
        ? await supabase.from('ativos_unidade').update(payload).eq('id', initialData.id)
        : await supabase.from('ativos_unidade').insert(payload);

      if (error) throw error;
      alert("Ativo cadastrado com sucesso!");
      onComplete();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar: " + e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
        <button 
          onClick={() => setFormData({...formData, tipo: 'esteira'})}
          className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", formData.tipo === 'esteira' ? "bg-primary text-white" : "text-slate-500")}
        >
          Esteira
        </button>
        <button 
          onClick={() => setFormData({...formData, tipo: 'painel'})}
          className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", formData.tipo === 'painel' ? "bg-primary text-white" : "text-slate-500")}
        >
          Painel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-min">TAG do Equipamento</label>
          <input 
            type="text" 
            className="input-std" 
            placeholder="EST-01, PAI-02..." 
            value={formData.tag}
            onChange={(e) => setFormData({...formData, tag: e.target.value})}
          />
        </div>
        <div>
          <label className="label-min">ID de Rastreio (Único)</label>
          <input 
            type="text" 
            className="input-std" 
            placeholder="ID-12345"
            value={formData.codigo_rastreio}
            onChange={(e) => setFormData({...formData, codigo_rastreio: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-min">Modelo (Catalogado ou Novo)</label>
          <input 
            list="model-options"
            type="text" 
            className="input-std" 
            placeholder="Ex: T01-GPS"
            value={formData.modelo_chave}
            onChange={(e) => setFormData({...formData, modelo_chave: e.target.value})}
          />
          <datalist id="model-options">
            {modelos.map(m => <option key={m.modelo_chave} value={m.modelo_chave} />)}
          </datalist>
        </div>
        <div>
          <label className="label-min">Marca do Equipamento</label>
          <input 
            type="text" 
            className="input-std" 
            placeholder="Ex: INTERROLL, SEW..."
            value={formData.marca}
            onChange={(e) => setFormData({...formData, marca: e.target.value})}
          />
        </div>
      </div>

      {formData.tipo === 'esteira' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-min">Qtd Módulos</label>
            <input 
              type="number" 
              className="input-std" 
              value={formData.qtd_modulos}
              onChange={(e) => setFormData({...formData, qtd_modulos: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="label-min">Tamanho por Módulo (m)</label>
            <input 
              type="number" 
              className="input-std" 
              value={formData.comprimento_modulo}
              onChange={(e) => setFormData({...formData, comprimento_modulo: parseFloat(e.target.value)})}
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="label-min">Localização no Galpão</label>
          <input 
            type="text" 
            className="input-std" 
            placeholder="Ex: Mezanino, Docas 1 a 4..."
            value={formData.localizacao}
            onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
          />
        </div>
      )}

      <div>
        <label className="label-min">Informações Adicionais</label>
        <input 
          type="text" 
          className="input-std" 
          placeholder="Ajustes, Tensões, Observações..." 
          value={formData.info_adicional}
          onChange={(e) => setFormData({...formData, info_adicional: e.target.value})}
        />
      </div>

      <button onClick={handleSave} className="btn-accent w-full mt-4 h-14 uppercase tracking-tighter">
        <Plus className="w-5 h-5" /> 
        {initialData?.id ? "Salvar Alterações" : "Finalizar Cadastro do Ativo"}
      </button>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
