import React from 'react';
import { Sprout, Tractor, ArrowRight, ShieldCheck, HeartHandshake, CloudSun } from 'lucide-react';
import { Language, UserRole } from '../types';
import { translations } from '../translations';

interface WelcomeModalProps {
  isOpen: boolean;
  onSelectRole: (role: UserRole) => void;
  language: Language;
  onClose?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onSelectRole,
  language,
  onClose,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-100 overflow-hidden relative">
        
        {/* Decorative Nature Gradient Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-600/30 mb-4">
            <Sprout className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.onboarding.welcome}
          </h2>
          <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-lg mx-auto">
            {t.onboarding.subheading}
          </p>
        </div>

        {/* Two Category Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          {/* Home Gardener Card */}
          <button
            type="button"
            onClick={() => onSelectRole('gardener')}
            className="group text-left p-5 rounded-xl border-2 border-emerald-100 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/90 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="text-2xl">🪴</span>
              </div>
              <h3 className="font-bold text-lg text-emerald-950 mb-1">
                {t.onboarding.gardenerTitle}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.onboarding.gardenerDesc}
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
              <span>{t.onboarding.startGardener}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Farmer Card */}
          <button
            type="button"
            onClick={() => onSelectRole('farmer')}
            className="group text-left p-5 rounded-xl border-2 border-amber-100 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/90 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Tractor className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-amber-950 mb-1">
                {t.onboarding.farmerTitle}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.onboarding.farmerDesc}
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-bold text-amber-800 group-hover:text-amber-950">
              <span>{t.onboarding.startFarmer}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

        </div>

        {/* Feature Highlights Footer */}
        <div className="border-t border-stone-100 pt-4 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'নিরাপদ জৈব পরামর্শ' : 'Safe organic care'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'দ্বিভাষিক (বাংলা ও English)' : 'Bilingual (Bangla & English)'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CloudSun className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'আবহাওয়া ভিত্তিক সিদ্ধান্ত' : 'Weather advisory'}</span>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-stone-400">
          {t.onboarding.changeAnytime}
        </p>

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 text-sm font-semibold p-1"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
