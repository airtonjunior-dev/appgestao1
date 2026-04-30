import { Cog, Zap, Edit2, Trash2, AlertCircle, CheckCircle, MessageSquare, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export function AssetCard({ asset, parts = [], type = 'esteira', onDelete, onEdit, onAddPart, onEditPart, onDeletePart }) {
  const isEsteira = type === 'esteira';
  const bgColor = isEsteira ? 'bg-primary' : 'bg-slate-900';
  const iconBg = isEsteira ? 'bg-accent' : 'bg-blue-500';
  const iconColor = isEsteira ? 'text-primary' : 'text-white';
  const tagColor = isEsteira ? 'text-accent' : 'text-blue-400';

  return (
    <div className={cn(
      "rounded-[2.5rem] border shadow-xl overflow-hidden mb-10 transition-all",
      isEsteira ? "bg-white border-slate-200/60" : "bg-slate-900 border-slate-800"
    )}>
      <div className={cn(bgColor, "p-6 text-white relative")}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={cn(iconBg, "p-3 rounded-2xl shadow-inner")}>
              {isEsteira ? <Cog className={cn("w-6 h-6", iconColor)} /> : <Zap className={cn("w-6 h-6", iconColor)} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                  {asset.modelo_chave}
                </h3>
                <button onClick={() => onEdit(asset)} className="p-1 hover:text-accent transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-black tracking-widest uppercase", tagColor)}>
                  {asset.tag}
                </span>
                <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest border-l pl-2 border-white/10 italic">
                  {isEsteira ? (asset.info_adicional || 'Esteira de Transporte') : (asset.localizacao || 'Painel de Controle')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <button 
                onClick={() => onAddPart(asset)} 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-black uppercase italic shadow-lg shadow-emerald-500/10"
              >
                <Plus className="w-3.5 h-3.5" /> Novo Item
              </button>
              <button onClick={() => onDelete(asset.id)} className="p-2 hover:bg-red-500 rounded-xl transition text-white/20 hover:text-white border border-white/5">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {isEsteira && (
              <div className="bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                <span className="text-[9px] font-black uppercase text-blue-300 tracking-widest italic">
                  {asset.qtd_modulos || 1} Módulos | {((asset.qtd_modulos || 1) * (asset.comprimento_modulo || 0)).toFixed(1)}m
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cn("p-4", isEsteira ? "bg-slate-50/50" : "bg-slate-900/50")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {parts.map((p, idx) => {
            const isCritico = p.estoque_real < p.estoque_obrigatorio;
            const cardBg = isEsteira ? 'bg-white' : 'bg-white/5';
            const borderColor = isEsteira 
              ? (isCritico ? 'border-red-200 shadow-sm' : 'border-slate-100') 
              : (isCritico ? 'border-red-500/30 bg-red-500/5 shadow-inner' : 'border-white/10');

            return (
              <div key={idx} className={cn(
                cardBg, "p-4 rounded-2xl border flex flex-col gap-3 transition-all group relative",
                borderColor,
                isEsteira ? "hover:bg-slate-50" : "hover:bg-white/10"
              )}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isCritico 
                        ? <AlertCircle className="w-3.5 h-3.5 text-red-500" /> 
                        : <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      }
                      <p className={cn("font-black uppercase italic text-[11px] leading-tight", isEsteira ? "text-slate-700" : "text-white")}>
                        {p.componente}
                      </p>
                    </div>
                     <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {p.codigo_item || 'S/C'}
                        </span>
                        <span className={cn("text-[8px] font-black uppercase tracking-tighter", isEsteira ? "text-slate-300" : "text-white/20")}>
                          {p.tipo}
                        </span>
                     </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 mb-1">
                      <span className={cn("text-sm font-black", isCritico ? 'text-red-600' : 'text-emerald-500')}>
                        {p.estoque_real}
                      </span>
                      <span className="text-[10px] text-slate-300">/</span>
                      <span className={cn("text-[10px] font-black", isEsteira ? 'text-slate-400' : 'text-white/40')}>
                        {p.estoque_obrigatorio}
                      </span>
                    </div>
                    <p className="text-[7px] font-black text-slate-400 uppercase leading-none">Estoque</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="flex-1">
                    {p.observacao && (
                      <p className={cn("text-[9px] italic font-medium leading-tight", isEsteira ? "text-slate-500" : "text-white/40")}>
                        "{p.observacao}"
                      </p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditPart(p); }}
                      className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[8px] font-black uppercase italic transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-2.5 h-2.5" /> Editar
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeletePart(p.id); }}
                      className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[8px] font-black uppercase italic transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-2.5 h-2.5" /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
