import React, { useState, useEffect } from 'react';
import { X, Image, AlertCircle, Sparkles } from 'lucide-react';
import { Plant, Language, PlantCategory, PlantLocation, PlantHealth } from '../types';
import { translations } from '../translations';

interface PlantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plant: Partial<Plant>) => void;
  plantToEdit?: Plant | null;
  language: Language;
}

const PRESET_IMAGES = [
  { name: 'Monstera / Foliage', url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Money Plant', url: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?w=600&auto=format&fit=crop&q=80' },
  { name: 'Tomato', url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&auto=format&fit=crop&q=80' },
  { name: 'Aloe Vera', url: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600&auto=format&fit=crop&q=80' },
  { name: 'Chili', url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80' },
  { name: 'Rose', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { name: 'Basil', url: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=600&auto=format&fit=crop&q=80' },
  { name: 'Snake Plant', url: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?w=600&auto=format&fit=crop&q=80' },
];

export const PlantFormModal: React.FC<PlantFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  plantToEdit,
  language,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  const [name, setName] = useState('');
  const [bengaliName, setBengaliName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState<PlantCategory>('houseplant');
  const [location, setLocation] = useState<PlantLocation>('balcony');
  const [sunlightNeeds, setSunlightNeeds] = useState<'low' | 'medium' | 'direct_sun' | 'bright_indirect'>('bright_indirect');
  const [wateringFrequencyDays, setWateringFrequencyDays] = useState<number>(4);
  const [health, setHealth] = useState<PlantHealth>('healthy');
  const [photoUrl, setPhotoUrl] = useState(PRESET_IMAGES[0].url);
  const [soilType, setSoilType] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (plantToEdit) {
      setName(plantToEdit.name);
      setBengaliName(plantToEdit.bengaliName || '');
      setScientificName(plantToEdit.scientificName || '');
      setCategory(plantToEdit.category);
      setLocation(plantToEdit.location);
      setSunlightNeeds(plantToEdit.sunlightNeeds);
      setWateringFrequencyDays(plantToEdit.wateringFrequencyDays);
      setHealth(plantToEdit.health);
      setPhotoUrl(plantToEdit.photoUrl);
      setSoilType(plantToEdit.soilType || '');
      setNotes(plantToEdit.notes || '');
    } else {
      // Default reset
      setName('');
      setBengaliName('');
      setScientificName('');
      setCategory('houseplant');
      setLocation('balcony');
      setSunlightNeeds('bright_indirect');
      setWateringFrequencyDays(4);
      setHealth('healthy');
      setPhotoUrl(PRESET_IMAGES[0].url);
      setSoilType('');
      setNotes('');
    }
    setError('');
  }, [plantToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.plantForm.validationError);
      return;
    }

    onSave({
      name: name.trim(),
      bengaliName: bengaliName.trim() || undefined,
      scientificName: scientificName.trim() || undefined,
      category,
      location,
      sunlightNeeds,
      wateringFrequencyDays: Number(wateringFrequencyDays) || 4,
      health,
      photoUrl: photoUrl.trim() || PRESET_IMAGES[0].url,
      soilType: soilType.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <h2 className="text-xl font-bold text-stone-900">
            {plantToEdit ? t.plantForm.editTitle : t.plantForm.addTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Plant Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.plantForm.plantName} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.plantForm.plantNamePlaceholder}
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.plantForm.bengaliName}
              </label>
              <input
                type="text"
                value={bengaliName}
                onChange={(e) => setBengaliName(e.target.value)}
                placeholder={t.plantForm.bengaliNamePlaceholder}
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.plantForm.scientificName}
            </label>
            <input
              type="text"
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              placeholder={t.plantForm.scientificNamePlaceholder}
              className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none italic"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.plantForm.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PlantCategory)}
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none capitalize"
              >
                <option value="houseplant">{t.myGarden.houseplant}</option>
                <option value="vegetable">{t.myGarden.vegetable}</option>
                <option value="flower">{t.myGarden.flower}</option>
                <option value="herb">{t.myGarden.herb}</option>
                <option value="succulent">{t.myGarden.succulent}</option>
                <option value="fruit">{t.myGarden.fruit}</option>
                <option value="crop">{t.myGarden.crop}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.plantForm.location}
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as PlantLocation)}
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none capitalize"
              >
                <option value="balcony">{t.myGarden.balcony}</option>
                <option value="indoor">{t.myGarden.indoor}</option>
                <option value="rooftop">{t.myGarden.rooftop}</option>
                <option value="outdoor">{t.myGarden.outdoor}</option>
                <option value="field">{t.myGarden.field}</option>
              </select>
            </div>
          </div>

          {/* Sunlight & Watering */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.plantForm.sunlight}
              </label>
              <select
                value={sunlightNeeds}
                onChange={(e) => setSunlightNeeds(e.target.value as any)}
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
              >
                <option value="bright_indirect">{t.plantForm.sunBrightIndirect}</option>
                <option value="direct_sun">{t.plantForm.sunDirect}</option>
                <option value="medium">{t.plantForm.sunMedium}</option>
                <option value="low">{t.plantForm.sunLow}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t.plantForm.wateringFrequency}
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={wateringFrequencyDays}
                onChange={(e) => setWateringFrequencyDays(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
              />
              <span className="text-[10px] text-stone-500 mt-0.5 block">{t.plantForm.wateringHelp}</span>
            </div>
          </div>

          {/* Health Status */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.plantForm.healthStatus}
            </label>
            <div className="flex gap-2">
              {[
                { val: 'healthy', label: t.myGarden.healthy, color: 'text-emerald-700 border-emerald-300 bg-emerald-50' },
                { val: 'needs_attention', label: t.myGarden.needsAttention, color: 'text-amber-700 border-amber-300 bg-amber-50' },
                { val: 'recovering', label: t.myGarden.recovering, color: 'text-blue-700 border-blue-300 bg-blue-50' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setHealth(opt.val as PlantHealth)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    health === opt.val
                      ? `${opt.color} ring-2 ring-emerald-500/30`
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo URL & Presets */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.plantForm.photoUrl} (Image URL)
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
            />
            
            {/* Quick Preset Selector */}
            <div className="mt-2">
              <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                {t.plantForm.choosePreset}:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setPhotoUrl(preset.url)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      photoUrl === preset.url ? 'border-emerald-600 ring-2 ring-emerald-500/40' : 'border-stone-200 hover:border-stone-400'
                    }`}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t.plantForm.notes}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.plantForm.notesPlaceholder}
              className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-all cursor-pointer"
            >
              {t.plantForm.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              {t.plantForm.savePlant}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
