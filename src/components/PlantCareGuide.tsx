import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  AlertCircle, 
  Droplet, 
  Sun, 
  Layers, 
  Sparkles, 
  Scissors, 
  Plus, 
  Check, 
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Language, PlantCareItem } from '../types';
import { translations } from '../translations';
import { plantCareDatabase } from '../data/plantCareData';

interface PlantCareGuideProps {
  language: Language;
  onImportToGarden: (plant: {
    name: string;
    bengaliName?: string;
    scientificName?: string;
    category: any;
    location: any;
    photoUrl: string;
    wateringFrequencyDays: number;
    sunlightNeeds: any;
    soilType?: string;
    notes?: string;
  }) => void;
}

export const PlantCareGuide: React.FC<PlantCareGuideProps> = ({
  language,
  onImportToGarden,
}) => {
  const t = translations[language];
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(plantCareDatabase[0].id);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const filteredGuides = plantCareDatabase.filter((item) => {
    const matchesSearch = 
      item.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      item.nameBn.toLowerCase().includes(search.toLowerCase()) ||
      item.scientificName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAdd = (guide: PlantCareItem) => {
    onImportToGarden({
      name: language === 'bn' ? guide.nameBn : guide.nameEn,
      bengaliName: guide.nameBn,
      scientificName: guide.scientificName,
      category: guide.category,
      location: guide.category === 'vegetable' ? 'balcony' : guide.category === 'houseplant' ? 'indoor' : 'outdoor',
      photoUrl: guide.image,
      wateringFrequencyDays: guide.wateringDays,
      sunlightNeeds: guide.category === 'vegetable' ? 'direct_sun' : 'bright_indirect',
      soilType: language === 'bn' ? guide.soilBn : guide.soilEn,
      notes: language === 'bn' ? guide.fertilizerBn : guide.fertilizerEn,
    });

    setAddedIds((prev) => [...prev, guide.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== guide.id));
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            {t.careGuide.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl mb-4">
          {t.careGuide.subtitle}
        </p>

        {/* Essential Environmental Warning */}
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-950">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            {t.careGuide.warningNotice}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.careGuide.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-stone-800 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: language === 'bn' ? 'সকল' : 'All' },
            { id: 'houseplant', label: language === 'bn' ? 'ইনডোর' : 'Houseplants' },
            { id: 'vegetable', label: language === 'bn' ? 'সবজি' : 'Vegetables' },
            { id: 'herb', label: language === 'bn' ? 'ভেষজ' : 'Herbs' },
            { id: 'succulent', label: language === 'bn' ? 'সাকুলেন্ট' : 'Succulents' },
            { id: 'flower', label: language === 'bn' ? 'ফুল' : 'Flowers' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plant Care Cards List */}
      <div className="space-y-4">
        {filteredGuides.map((guide) => {
          const isExpanded = expandedId === guide.id;
          const isAdded = addedIds.includes(guide.id);

          return (
            <div
              key={guide.id}
              className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:border-emerald-500/50 transition-all"
            >
              {/* Header preview row */}
              <div
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : guide.id)}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={guide.image}
                    alt={guide.nameEn}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                        {t.myGarden[guide.category as keyof typeof t.myGarden] || guide.category}
                      </span>
                      <span className="text-[10px] font-semibold text-stone-400">
                        {guide.difficulty === 'easy' ? '🟢 ' + (language === 'bn' ? 'সহজ যত্ন' : 'Easy Care') : '🟡 ' + (language === 'bn' ? 'মাঝারি' : 'Moderate')}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-stone-900">
                      {language === 'bn' ? guide.nameBn : guide.nameEn}
                    </h2>
                    <p className="text-xs text-stone-500 italic">
                      {guide.scientificName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(guide);
                    }}
                    disabled={isAdded}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{language === 'bn' ? 'যুক্ত হয়েছে!' : 'Added!'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.careGuide.addToMyGarden}</span>
                      </>
                    )}
                  </button>

                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Detailed Guide Details */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-stone-100 space-y-4 animate-fade-in">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Watering */}
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-stone-900 mb-1">
                        <Droplet className="w-4 h-4 text-emerald-600" />
                        <span>{t.careGuide.watering}</span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        {language === 'bn' ? guide.wateringBn : guide.wateringEn}
                      </p>
                    </div>

                    {/* Sunlight */}
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-stone-900 mb-1">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>{t.careGuide.sunlight}</span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        {language === 'bn' ? guide.sunlightBn : guide.sunlightEn}
                      </p>
                    </div>

                    {/* Soil */}
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-stone-900 mb-1">
                        <Layers className="w-4 h-4 text-amber-700" />
                        <span>{t.careGuide.soil}</span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        {language === 'bn' ? guide.soilBn : guide.soilEn}
                      </p>
                    </div>

                    {/* Fertilizer */}
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-stone-900 mb-1">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>{t.careGuide.fertilizer}</span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        {language === 'bn' ? guide.fertilizerBn : guide.fertilizerEn}
                      </p>
                    </div>
                  </div>

                  {/* Pruning Tips */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-stone-900 mb-1">
                      <Scissors className="w-4 h-4 text-stone-600" />
                      <span>{t.careGuide.pruning}</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      {language === 'bn' ? guide.pruningBn : guide.pruningEn}
                    </p>
                  </div>

                  {/* Common Problems & Remedies */}
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs space-y-2">
                    <div className="flex items-center space-x-1.5 font-bold text-rose-950">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>{t.careGuide.commonProblems}</span>
                    </div>
                    <ul className="space-y-1 text-stone-700">
                      {(language === 'bn' ? guide.commonProblemsBn : guide.commonProblemsEn).map((prob, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{prob}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
