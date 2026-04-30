import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Package, Loader2 } from 'lucide-react';

export function RegisterPart({ unit, assetTag, assetType, onComplete, initialData }) {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    id: initialData?.id || null,
    tag_ativo: initialData?.tag_ativo || assetTag || '',
    tipo: initialData?.tipo?.toLowerCase() || assetType?.toLowerCase() || 'esteira',
    componente: initialData?.componente || '',
    codigo_item: initialData?.codigo_item || '',
    estoque_real: initialData?.estoque_real || 0,
    estoque_obrigatorio: initialData?.estoque_obrigatorio || 1,
    observacao: initialData?.observacao || '',
    data_compra: initialData?.data_compra || '',
    previsao_chegada: initialData?.previsao_chegada || ''
  });

  useEffect(() => {
    fetchAssets();
  }, [unit]);

  const fetchAssets = async () => {
    const { data } = await supabase
      .from('ativos_unidade')
      .select('tag, modelos_equipamento(tipo)')
      .eq('sigla_unidade', unit);
    if (data) setAssets(data);
  };

  const handleSave = async () => {
    if (!formData.componente) return alert("Preencha o Componente");
    if (!formData.tag_ativo) return alert("Selecione o Ativo");

    setLoading(true);
    try {
      const payload = {
        sigla_unidade: unit,
        tag_ativo: formData.tag_ativo,
        tipo: formData.tipo.toUpperCase(),
        componente: formData.componente,
        codigo_item: formData.codigo_item,
        estoque_real: formData.estoque_real,
        estoque_obrigatorio: formData.estoque_obrigatorio,
        observacao: formData.observacao,
        data_compra: formData.data_compra || null,
        previsao_chegada: formData.previsao_chegada || null
      };

      let res;
      if (formData.id) {
        res = await supabase.from('estoque_unidade')
          .update(payload)
          .eq('id', formData.id);
      } else {
        res = await supabase.from('estoque_unidade')
          .upsert(payload, { onConflict: 'sigla_unidade,tag_ativo,componente' });
      }

      if (res.error) throw res.error;
      alert(formData.id ? "Alterações salvas!" : "Peça vinculada com sucesso!");
      onComplete();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar peça: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 mb-2">
        <label className="label-min text-primary block mb-2">Vincular a qual Equipamento?</label>
        <select 
          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 ring-primary/20"
          value={formData.tag_ativo}
          onChange={(e) => {
            const selected = assets.find(a => a.tag === e.target.value);
            setFormData({
              ...formData, 
              tag_ativo: e.target.value,
              tipo: selected?.modelos_equipamento?.tipo || formData.tipo
            });
          }}
        >
          <option value="">Selecione um Ativo...</option>
          <option value="GERAL">GERAL (Sem ativo específico)</option>
          {assets.map(a => (
            <option key={a.tag} value={a.tag}>
              {a.tag} - {a.modelos_equipamento?.tipo?.toUpperCase() || 'EQUIPAMENTO'}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <label className="label-min">Componente / Item</label>
          <input 
            type="text" 
            className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-medium outline-none" 
            placeholder="Ex: ROLAMENTO 6205" 
            value={formData.componente}
            onChange={(e) => setFormData({...formData, componente: e.target.value})}
          />
        </div>
        <div className="col-span-1">
          <label className="label-min">Código Klassmatt</label>
          <input 
            type="text" 
            className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-medium outline-none" 
            placeholder="Ex: ROL-001" 
            value={formData.codigo_item}
            onChange={(e) => setFormData({...formData, codigo_item: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-min">Estoque Atual (Real)</label>
          <input 
            type="number" 
            className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-medium outline-none" 
            value={formData.estoque_real}
            onChange={(e) => setFormData({...formData, estoque_real: parseInt(e.target.value)})}
          />
        </div>
        <div>
          <label className="label-min">Estoque Mínimo (Obrigatório)</label>
          <input 
            type="number" 
            className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-medium outline-none" 
            value={formData.estoque_obrigatorio}
            onChange={(e) => setFormData({...formData, estoque_obrigatorio: parseInt(e.target.value)})}
          />
        </div>
      </div>

      <div>
        <label className="label-min">Observações Técnicas</label>
        <textarea 
          className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-medium outline-none h-20 resize-none" 
          placeholder="Detalhes sobre aplicação, prateleira, etc..."
          value={formData.observacao}
          onChange={(e) => setFormData({...formData, observacao: e.target.value})}
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-min text-[9px]">Data da Compra</label>
          <input 
            type="date" 
            className="w-full p-2 bg-slate-50 border-none rounded-lg text-[10px] outline-none" 
            value={formData.data_compra}
            onChange={(e) => setFormData({...formData, data_compra: e.target.value})}
          />
        </div>
        <div>
          <label className="label-min text-[9px]">Previsão de Chegada</label>
          <input 
            type="date" 
            className="w-full p-2 bg-slate-50 border-none rounded-lg text-[10px] outline-none" 
            value={formData.previsao_chegada}
            onChange={(e) => setFormData({...formData, previsao_chegada: e.target.value})}
          />
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase italic tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-primary/20 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
        {formData.id ? "Salvar Alterações" : "Vincular Peça ao Ativo"}
      </button>
    </div>
  );
}
