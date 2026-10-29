import React from 'react';
import { ShieldAlert, Scale } from 'lucide-react';
import { LEGAL_DISCLAIMERS } from '@/lib/legal-constants';

export const LegalFooter = () => {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 py-6 px-4 mt-12 border-t border-slate-800 text-xs">
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <Scale className="w-4 h-4" />
          <span>Vaidhanik Soochna (Legal Disclaimer)</span>
        </div>
        
        <p className="leading-relaxed text-[11px] text-slate-400">
          {LEGAL_DISCLAIMERS.PLATFORM_ROLE}
        </p>

        <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-300 leading-normal">
            {LEGAL_DISCLAIMERS.NO_LENDING_CLAUSE}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
          <span>IT Act Sec 10A & BSA 2023 Compliant</span>
          <span>© 2026 SignGuard Tech</span>
        </div>
      </div>
    </footer>
  );
};