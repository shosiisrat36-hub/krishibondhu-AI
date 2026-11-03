import React, { useState, useEffect } from 'react';
import { 
  Tractor, 
  Calendar, 
  Layers, 
  Droplet, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { Language, FarmProfile, FarmTaskLog, FarmerCropProfile } from '../types';
import { translations } from '../translations';
import { farmerCropsData } from '../data/farmerData';

interface FarmerDashboardProps {
  language: Language;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ language }) => {
  const t = translations[language];

  // Farm Profile state with persistent localStorage
  const [farmProfile, setFarmProfile] = useState<FarmProfile>(() => {
    const saved = localStorage.getItem('krishi_farm_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse farm profile:', e);
      }
    }
    return {
      farmName: language === 'bn' ? 'সবুজ সোনালী খামার' : 'Green Valley Agro Farm',
      location: language === 'bn' ? 'বগুড়া সদর, রাজশাহী' : 'Bogura Sadar, Rajshahi',
      landSize: language === 'bn' ? '৩ বিঘা (১০০ শতক)' : '3 Bigha (approx 1 Acre)',
      soilType: language === 'bn' ? 'উর্বর পলি দোআঁশ মাটি' : 'Fertile Alluvial Silty Loam',
      primaryWaterSource: language === 'bn' ? 'গভীর নলকূপ ও সেচ নালা' : 'Deep Tubewell & Irrigation Canal',
      currentCrops: ['ধান (বোরো)', 'আলু (ডায়মন্ড)', 'কাঁচা মরিচ'],
      notes: language === 'bn' ? 'জৈব সার ও এডব্লিউডি সেচ পদ্ধতির মাধ্যমে আধুনিক চাষাবাদ।' : 'Adopting organic compost & AWD water management.',
    };
  });

  // Task logs state with persistent localStorage
  const [taskLogs, setTaskLogs] = useState<FarmTaskLog[]>(() => {
    const saved = localStorage.getItem('krishi_farm_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse farm task logs:', e);
      }
    }
    return [
      {
        id: 'log-1',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cropName: language === 'bn' ? 'বোরো ধান' : 'Boro Rice',
        activity: language === 'bn' ? 'ইউরিয়া সারের দ্বিতীয় কিস্তি উপরিপ্রয়োগ ও এডব্লিউডি পাইপ পর্যবেক্ষণ' : 'Second split Urea application & AWD pipe level check',
        expense: 1400,
      },
      {
        id: 'log-2',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cropName: language === 'bn' ? 'গোল আলু' : 'Potato',
        activity: language === 'bn' ? 'গাছের গোড়ায় মাটি তুলে দেওয়া (Earthing up) এবং কুয়াশা নিরোধক সতর্কতা' : 'Earthing up soil around stems & cold fog monitoring',
        expense: 800,
      },
      {
        id: 'log-3',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cropName: language === 'bn' ? 'মরিচ' : 'Chili',
        activity: language === 'bn' ? 'জৈব নিম তেল ও সাবান পানির স্প্রে (থ্রিপস ও মাকড় দমন)' : 'Neem oil spray for thrips & mite prevention',
        expense: 350,
      },
    ];
  });

  const [expandedCropId, setExpandedCropId] = useState<string | null>(farmerCropsData[0].id);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Edit Profile form fields
  const [editFarmName, setEditFarmName] = useState(farmProfile.farmName);
  const [editLocation, setEditLocation] = useState(farmProfile.location);
  const [editLandSize, setEditLandSize] = useState(farmProfile.landSize);
  const [editSoilType, setEditSoilType] = useState(farmProfile.soilType);
  const [editWaterSource, setEditWaterSource] = useState(farmProfile.primaryWaterSource);

  // Add Task form fields
  const [newLogCrop, setNewLogCrop] = useState(farmerCropsData[0].nameBn);
  const [newLogActivity, setNewLogActivity] = useState('');
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLogExpense, setNewLogExpense] = useState('');

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('krishi_farm_profile', JSON.stringify(farmProfile));
  }, [farmProfile]);

  useEffect(() => {
    localStorage.setItem('krishi_farm_logs', JSON.stringify(taskLogs));
  }, [taskLogs]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFarmProfile((prev) => ({
      ...prev,
      farmName: editFarmName.trim() || prev.farmName,
      location: editLocation.trim() || prev.location,
      landSize: editLandSize.trim() || prev.landSize,
      soilType: editSoilType.trim() || prev.soilType,
      primaryWaterSource: editWaterSource.trim() || prev.primaryWaterSource,
    }));
    setIsEditProfileOpen(false);
  };

  const handleAddTaskLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogActivity.trim()) return;

    const newLog: FarmTaskLog = {
      id: `task-${Date.now()}`,
      date: newLogDate,
      cropName: newLogCrop,
      activity: newLogActivity.trim(),
      expense: newLogExpense ? parseFloat(newLogExpense) : undefined,
    };

    setTaskLogs((prev) => [newLog, ...prev]);
    setNewLogActivity('');
    setNewLogExpense('');
    setIsAddTaskOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    setTaskLogs((prev) => prev.filter((item) => item.id !== id));
  };

  // Determine current season in Bangladesh
  const currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dec
  let currentSeasonTag = '';
  if (currentMonth >= 9 || currentMonth <= 2) {
    currentSeasonTag = 'Rabi (রবি মৌসুম)';
  } else if (currentMonth >= 3 && currentMonth <= 6) {
    currentSeasonTag = 'Kharif-1 (খরিপ-১)';
  } else {
    currentSeasonTag = 'Kharif-2 (খরিপ-২)';
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
              <Tractor className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.farmer.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            {t.farmer.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            🌾 {language === 'bn' ? `বর্তমান ঋতু: ${currentSeasonTag}` : `Current Season: ${currentSeasonTag}`}
          </span>
        </div>
      </div>

      {/* Farm Profile Card */}
      <div className="bg-gradient-to-br from-amber-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Tractor className="w-4 h-4" />
              <span>{t.farmer.farmProfile}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {farmProfile.farmName}
            </h2>
            <p className="text-xs text-amber-200/80 flex items-center space-x-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{farmProfile.location}</span>
            </p>
          </div>

          <button
            onClick={() => {
              setEditFarmName(farmProfile.farmName);
              setEditLocation(farmProfile.location);
              setEditLandSize(farmProfile.landSize);
              setEditSoilType(farmProfile.soilType);
              setEditWaterSource(farmProfile.primaryWaterSource);
              setIsEditProfileOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center space-x-1.5 self-start md:self-center cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t.farmer.editFarmProfile}</span>
          </button>
        </div>

        {/* Profile Metrics Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-xs">
            <span className="text-stone-300 text-[11px] block">{t.farmer.landSize}</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{farmProfile.landSize}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-xs">
            <span className="text-stone-300 text-[11px] block">{t.farmer.primarySoil}</span>
            <span className="font-bold text-white text-sm mt-0.5 block truncate">{farmProfile.soilType}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-xs">
            <span className="text-stone-300 text-[11px] block">{t.farmer.irrigation}</span>
            <span className="font-bold text-white text-sm mt-0.5 block truncate">{farmProfile.primaryWaterSource}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-xs">
            <span className="text-stone-300 text-[11px] block">{t.farmer.activeCrops}</span>
            <span className="font-bold text-amber-300 text-sm mt-0.5 block">
              {farmProfile.currentCrops.length} {language === 'bn' ? 'টি ফসল' : 'Crops'}
            </span>
          </div>
        </div>
      </div>

      {/* Seasonal Agricultural Calendar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5">
          <Calendar className="w-5 h-5 text-amber-700" />
          <h2 className="text-lg font-bold text-stone-900">
            {t.farmer.calendarTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
            currentSeasonTag.includes('Rabi')
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-stone-50 border-stone-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">{t.farmer.seasonRabi}</span>
              {currentSeasonTag.includes('Rabi') && (
                <span className="px-2 py-0.5 bg-amber-600 text-white rounded text-[10px] font-bold">
                  {language === 'bn' ? 'চলমান' : 'Current'}
                </span>
              )}
            </div>
            <p className="text-stone-600 leading-relaxed">
              {language === 'bn' 
                ? 'গম, আলু, বোরো ধান, সরিষা, ভুট্টা, শীতকালীন টমেটো ও শাকসবজির মূল মৌসুম। সেচ ও কুয়াশাজনিত রোগবালাই পর্যবেক্ষণের উপযুক্ত সময়।' 
                : 'Key window for Wheat, Potato, Boro Rice, Mustard, Winter Tomatoes, and Maize. Crucial monitoring for frost & blight.'}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
            currentSeasonTag.includes('Kharif-1')
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-stone-50 border-stone-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">{t.farmer.seasonKharif1}</span>
              {currentSeasonTag.includes('Kharif-1') && (
                <span className="px-2 py-0.5 bg-amber-600 text-white rounded text-[10px] font-bold">
                  {language === 'bn' ? 'চলমান' : 'Current'}
                </span>
              )}
            </div>
            <p className="text-stone-600 leading-relaxed">
              {language === 'bn' 
                ? 'আউশ ধান, পাট, গ্রীষ্মকালীন মরিচ, ঢেঁড়শ ও শসা চাষ। খরা ও বৈশাখী ঝড়ের প্রস্তুতি।' 
                : 'Aus Rice, Jute, Summer Chili, Okra, and Cucurbits. Soil moisture conservation before monsoon.'}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
            currentSeasonTag.includes('Kharif-2')
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-stone-50 border-stone-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">{t.farmer.seasonKharif2}</span>
              {currentSeasonTag.includes('Kharif-2') && (
                <span className="px-2 py-0.5 bg-amber-600 text-white rounded text-[10px] font-bold">
                  {language === 'bn' ? 'চলমান' : 'Current'}
                </span>
              )}
            </div>
            <p className="text-stone-600 leading-relaxed">
              {language === 'bn' 
                ? 'রোপা আমন ধান রোপণ ও পরিচর্যা। বর্ষার পানি নিষ্কাশন ও মাজরা পোকা প্রতিরোধে পার্চিং স্থাপন।' 
                : 'Transplanted Aman Rice cultivation. Water drainage management and bird perch installation.'}
            </p>
          </div>
        </div>
      </div>

      {/* Major Crop Profiles Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900 px-1">
          {t.farmer.cropsCatalog}
        </h2>

        <div className="space-y-4">
          {farmerCropsData.map((crop) => {
            const isExpanded = expandedCropId === crop.id;
            return (
              <div
                key={crop.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden transition-all hover:border-amber-400"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedCropId(isExpanded ? null : crop.id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={crop.image}
                      alt={crop.nameEn}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 shadow-xs"
                    />
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wider block w-fit mb-1">
                        {language === 'bn' ? crop.seasonBn : crop.seasonEn}
                      </span>
                      <h3 className="text-lg font-bold text-stone-900">
                        {language === 'bn' ? crop.nameBn : crop.nameEn}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {language === 'bn' ? `ফলন সম্ভাবনা: ${crop.yieldEstimate}` : `Yield: ${crop.yieldEstimate}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <span className="text-xs font-bold text-amber-800">
                      {isExpanded ? (language === 'bn' ? 'সংক্ষেপ করুন' : 'Hide') : (language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Full Guide')}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-stone-100 space-y-4 text-xs animate-fade-in">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sowing & Harvest */}
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                        <span className="font-bold text-stone-800 block">
                          📅 {language === 'bn' ? 'বপন ও ফসল তোলার সময়:' : 'Sowing & Harvest Timing:'}
                        </span>
                        <p className="text-stone-600">
                          <strong>{language === 'bn' ? 'বপন:' : 'Sowing:'}</strong> {crop.sowingPeriod}
                        </p>
                        <p className="text-stone-600">
                          <strong>{language === 'bn' ? 'ফসল সংগ্রহ:' : 'Harvest:'}</strong> {crop.harvestPeriod}
                        </p>
                      </div>

                      {/* Soil & Land */}
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                        <span className="font-bold text-stone-800 block">
                          🌱 {language === 'bn' ? 'মাটি ও জমি প্রস্তুতি:' : 'Ideal Soil & Land Prep:'}
                        </span>
                        <p className="text-stone-600 leading-relaxed">
                          {language === 'bn' ? crop.idealSoilBn : crop.idealSoilEn}
                        </p>
                      </div>

                      {/* Water Management */}
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                        <span className="font-bold text-stone-800 block flex items-center space-x-1">
                          <Droplet className="w-3.5 h-3.5 text-blue-600" />
                          <span>{language === 'bn' ? 'সেচ ও পানি ব্যবস্থাপনা:' : 'Water Management:'}</span>
                        </span>
                        <p className="text-stone-600 leading-relaxed">
                          {language === 'bn' ? crop.waterManagementBn : crop.waterManagementEn}
                        </p>
                      </div>

                      {/* Fertilizer */}
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                        <span className="font-bold text-stone-800 block flex items-center space-x-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>{language === 'bn' ? 'সুষম সার প্রয়োগ মাত্রা:' : 'Fertilizer Application:'}</span>
                        </span>
                        <p className="text-stone-600 leading-relaxed">
                          {language === 'bn' ? crop.fertilizerDoseBn : crop.fertilizerDoseEn}
                        </p>
                      </div>
                    </div>

                    {/* IPM & Organic Protection */}
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-emerald-950">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>{language === 'bn' ? 'সমন্বিত বালাই দমন (IPM) ও জৈব সুরক্ষার উপায়:' : 'Integrated Pest Management (IPM) & Organic Defense:'}</span>
                      </div>
                      <p className="text-emerald-900 leading-relaxed">
                        {language === 'bn' ? crop.organicProtectionBn : crop.organicProtectionEn}
                      </p>

                      <div className="mt-2 pt-2 border-t border-emerald-200/60 flex flex-wrap gap-1.5">
                        <span className="font-semibold text-stone-600 mr-1">{language === 'bn' ? 'প্রধান বালাই:' : 'Key Pests:'}</span>
                        {(language === 'bn' ? crop.commonPestsBn : crop.commonPestsEn).map((pest, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white text-stone-700 border border-emerald-200 text-[11px]">
                            • {pest}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Farm Activity & Input Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              {t.farmer.taskLogTitle}
            </h2>
            <p className="text-xs text-stone-500">
              {language === 'bn' ? 'সার প্রয়োগ, সেচ ও ফসলের কাজের হিসাব সহজে সংরক্ষণ করুন।' : 'Track fieldwork, pesticide-free interventions, and operational costs.'}
            </p>
          </div>

          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-md shadow-amber-700/20 flex items-center space-x-1.5 self-start sm:self-center cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.farmer.addTaskLog}</span>
          </button>
        </div>

        {/* Task Log Table / List */}
        <div className="space-y-2">
          {taskLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-amber-900 px-2 py-0.5 rounded bg-amber-100">
                    {log.cropName}
                  </span>
                  <span className="text-stone-400 text-[11px]">{log.date}</span>
                </div>
                <p className="text-stone-700 font-medium leading-relaxed">
                  {log.activity}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {log.expense && (
                  <span className="font-bold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                    ৳ {log.expense}
                  </span>
                )}
                <button
                  onClick={() => handleDeleteTask(log.id)}
                  className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IPM Notice Banner */}
      <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs text-amber-950">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold mb-1">{t.farmer.ipmNoticeTitle}</h4>
          <p className="leading-relaxed text-amber-900">{t.farmer.ipmNoticeText}</p>
        </div>
      </div>

      {/* Edit Farm Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-base">{t.farmer.editFarmProfile}</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 mb-1 block">{t.farmer.farmName}</label>
                <input
                  type="text"
                  value={editFarmName}
                  onChange={(e) => setEditFarmName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 mb-1 block">{language === 'bn' ? 'অবস্থান / জেলা' : 'Location'}</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 mb-1 block">{t.farmer.landSize}</label>
                  <input
                    type="text"
                    value={editLandSize}
                    onChange={(e) => setEditLandSize(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 mb-1 block">{t.farmer.primarySoil}</label>
                  <input
                    type="text"
                    value={editSoilType}
                    onChange={(e) => setEditSoilType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 mb-1 block">{t.farmer.irrigation}</label>
                <input
                  type="text"
                  value={editWaterSource}
                  onChange={(e) => setEditWaterSource(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold"
                >
                  {t.plantForm.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 text-white font-bold"
                >
                  {language === 'bn' ? 'সংরক্ষণ' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Log Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-base">{t.farmer.addTaskLog}</h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTaskLog} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 mb-1 block">{t.farmer.logCrop}</label>
                <select
                  value={newLogCrop}
                  onChange={(e) => setNewLogCrop(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none"
                >
                  {farmerCropsData.map((c) => (
                    <option key={c.id} value={language === 'bn' ? c.nameBn : c.nameEn}>
                      {language === 'bn' ? c.nameBn : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 mb-1 block">{t.farmer.logActivity} *</label>
                <textarea
                  rows={2}
                  value={newLogActivity}
                  onChange={(e) => setNewLogActivity(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: ডিএপি সার প্রয়োগ, বালাই দমন, সেচ প্রদান' : 'e.g. Sowing, fertilizer top-dress, irrigation'}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 mb-1 block">{t.farmer.logDate}</label>
                  <input
                    type="date"
                    value={newLogDate}
                    onChange={(e) => setNewLogDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 mb-1 block">{language === 'bn' ? 'খরচ (টাকা, ঐচ্ছিক)' : 'Cost (BDT, Optional)'}</label>
                  <input
                    type="number"
                    value={newLogExpense}
                    onChange={(e) => setNewLogExpense(e.target.value)}
                    placeholder="0"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold"
                >
                  {t.plantForm.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 text-white font-bold"
                >
                  {language === 'bn' ? 'যোগ করুন' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
