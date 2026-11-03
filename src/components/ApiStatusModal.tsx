import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasAiApiKey: boolean;
  language: Language;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({
  isOpen,
  onClose,
  hasAiApiKey,
  language,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
            hasAiApiKey ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-amber-600 shadow-amber-600/30'
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              KrishiBondhu AI Platform
            </span>
            <h2 className="text-xl font-black text-stone-900 tracking-tight">
              {t.apiModal.title}
            </h2>
          </div>
        </div>

        {/* Status Box */}
        {hasAiApiKey ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 mb-6">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.apiModal.connectedTitle}</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              {t.apiModal.connectedDesc}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 mb-6">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t.apiModal.demoTitle}</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              {t.apiModal.demoDesc}
            </p>
          </div>
        )}

        {/* Setup Information Instructions */}
        <div className="space-y-3 text-xs text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-200 mb-6">
          <div className="flex items-center space-x-1.5 font-bold text-stone-900">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>{t.apiModal.howToEnable}</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-stone-600 leading-relaxed">
            <li>{t.apiModal.step1}</li>
            <li>{t.apiModal.step2}</li>
            <li>{t.apiModal.step3}</li>
          </ol>
        </div>

        {/* Safety Note */}
        <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-500 flex items-start space-x-2 mb-6">
          <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <span>
            {language === 'bn' 
              ? 'নিরাপত্তা বজায় রাখতে এআই কি সরাসরি ব্রাউজারে কখনো দৃশ্যমান হয় না; সমস্ত অনুরোধ সুরক্ষিত সার্ভার এন্ডপয়েন্টের মাধ্যমে সম্পন্ন হয়।' 
              : 'For security, API keys are never exposed to the client browser. All generation is safely mediated by the server proxy.'}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
        >
          {t.apiModal.close}
        </button>

      </div>
    </div>
  );
};
