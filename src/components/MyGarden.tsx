import React, { useState } from 'react';
import { 
  Flower2, 
  Plus, 
  Search, 
  Droplet, 
  Sun, 
  MapPin, 
  Stethoscope, 
  Filter,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Plant, Language, PlantLocation, PlantCategory } from '../types';
import { translations } from '../translations';
import { PlantDetailModal } from './PlantDetailModal';
import { PlantFormModal } from './PlantFormModal';

interface MyGardenProps {
  plants: Plant[];
  onAddPlant: (plant: Partial<Plant>) => void;
  onEditPlant: (plant: Plant) => void;
  onDeletePlant: (plantId: string) => void;
  onWaterPlant: (plantId: string) => void;
  onConsultDoctor: (plant: Plant) => void;
  language: Language;
}

export const MyGarden: React.FC<MyGardenProps> = ({
  plants,
  onAddPlant,
  onEditPlant,
  onDeletePlant,
  onWaterPlant,
  onConsultDoctor,
  language,
}) => {
  const t = translations[language];

  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPlantForDetail, setSelectedPlantForDetail] = useState<Plant | null>(null);
  const [selectedPlantForEdit, setSelectedPlantForEdit] = useState<Plant | null>(null);

  // Filter logic
  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = 
      plant.name.toLowerCase().includes(search.toLowerCase()) ||
      (plant.bengaliName && plant.bengaliName.toLowerCase().includes(search.toLowerCase())) ||
      (plant.scientificName && plant.scientificName.toLowerCase().includes(search.toLowerCase()));

    const matchesLocation = selectedLocation === 'all' || plant.location === selectedLocation;
    const matchesCategory = selectedCategory === 'all' || plant.category === selectedCategory;

    return matchesSearch && matchesLocation && matchesCategory;
  });

  // Calculate watering countdown for a plant
  const getWaterCountdown = (plant: Plant) => {
    if (!plant.lastWatered) return { daysLeft: 0, percentage: 100, isOverdue: true };
    const last = new Date(plant.lastWatered).getTime();
    const now = new Date().getTime();
    const elapsedDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    const daysLeft = plant.wateringFrequencyDays - elapsedDays;
    const percentage = Math.max(0, Math.min(100, (daysLeft / plant.wateringFrequencyDays) * 100));

    return {
      daysLeft,
      percentage,
      isOverdue: daysLeft < 0,
      isDueToday: daysLeft === 0,
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Flower2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.myGarden.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            {t.myGarden.subtitle}
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.myGarden.addNewPlant}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.myGarden.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-stone-800 outline-none transition-all"
          />
        </div>

        {/* Location Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full sm:w-auto bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 outline-none"
          >
            <option value="all">{t.myGarden.allLocations}</option>
            <option value="balcony">{t.myGarden.balcony}</option>
            <option value="indoor">{t.myGarden.indoor}</option>
            <option value="rooftop">{t.myGarden.rooftop}</option>
            <option value="outdoor">{t.myGarden.outdoor}</option>
            <option value="field">{t.myGarden.field}</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 outline-none"
          >
            <option value="all">{t.myGarden.allCategories}</option>
            <option value="houseplant">{t.myGarden.houseplant}</option>
            <option value="vegetable">{t.myGarden.vegetable}</option>
            <option value="flower">{t.myGarden.flower}</option>
            <option value="herb">{t.myGarden.herb}</option>
            <option value="succulent">{t.myGarden.succulent}</option>
            <option value="crop">{t.myGarden.crop}</option>
          </select>
        </div>
      </div>

      {/* Plant Cards Grid */}
      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPlants.map((plant) => {
            const waterStatus = getWaterCountdown(plant);
            return (
              <div
                key={plant.id}
                className="group bg-white rounded-3xl border border-stone-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-44 w-full bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setSelectedPlantForDetail(plant)}>
                    <img
                      src={plant.photoUrl}
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Location Tag */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-stone-800 backdrop-blur-xs shadow-xs flex items-center space-x-1 capitalize">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{t.myGarden[plant.location as keyof typeof t.myGarden] || plant.location}</span>
                    </span>

                    {/* Health Status Pill */}
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                      plant.health === 'healthy'
                        ? 'bg-emerald-500 text-white'
                        : plant.health === 'needs_attention'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {plant.health === 'healthy' ? t.myGarden.healthy : plant.health === 'needs_attention' ? t.myGarden.needsAttention : t.myGarden.recovering}
                    </span>

                    {/* Category */}
                    <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white drop-shadow-xs uppercase tracking-wider">
                      {t.myGarden[plant.category as keyof typeof t.myGarden] || plant.category}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5">
                    <h3
                      onClick={() => setSelectedPlantForDetail(plant)}
                      className="font-bold text-base text-stone-900 group-hover:text-emerald-800 transition-colors cursor-pointer truncate"
                    >
                      {plant.name}
                    </h3>
                    {plant.bengaliName && (
                      <p className="text-xs font-semibold text-emerald-700 truncate">
                        {plant.bengaliName}
                      </p>
                    )}

                    {/* Watering Status Bar */}
                    <div className="mt-3 bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-stone-500 flex items-center space-x-1">
                          <Droplet className={`w-3.5 h-3.5 ${waterStatus.isOverdue ? 'text-rose-500' : 'text-emerald-600'}`} />
                          <span className="font-semibold">{t.myGarden.lastWatered}:</span>
                        </span>
                        <span className="font-bold text-stone-700">
                          {waterStatus.isOverdue ? (
                            <span className="text-rose-600">{t.myGarden.overdue}</span>
                          ) : waterStatus.isDueToday ? (
                            <span className="text-amber-600">{language === 'bn' ? 'আজকে' : 'Today'}</span>
                          ) : (
                            `${waterStatus.daysLeft} ${t.myGarden.days}`
                          )}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            waterStatus.isOverdue
                              ? 'bg-rose-500'
                              : waterStatus.isDueToday
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${waterStatus.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Buttons */}
                <div className="px-4 pb-4 pt-1 flex items-center gap-2 border-t border-stone-100">
                  <button
                    onClick={() => onWaterPlant(plant.id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    title={t.myGarden.waterNow}
                  >
                    <Droplet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t.myGarden.waterNow}</span>
                  </button>

                  <button
                    onClick={() => onConsultDoctor(plant)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-800 transition-all cursor-pointer"
                    title={t.myGarden.consultDoctor}
                  >
                    <Stethoscope className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedPlantForDetail(plant)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-all cursor-pointer"
                    title={t.myGarden.viewDetails}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Flower2 className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-stone-800 mb-1">
            {t.myGarden.noPlantsTitle}
          </h3>
          <p className="text-xs text-stone-500 mb-6 max-w-sm mx-auto leading-relaxed">
            {t.myGarden.noPlantsDesc}
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.myGarden.addFirstPlant}</span>
          </button>
        </div>
      )}

      {/* Plant Detail Modal */}
      <PlantDetailModal
        plant={selectedPlantForDetail}
        isOpen={Boolean(selectedPlantForDetail)}
        onClose={() => setSelectedPlantForDetail(null)}
        onWater={onWaterPlant}
        onEdit={(plant) => setSelectedPlantForEdit(plant)}
        onDelete={onDeletePlant}
        onConsultDoctor={onConsultDoctor}
        language={language}
      />

      {/* Plant Add / Edit Form Modal */}
      <PlantFormModal
        isOpen={isAddOpen || Boolean(selectedPlantForEdit)}
        onClose={() => {
          setIsAddOpen(false);
          setSelectedPlantForEdit(null);
        }}
        onSave={(data) => {
          if (selectedPlantForEdit) {
            onEditPlant({ ...selectedPlantForEdit, ...data } as Plant);
          } else {
            onAddPlant(data);
          }
          setIsAddOpen(false);
          setSelectedPlantForEdit(null);
        }}
        plantToEdit={selectedPlantForEdit}
        language={language}
      />

    </div>
  );
};
