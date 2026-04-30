import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <h3 className="font-black italic uppercase tracking-widest text-lg">{title}</h3>
          <button onClick={onClose} className="hover:rotate-90 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 space-y-6 overflow-y-auto font-sans">
          <div className="space-y-4">
            {children}
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button 
              onClick={onClose} 
              className="bg-slate-100 text-slate-500 font-black p-4 rounded-2xl uppercase text-xs hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
