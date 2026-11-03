export type Language = 'bn' | 'en';
export type UserRole = 'gardener' | 'farmer';

export type PlantLocation = 'indoor' | 'outdoor' | 'balcony' | 'rooftop' | 'field';
export type PlantCategory = 'houseplant' | 'vegetable' | 'fruit' | 'flower' | 'herb' | 'succulent' | 'crop';
export type PlantHealth = 'healthy' | 'needs_attention' | 'recovering';

export interface Plant {
  id: string;
  name: string;
  bengaliName?: string;
  scientificName?: string;
  category: PlantCategory;
  location: PlantLocation;
  photoUrl: string;
  dateAdded: string; // YYYY-MM-DD
  lastWatered?: string; // YYYY-MM-DD
  wateringFrequencyDays: number;
  sunlightNeeds: 'low' | 'medium' | 'direct_sun' | 'bright_indirect';
  soilType?: string;
  health: PlantHealth;
  notes?: string;
  careTips?: string[];
}

export type ReminderType = 'water' | 'fertilize' | 'prune' | 'soil_work' | 'pest_check' | 'harvest' | 'repot';

export interface Reminder {
  id: string;
  plantId?: string;
  plantName: string;
  title: string;
  type: ReminderType;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  repeat: 'none' | 'daily' | 'every_2_days' | 'every_3_days' | 'weekly' | 'biweekly' | 'monthly';
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isDemo?: boolean;
}

export interface PlantDiagnosisResult {
  plantIdentification: string;
  healthyConfidence: 'Healthy' | 'Mild Issues' | 'Diseased / Stressed';
  symptomsObserved: string[];
  possibleCauses: Array<{
    cause: string;
    probability: 'High' | 'Medium' | 'Low';
    explanation: string;
  }>;
  safeCareActions: string[];
  followUpQuestions: string[];
  safetyDisclaimer: string;
}

export interface PlantCareItem {
  id: string;
  nameEn: string;
  nameBn: string;
  scientificName: string;
  category: PlantCategory;
  image: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  wateringEn: string;
  wateringBn: string;
  wateringDays: number;
  sunlightEn: string;
  sunlightBn: string;
  soilEn: string;
  soilBn: string;
  fertilizerEn: string;
  fertilizerBn: string;
  pruningEn: string;
  pruningBn: string;
  commonProblemsEn: string[];
  commonProblemsBn: string[];
}

export interface FarmerCropProfile {
  id: string;
  nameEn: string;
  nameBn: string;
  seasonEn: string;
  seasonBn: string;
  sowingPeriod: string;
  harvestPeriod: string;
  idealSoilEn: string;
  idealSoilBn: string;
  waterManagementEn: string;
  waterManagementBn: string;
  fertilizerDoseEn: string;
  fertilizerDoseBn: string;
  commonPestsEn: string[];
  commonPestsBn: string[];
  organicProtectionEn: string;
  organicProtectionBn: string;
  yieldEstimate: string;
  image: string;
}

export interface FarmProfile {
  farmName: string;
  location: string;
  landSize: string; // e.g. "2 Bigha"
  soilType: string;
  primaryWaterSource: string;
  currentCrops: string[];
  notes?: string;
}

export interface FarmTaskLog {
  id: string;
  date: string;
  cropName: string;
  activity: string;
  notes?: string;
  expense?: number;
}

export interface WeatherData {
  city: string;
  districtBn: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitationProb: number;
  windSpeed: number;
  weatherCode: number;
  descriptionEn: string;
  descriptionBn: string;
  isDemo?: boolean;
  advisoryEn: string;
  advisoryBn: string;
}

export interface KnowledgeArticle {
  id: string;
  titleEn: string;
  titleBn: string;
  categoryEn: string;
  categoryBn: string;
  readTime: string;
  summaryEn: string;
  summaryBn: string;
  contentEn: string;
  contentBn: string;
  tags: string[];
  coverImage: string;
}
