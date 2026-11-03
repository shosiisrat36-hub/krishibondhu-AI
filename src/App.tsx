import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Tractor, 
  Heart, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink,
  KeyRound
} from 'lucide-react';
import { Language, UserRole, Plant, Reminder } from './types';
import { translations } from './translations';
import { defaultPlants } from './data/defaultPlants';
import { defaultReminders } from './data/defaultReminders';

import { Header } from './components/Header';
import { WelcomeModal } from './components/WelcomeModal';
import { DashboardHome } from './components/DashboardHome';
import { AiAssistant } from './components/AiAssistant';
import { MyGarden } from './components/MyGarden';
import { PlantDoctor } from './components/PlantDoctor';
import { PlantCareGuide } from './components/PlantCareGuide';
import { SmartReminders } from './components/SmartReminders';
import { FarmerDashboard } from './components/FarmerDashboard';
import { WeatherSection } from './components/WeatherSection';
import { KnowledgeHub } from './components/KnowledgeHub';
import { ApiStatusModal } from './components/ApiStatusModal';

export default function App() {
  // 1. Language state
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('krishi_language');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn';
  });

  // 2. User Role state (Home Gardener vs Farmer)
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('krishi_user_role');
    return (saved === 'farmer' || saved === 'gardener') ? saved : 'gardener';
  });

  // 3. Welcome / Onboarding modal state (opens on first visit)
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    return !localStorage.getItem('krishi_onboarding_completed');
  });

  // 4. Current navigation tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // 5. Plants collection state (persisted in localStorage)
  const [plants, setPlants] = useState<Plant[]>(() => {
    const saved = localStorage.getItem('krishi_plants');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse plants from localStorage:', e);
      }
    }
    return defaultPlants;
  });

  // 6. Reminders state (persisted in localStorage)
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('krishi_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse reminders from localStorage:', e);
      }
    }
    return defaultReminders;
  });

  // 7. AI API Connection status
  const [hasAiApiKey, setHasAiApiKey] = useState<boolean>(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);

  // 8. Preselected plant for direct Plant Doctor referral
  const [doctorPreselectedPlant, setDoctorPreselectedPlant] = useState<Plant | null>(null);

  // Persist language
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('krishi_language', lang);
  };

  // Persist user role
  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('krishi_user_role', role);
  };

  const handleSelectRoleFromWelcome = (role: UserRole) => {
    handleRoleChange(role);
    setShowWelcomeModal(false);
    localStorage.setItem('krishi_onboarding_completed', 'true');
    // If farmer selected, land them on dashboard or farmerHub
    if (role === 'farmer') {
      setCurrentTab('farmerHub');
    } else {
      setCurrentTab('dashboard');
    }
  };

  // Check backend AI server status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setHasAiApiKey(Boolean(data.hasAiApiKey));
        }
      } catch (err) {
        console.warn('Could not connect to /api/status endpoint:', err);
      }
    };
    checkStatus();
  }, []);

  // Save plants on change
  useEffect(() => {
    localStorage.setItem('krishi_plants', JSON.stringify(plants));
  }, [plants]);

  // Save reminders on change
  useEffect(() => {
    localStorage.setItem('krishi_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Plant CRUD operations
  const handleAddPlant = (newPlantData: Partial<Plant>) => {
    const newPlant: Plant = {
      id: `plant-${Date.now()}`,
      name: newPlantData.name || 'Untitled Plant',
      bengaliName: newPlantData.bengaliName,
      scientificName: newPlantData.scientificName,
      category: newPlantData.category || 'houseplant',
      location: newPlantData.location || 'balcony',
      photoUrl: newPlantData.photoUrl || 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?w=600&auto=format&fit=crop&q=80',
      dateAdded: new Date().toISOString().split('T')[0],
      lastWatered: new Date().toISOString().split('T')[0],
      wateringFrequencyDays: newPlantData.wateringFrequencyDays || 4,
      sunlightNeeds: newPlantData.sunlightNeeds || 'bright_indirect',
      soilType: newPlantData.soilType,
      health: newPlantData.health || 'healthy',
      notes: newPlantData.notes,
      careTips: [
        'Check soil moisture before pouring water',
        'Ensure drainage hole stays unblocked',
        'Wipe leaves occasionally to remove dust',
      ],
    };

    setPlants((prev) => [newPlant, ...prev]);

    // Also auto-generate an initial watering reminder
    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      plantId: newPlant.id,
      plantName: newPlant.name,
      title: `${language === 'bn' ? 'পানি দেওয়া:' : 'Water:'} ${newPlant.name}`,
      type: 'water',
      dueDate: new Date(Date.now() + newPlant.wateringFrequencyDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueTime: '08:30',
      repeat: 'every_3_days',
      completed: false,
    };
    setReminders((prev) => [newReminder, ...prev]);
  };

  const handleEditPlant = (updated: Plant) => {
    setPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePlant = (plantId: string) => {
    setPlants((prev) => prev.filter((p) => p.id !== plantId));
    // Also remove associated reminders
    setReminders((prev) => prev.filter((r) => r.plantId !== plantId));
  };

  const handleWaterPlant = (plantId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setPlants((prev) =>
      prev.map((p) => (p.id === plantId ? { ...p, lastWatered: today } : p))
    );
  };

  // Referral to Plant Doctor
  const handleConsultDoctorWithPlant = (plant: Plant) => {
    setDoctorPreselectedPlant(plant);
    setCurrentTab('plantDoctor');
  };

  // Reminders CRUD operations
  const handleAddReminder = (reminderData: Partial<Reminder>) => {
    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      plantId: reminderData.plantId,
      plantName: reminderData.plantName || 'Garden Task',
      title: reminderData.title || 'General Plant Care',
      type: reminderData.type || 'water',
      dueDate: reminderData.dueDate || new Date().toISOString().split('T')[0],
      dueTime: reminderData.dueTime || '09:00',
      repeat: reminderData.repeat || 'weekly',
      completed: false,
      notes: reminderData.notes,
    };
    setReminders((prev) => [newRem, ...prev]);
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              completed: !r.completed,
              completedAt: !r.completed ? new Date().toISOString() : undefined,
            }
          : r
      )
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Pending reminder count for header badge
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingCount = reminders.filter((r) => !r.completed && r.dueDate <= todayStr).length;

  const t = translations[language];

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-800 flex flex-col justify-between selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Top Application Header */}
      <div>
        <Header
          language={language}
          onLanguageChange={handleLanguageChange}
          userRole={userRole}
          onRoleChange={handleRoleChange}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          hasAiApiKey={hasAiApiKey}
          onOpenApiModal={() => setIsApiModalOpen(true)}
          pendingRemindersCount={pendingCount}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {currentTab === 'dashboard' && (
            <DashboardHome
              language={language}
              userRole={userRole}
              plants={plants}
              reminders={reminders}
              onNavigate={setCurrentTab}
              onWaterPlant={handleWaterPlant}
              onOpenPlantDoctorWithPlant={handleConsultDoctorWithPlant}
              hasAiApiKey={hasAiApiKey}
            />
          )}

          {currentTab === 'assistant' && (
            <AiAssistant
              language={language}
              userRole={userRole}
              hasAiApiKey={hasAiApiKey}
            />
          )}

          {currentTab === 'myGarden' && (
            <MyGarden
              plants={plants}
              onAddPlant={handleAddPlant}
              onEditPlant={handleEditPlant}
              onDeletePlant={handleDeletePlant}
              onWaterPlant={handleWaterPlant}
              onConsultDoctor={handleConsultDoctorWithPlant}
              language={language}
            />
          )}

          {currentTab === 'plantDoctor' && (
            <PlantDoctor
              language={language}
              hasAiApiKey={hasAiApiKey}
              preselectedPlant={doctorPreselectedPlant}
              onClearPreselectedPlant={() => setDoctorPreselectedPlant(null)}
            />
          )}

          {currentTab === 'careGuide' && (
            <PlantCareGuide
              language={language}
              onImportToGarden={handleAddPlant}
            />
          )}

          {currentTab === 'reminders' && (
            <SmartReminders
              reminders={reminders}
              plants={plants}
              onAddReminder={handleAddReminder}
              onToggleComplete={handleToggleReminder}
              onDeleteReminder={handleDeleteReminder}
              language={language}
            />
          )}

          {currentTab === 'farmerHub' && (
            <FarmerDashboard language={language} />
          )}

          {currentTab === 'weather' && (
            <WeatherSection language={language} />
          )}

          {currentTab === 'knowledge' && (
            <KnowledgeHub language={language} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-bold text-stone-800 text-sm">{t.app.name}</span>
            <span className="text-stone-400">•</span>
            <span>{t.app.tagline}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-500">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'bn' ? 'সমন্বিত জৈব কৃষি পরামর্শ' : 'Safe Agronomic Guidance'}</span>
            </span>
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
            >
              {hasAiApiKey ? 'Gemini 3.8 Flash' : t.app.demoModeActive}
            </button>
            <button
              onClick={() => setShowWelcomeModal(true)}
              className="text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
            >
              {t.nav.switchRole}
            </button>
          </div>
        </div>
      </footer>

      {/* Onboarding Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onSelectRole={handleSelectRoleFromWelcome}
        language={language}
        onClose={() => setShowWelcomeModal(false)}
      />

      {/* AI & Secrets Status Modal */}
      <ApiStatusModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        hasAiApiKey={hasAiApiKey}
        language={language}
      />

    </div>
  );
}
