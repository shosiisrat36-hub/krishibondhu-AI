import React from 'react';
import { 
  X, 
  Droplet, 
  Sun, 
  Layers, 
  Calendar, 
  MapPin, 
  Stethoscope, 
  Edit3, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';
import { Plant, Language } from '../types';
import { translations } from '../translations';

interface PlantDetailModalProps {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
  onWater: (plantId: string) => void;
  onEdit: (plant: Plant) => void;
  onDelete: (plantId: string) => void;
  onConsultDoctor: (plant: Plant) => void;
  language: Language;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plant,
  isOpen,
  onClose,
  onWater,
  onEdit,
  onDelete,
  onConsultDoctor,
  language,
}) => {
  if (!isOpen || !plant) return null;
  const t = translations[language];

  // Calculate days since last watered
  const calculateWateringStatus = () => {
    if (!plant.lastWatered) return { daysSince: 0, daysLeft: 0, isOverdue: false };
    const last = new Date(plant.lastWatered).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    const daysLeft = plant.wateringFrequencyDays - diffDays;
    return {
      daysSince: diffDays,
      daysLeft,
      isOverdue: daysLeft < 0,
    };
  };

  const status = calculateWateringStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 my-8">
        
        {/* Cover Photo & Header */}
        <div className="relative h-64 sm:h-72 w-full bg-stone-200">
          <img
            src={plant.photoUrl}
            alt={plant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-xs"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Plant Name & Badges */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
                {t.myGarden[plant.category as keyof typeof t.myGarden] || plant.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                plant.health === 'healthy' 
                  ? 'bg-emerald-500/90 text-white' 
                  : plant.health === 'needs_attention' 
                  ? 'bg-amber-500/90 text-white' 
                  : 'bg-blue-500/90 text-white'
              }`}>
                {plant.health === 'healthy' ? t.myGarden.healthy : plant.health === 'needs_attention' ? t.myGarden.needsAttention : t.myGarden.recovering}
              </span>
            </div>
            
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              {plant.name}
            </h2>
            {plant.bengaliName && (
              <p className="text-sm font-semibold text-emerald-200">
                {plant.bengaliName}
              </p>
            )}
            {plant.scientificName && (
              <p className="text-xs italic text-stone-300">
                {plant.scientificName}
              </p>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Quick Watering Action Card */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            status.isOverdue
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : status.daysLeft === 0
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                status.isOverdue ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold opacity-75">
                  {t.myGarden.lastWatered}: {plant.lastWatered || (language === 'bn' ? 'জানা নেই' : 'Not recorded')}
                </p>
                <p className="text-sm font-bold">
                  {status.isOverdue
                    ? t.myGarden.overdue
                    : status.daysLeft === 0
                    ? t.myGarden.waterDueIn + ' ' + (language === 'bn' ? 'আজকে' : 'Today')
                    : `${t.myGarden.waterDueIn} ${status.daysLeft} ${t.myGarden.days}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => onWater(plant.id)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer shrink-0"
            >
              {t.myGarden.waterNow}
            </button>
          </div>

          {/* Environmental Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div className="flex items-center space-x-1.5 text-stone-500 text-xs mb-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'bn' ? 'সূর্যালোক' : 'Sunlight'}</span>
              </div>
              <p className="text-xs font-bold text-stone-800">
                {plant.sunlightNeeds === 'direct_sun'
                  ? (language === 'bn' ? 'সরাসরি রোদ (৪-৬ ঘণ্টা)' : 'Direct Sun (4-6h)')
                  : plant.sunlightNeeds === 'bright_indirect'
                  ? (language === 'bn' ? 'উজ্জ্বল পরোক্ষ আলো' : 'Bright Indirect')
                  : plant.sunlightNeeds === 'medium'
                  ? (language === 'bn' ? 'মাঝারি আধা-ছায়া' : 'Medium / Semi-shade')
                  : (language === 'bn' ? 'কম আলো' : 'Low Light')}
              </p>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div className="flex items-center space-x-1.5 text-stone-500 text-xs mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'স্থান' : 'Location'}</span>
              </div>
              <p className="text-xs font-bold text-stone-800 capitalize">
                {t.myGarden[plant.location as keyof typeof t.myGarden] || plant.location}
              </p>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 col-span-2 sm:col-span-1">
              <div className="flex items-center space-x-1.5 text-stone-500 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'bn' ? 'সংযুক্তির তারিখ' : 'Added Date'}</span>
              </div>
              <p className="text-xs font-bold text-stone-800">
                {plant.dateAdded}
              </p>
            </div>
          </div>

          {/* Soil & Notes */}
          {plant.soilType && (
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
              <span className="font-bold text-stone-700 flex items-center space-x-1 mb-1">
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                <span>{language === 'bn' ? 'মাটির ধরণ / পটিং মিক্স:' : 'Soil / Potting Mix:'}</span>
              </span>
              <p className="text-stone-600">{plant.soilType}</p>
            </div>
          )}

          {plant.notes && (
            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs">
              <span className="font-bold text-amber-950 mb-1 block">
                {language === 'bn' ? 'যত্ন ও পাত্রের নোট:' : 'Care & Pot Notes:'}
              </span>
              <p className="text-amber-900 leading-relaxed">{plant.notes}</p>
            </div>
          )}

          {/* Care Tips */}
          {plant.careTips && plant.careTips.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                {language === 'bn' ? 'বিশেষ যত্ন টিপস' : 'Key Care Tips'}
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-600">
                {plant.careTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
            
            {/* Consult Plant Doctor Button */}
            <button
              onClick={() => {
                onClose();
                onConsultDoctor(plant);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-all cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              <span>{t.myGarden.consultDoctor}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(plant);
                }}
                className="flex items-center space-x-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.myGarden.editPlant}</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm(t.myGarden.confirmDelete)) {
                    onDelete(plant.id);
                    onClose();
                  }
                }}
                className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.myGarden.deletePlant}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
