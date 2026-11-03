import React, { useState } from 'react';
import { 
  Sprout, 
  Sparkles, 
  Globe, 
  Menu, 
  X, 
  Calendar, 
  BookOpen, 
  HeartHandshake, 
  CloudSun, 
  Stethoscope, 
  Flower2, 
  Tractor,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  hasAiApiKey: boolean;
  onOpenApiModal: () => void;
  pendingRemindersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  userRole,
  onRoleChange,
  currentTab,
  onTabChange,
  hasAiApiKey,
  onOpenApiModal,
  pendingRemindersCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language];

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: userRole === 'farmer' ? Tractor : Sprout },
    { id: 'assistant', label: t.nav.assistant, icon: Sparkles, badge: hasAiApiKey ? 'AI' : 'Demo' },
    { id: 'myGarden', label: t.nav.myGarden, icon: Flower2 },
    { id: 'plantDoctor', label: t.nav.plantDoctor, icon: Stethoscope },
    { id: 'careGuide', label: t.nav.careGuide, icon: BookOpen },
    { id: 'reminders', label: t.nav.reminders, icon: Calendar, count: pendingRemindersCount },
    { id: 'farmerHub', label: t.nav.farmerHub, icon: Tractor, roleOnly: 'farmer' },
    { id: 'weather', label: t.nav.weather, icon: CloudSun },
    { id: 'knowledge', label: t.nav.knowledge, icon: HeartHandshake },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight">
                  {t.app.name}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  {userRole === 'farmer' ? '🌾 ' + (language === 'bn' ? 'কৃষক' : 'Farmer') : '🪴 ' + (language === 'bn' ? 'বাগান' : 'Gardener')}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium hidden sm:block">
                {userRole === 'farmer' ? t.app.farmerTagline : t.app.gardenerTagline}
              </p>
            </div>
          </div>

          {/* Desktop Right Controls (Role Switcher, AI Status, Lang, Mobile Menu Toggle) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* AI Status Badge */}
            <button
              onClick={onOpenApiModal}
              title={hasAiApiKey ? t.app.aiConnected : t.app.demoModeActive}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                hasAiApiKey
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              {hasAiApiKey ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline font-semibold">Gemini 3.8 Flash</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden md:inline font-semibold">{language === 'bn' ? 'ডেমো মোড' : 'Demo Mode'}</span>
                </>
              )}
              <KeyRound className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {/* Role Switcher Pill */}
            <div className="bg-stone-100 p-0.5 rounded-lg border border-stone-200 flex items-center">
              <button
                type="button"
                onClick={() => onRoleChange('gardener')}
                className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  userRole === 'gardener'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🪴</span>
                <span className="hidden sm:inline">{language === 'bn' ? 'গৃহবাগান' : 'Gardener'}</span>
              </button>
              <button
                type="button"
                onClick={() => onRoleChange('farmer')}
                className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  userRole === 'farmer'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🌾</span>
                <span className="hidden sm:inline">{language === 'bn' ? 'কৃষক' : 'Farmer'}</span>
              </button>
            </div>

            {/* Language Switcher */}
            <div className="bg-stone-100 p-0.5 rounded-lg border border-stone-200 flex items-center">
              <button
                type="button"
                onClick={() => onLanguageChange('bn')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                  language === 'bn'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                বাং
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                EN
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto py-1 border-t border-stone-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="ml-1 text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-100 text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
