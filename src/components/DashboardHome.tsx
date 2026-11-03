import React from 'react';
import { 
  Sprout, 
  Tractor, 
  Flower2, 
  Stethoscope, 
  Sparkles, 
  Calendar, 
  CloudSun, 
  HeartHandshake, 
  Droplet, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { Language, UserRole, Plant, Reminder } from '../types';
import { translations } from '../translations';

interface DashboardHomeProps {
  language: Language;
  userRole: UserRole;
  plants: Plant[];
  reminders: Reminder[];
  onNavigate: (tab: string) => void;
  onWaterPlant: (plantId: string) => void;
  onOpenPlantDoctorWithPlant: (plant: Plant) => void;
  hasAiApiKey: boolean;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  language,
  userRole,
  plants,
  reminders,
  onNavigate,
  onWaterPlant,
  onOpenPlantDoctorWithPlant,
  hasAiApiKey,
}) => {
  const t = translations[language];

  // Calculate stats
  const plantsNeedingWater = plants.filter((p) => {
    if (!p.lastWatered) return true;
    const last = new Date(p.lastWatered).getTime();
    const now = new Date().getTime();
    const daysSince = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    return daysSince >= p.wateringFrequencyDays;
  });

  const healthyPlantsCount = plants.filter((p) => p.health === 'healthy').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingRemindersToday = reminders.filter((r) => !r.completed && r.dueDate <= todayStr);

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className={`rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden ${
        userRole === 'farmer'
          ? 'bg-gradient-to-br from-amber-900 via-amber-800 to-emerald-900'
          : 'bg-gradient-to-br from-emerald-800 via-green-800 to-teal-900'
      }`}>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-200/90 mb-2">
            <span>{userRole === 'farmer' ? '🌾 ' + (language === 'bn' ? 'কৃষক ড্যাশবোর্ড' : 'Farmer Dashboard') : '🪴 ' + (language === 'bn' ? 'গৃহবাগান ড্যাশবোর্ড' : 'Home Gardener Dashboard')}</span>
            <span>•</span>
            <span>{hasAiApiKey ? 'Gemini 3.8 Flash' : (language === 'bn' ? 'ডেমো সক্রিয়' : 'Demo Mode Active')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {language === 'bn' 
              ? (userRole === 'farmer' ? 'স্বাগতম, আধুনিক কৃষক বন্ধু!' : 'স্বাগতম, সবুজ বাগানপ্রেমী বন্ধু!') 
              : (userRole === 'farmer' ? 'Welcome to Smart Farm Command' : 'Welcome to Your Urban Green Sanctuary')}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
            {userRole === 'farmer'
              ? (language === 'bn' 
                  ? 'ধান, আলু, গম, ভুট্টা ও সবজির ফলন বাড়াতে আবহাওয়া পূর্বাভাস, সুষম সার প্রয়োগ ও জৈব বালাই দমন পরামর্শ নিন।' 
                  : 'Monitor crop calendars, integrated pest management (IPM), soil nutrition, and regional weather advisories.')
              : (language === 'bn' 
                  ? 'টবের গাছের পানির সময়সূচি, পাতার রোগ নির্ণয় ও আলো ব্যবস্থাপনার মাধ্যমে ঘর ও বারান্দাকে সাজিয়ে তুলুন।' 
                  : 'Track your potted plants, diagnose leaf issues with AI, and maintain perfect watering cycles.')}
          </p>

          {/* Quick Shortcuts in Hero */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('assistant')}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs shadow-md hover:bg-emerald-50 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>{t.nav.assistant}</span>
            </button>

            <button
              onClick={() => onNavigate('plantDoctor')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{t.nav.plantDoctor}</span>
            </button>

            {userRole === 'farmer' ? (
              <button
                onClick={() => onNavigate('farmerHub')}
                className="px-4 py-2.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-xs border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Tractor className="w-4 h-4" />
                <span>{t.nav.farmerHub}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('myGarden')}
                className="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Flower2 className="w-4 h-4" />
                <span>{t.nav.myGarden}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Plants */}
        <div
          onClick={() => onNavigate('myGarden')}
          className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {language === 'bn' ? 'মোট সংরক্ষিত গাছ' : 'Tracked Plants'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Flower2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-stone-900">{plants.length}</span>
            <span className="text-xs font-semibold text-emerald-700">
              {healthyPlantsCount} {language === 'bn' ? 'সতেজ' : 'healthy'}
            </span>
          </div>
        </div>

        {/* Stat 2: Water Due */}
        <div
          onClick={() => onNavigate('myGarden')}
          className={`p-5 rounded-3xl border shadow-xs transition-all cursor-pointer group ${
            plantsNeedingWater.length > 0
              ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
              : 'bg-white border-stone-200/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {language === 'bn' ? 'আজকের সেচ / পানি' : 'Water Due Today'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-stone-900">{plantsNeedingWater.length}</span>
            <span className="text-xs text-stone-500">
              {language === 'bn' ? 'টি গাছে পানি দেওয়া প্রয়োজন' : 'plants due'}
            </span>
          </div>
        </div>

        {/* Stat 3: Reminders */}
        <div
          onClick={() => onNavigate('reminders')}
          className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.reminders.tabToday}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-stone-900">{pendingRemindersToday.length}</span>
            <span className="text-xs text-stone-500">
              {language === 'bn' ? 'টি কাজ বাকি' : 'tasks pending'}
            </span>
          </div>
        </div>

        {/* Stat 4: AI & Diagnostics */}
        <div
          onClick={() => onNavigate('plantDoctor')}
          className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.nav.plantDoctor}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xs font-bold text-purple-900">
              {language === 'bn' ? 'ছবি ও লক্ষণ স্ক্যান' : 'Photo & Symptom Scan'}
            </span>
          </div>
        </div>

      </div>

      {/* Main Dashboard Section 1: Plants Requiring Attention or Recent Plants */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Flower2 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-stone-900">
              {language === 'bn' ? 'আপনার বাগানের সাম্প্রতিক গাছসমূহ' : 'Recent Plants in Your Garden'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('myGarden')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 cursor-pointer"
          >
            <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plants.slice(0, 4).map((plant) => (
            <div
              key={plant.id}
              className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between"
            >
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={plant.photoUrl}
                  alt={plant.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-xs text-stone-900 truncate">
                    {plant.name}
                  </h3>
                  {plant.bengaliName && (
                    <p className="text-[11px] text-emerald-700 truncate font-semibold">
                      {plant.bengaliName}
                    </p>
                  )}
                  <span className="text-[10px] text-stone-400 capitalize">
                    {t.myGarden[plant.location as keyof typeof t.myGarden] || plant.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs">
                <button
                  onClick={() => onWaterPlant(plant.id)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                >
                  <Droplet className="w-3 h-3 text-emerald-700" />
                  <span>{t.myGarden.waterNow}</span>
                </button>

                <button
                  onClick={() => onOpenPlantDoctorWithPlant(plant)}
                  className="p-1 text-stone-400 hover:text-emerald-700"
                  title={t.myGarden.consultDoctor}
                >
                  <Stethoscope className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Dashboard Section 2: Two Columns (Weather Advisory & Care Tips) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weather Quick Preview */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-stone-900 font-bold text-base">
                <CloudSun className="w-5 h-5 text-blue-600" />
                <span>{t.weather.title}</span>
              </div>
              <button
                onClick={() => onNavigate('weather')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                {language === 'bn' ? 'বিস্তারিত পূর্বাভাস' : 'Full Forecast'} →
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {language === 'bn'
                ? 'বর্তমানে দেশের উত্তরাঞ্চল ও মধ্যাঞ্চলে কৃষির উপযোগী আর্দ্রতা বিরাজ করছে। টবের গাছে সকালে পানি দিন এবং দুপুরের তীব্র রোদ এড়িয়ে চলুন।'
                : 'Current weather favors active plant metabolism. Ensure container plants have well-drained soil and avoid wet foliage at dusk.'}
            </p>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-950">
            <span className="font-semibold">
              {language === 'bn' ? 'আজকের কৃষি পরামর্শ: পরিমিত সেচ ও আগাছা দমন' : 'Today: Moderate watering & weed clearance'}
            </span>
            <span className="font-bold text-blue-700">Open-Meteo</span>
          </div>
        </div>

        {/* Safe Agro / Gardening Tip of the Day */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-stone-900 font-bold text-base">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>{language === 'bn' ? 'আজকের কৃষি ও বাগান টিপস' : 'Daily Gardening Insight'}</span>
              </div>
              <button
                onClick={() => onNavigate('knowledge')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                {language === 'bn' ? 'তথ্য ভান্ডার' : 'Knowledge Hub'} →
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {language === 'bn'
                ? '🌱 নিম তেলের নিরাপদ ব্যবহার: রাসায়নিক বিষ প্রয়োগ না করে ১ লিটার হালকা গরম পানিতে ৫ মিলি নিম তেল ও ২ ফোঁটা তরল সাবান মিশিয়ে বিকালে স্প্রে করুন। এতে গাছের কোনো ক্ষতি ছাড়া জাবপোকা ও মিলিবাগ দূর হয়।'
                : '🌱 Safe Neem Oil Practice: Mix 5ml cold-pressed neem oil with 2 drops of mild soap in 1L water. Spray late afternoon to eliminate soft-bodied pests without scorching delicate foliage.'}
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
            <span className="font-semibold">{language === 'bn' ? 'সমন্বিত বালাই ব্যবস্থাপনা (IPM)' : 'Integrated Pest Management (IPM)'}</span>
            <span className="text-[11px] font-bold text-emerald-800">{language === 'bn' ? 'পরিবেশবান্ধব' : 'Eco-Safe'}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
