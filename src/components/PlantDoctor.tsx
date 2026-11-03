import React, { useState } from 'react';
import { 
  Stethoscope, 
  Upload, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  RefreshCw,
  Info
} from 'lucide-react';
import { Language, PlantDiagnosisResult, Plant } from '../types';
import { translations } from '../translations';

interface PlantDoctorProps {
  language: Language;
  hasAiApiKey: boolean;
  preselectedPlant?: Plant | null;
  onClearPreselectedPlant?: () => void;
}

export const PlantDoctor: React.FC<PlantDoctorProps> = ({
  language,
  hasAiApiKey,
  preselectedPlant,
  onClearPreselectedPlant,
}) => {
  const t = translations[language];

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');

  // Upload tab state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [plantHint, setPlantHint] = useState<string>(preselectedPlant ? preselectedPlant.name : '');
  const [symptomsInput, setSymptomsInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<PlantDiagnosisResult | null>(null);
  const [isDemoDiagnosis, setIsDemoDiagnosis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Manual Questionnaire state
  const [manualPlantType, setManualPlantType] = useState('vegetable');
  const [manualSymptom, setManualSymptom] = useState('yellow_leaves');
  const [manualMoisture, setManualMoisture] = useState('soggy');
  const [manualLight, setManualLight] = useState('moderate');
  const [manualRegion, setManualRegion] = useState('lower_leaves');
  const [manualResult, setManualResult] = useState<{
    probableCause: string;
    explanation: string;
    remedySteps: string[];
    prevention: string;
  } | null>(null);

  // Handle image upload and base64 conversion
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert(language === 'bn' ? 'ছবির সাইজ ১০ মেগাবাইটের বেশি হওয়া যাবে না।' : 'Image size must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
      setDiagnosisResult(null);
      setAnalysisError(null);
    };
    reader.readAsDataURL(file);
  };

  // Perform AI photo diagnosis
  const handleAnalyzePhoto = async () => {
    if (!imageBase64 || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          plantName: plantHint,
          symptomsNotes: symptomsInput,
          language,
        }),
      });

      const data = await response.json();

      if (data.diagnosis) {
        setDiagnosisResult(data.diagnosis);
        setIsDemoDiagnosis(Boolean(data.isDemo));
      } else if (data.fallbackDiagnosis) {
        setDiagnosisResult(data.fallbackDiagnosis);
        setIsDemoDiagnosis(true);
      } else {
        throw new Error(data.error || 'Failed to diagnose');
      }
    } catch (err: any) {
      console.error('Plant doctor error:', err);
      setAnalysisError(
        language === 'bn'
          ? 'ছবি বিশ্লেষণে ত্রুটি হয়েছে। আপনি বিকল্প লক্ষণ প্রশ্নমালা ব্যবহার করতে পারেন।'
          : 'Could not complete image analysis. You can use the manual questionnaire tab instead.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate manual diagnostic assessment
  const handleManualAssessment = () => {
    const isBn = language === 'bn';

    let cause = '';
    let explanation = '';
    let remedySteps: string[] = [];
    let prevention = '';

    if (manualSymptom === 'yellow_leaves') {
      if (manualMoisture === 'soggy') {
        cause = isBn ? 'অতিরিক্ত পানি ও শিকড় পচন (Overwatering & Root Rot)' : 'Overwatering & Root Hypoxia';
        explanation = isBn 
          ? 'টবের গোড়ায় অতিরিক্ত আর্দ্রতা ও পানি নিষ্কাশন না থাকায় শিকড় পর্যাপ্ত অক্সিজেন পাচ্ছে না, ফলে নিচের পুরোনো পাতা হলুদ হয়ে ঝরে পড়ছে।'
          : 'Saturated potting mix starves roots of oxygen, preventing nutrient absorption and causing chlorosis in lower foliage.';
        remedySteps = isBn
          ? [
              'অবিলম্বে পানি দেওয়া বন্ধ করুন এবং মাটির উপরের ২ ইঞ্চি না শুকানো পর্যন্ত অপেক্ষা করুন।',
              'টবের নিচের ড্রেনেজ ছিদ্র বন্ধ থাকলে কাঠি দিয়ে পরিষ্কার করুন।',
              'টবের গোড়ার মাটি হালকা নিড়ানি দিয়ে ওলটপালট করে বাতাস প্রবেশের সুযোগ দিন।',
              'পচা বা সম্পূর্ণ হলুদ হয়ে যাওয়া পাতাগুলো ছেঁটে ফেলুন।',
            ]
          : [
              'Stop watering immediately and let the top 2 inches of soil dry completely.',
              'Inspect and clear blocked drainage holes at the base of the container.',
              'Gently aerate topsoil using a hand fork to facilitate air exchange.',
              'Prune dying, mushy leaves to redirect energy to healthy tissue.',
            ];
        prevention = isBn ? 'ক্যালেন্ডার দেখে নয়, বরং মাটি হাত দিয়ে শুষ্ক অনুভব করলেই পানি দিন।' : 'Always perform the finger test before adding water.';
      } else if (manualMoisture === 'bone_dry') {
        cause = isBn ? 'তীব্র পানির ঘাটতি ও পানিশূন্যতা (Underwatering)' : 'Severe Dehydration';
        explanation = isBn
          ? 'মাটি অতিরিক্ত শুকিয়ে যাওয়ার কারণে গাছ পর্যাপ্ত পানি ও খাদ্য সংবহন করতে পারছে না।'
          : 'Bone dry soil has pulled away from pot walls, leaving root balls parched.';
        remedySteps = isBn
          ? [
              'গাছের গোড়ায় ধীরে ধীরে পরিমিত পানি দিন যাতে মাটি আস্তে আস্তে ভিজে।',
              'গাছকে কিছুক্ষণের জন্য অতিরিক্ত কড়া রোদ থেকে সরিয়ে আধা-ছায়ায় রাখুন।',
            ]
          : [
              'Deeply bottom-water or soak the container gradually until moisture distributes.',
              'Move to moderate filtered light until foliage recovers turgidity.',
            ];
        prevention = isBn ? 'গ্রীষ্মে নিয়মিত সেচ নিশ্চিত করুন এবং সকালে পানি দিন।' : 'Maintain a consistent watering cadence in peak heat.';
      } else {
        cause = isBn ? 'নাইট্রোজেন বা আয়রনের পুষ্টি ঘাটতি (Nutrient Deficiency)' : 'Nitrogen / Iron Chlorosis';
        explanation = isBn
          ? 'গাছ দীর্ঘদিন একই মাটিতে থাকলে প্রয়োজনীয় ম্যাক্রো ও মাইক্রো নিউট্রিয়েন্টের অভাব ঘটে।'
          : 'Depleted nutrients in potting mix inhibit chlorophyll synthesis.';
        remedySteps = isBn
          ? [
              'একমুঠো ভার্মিকম্পোস্ট বা পচা গোবর সার টবের চারধারে মিশিয়ে দিন।',
              '১ লিটার পানিতে আধা চামচ ইপসম সল্ট গুলে পাতায় হালকা স্প্রে করতে পারেন।',
            ]
          : [
              'Top-dress with organic vermicompost or composted cow manure.',
              'Foliar spray mild Epsom salt solution (1/2 tsp per liter) for magnesium replenishment.',
            ];
        prevention = isBn ? 'প্রতি মাসে একবার জৈব সার উপরিপ্রয়োগ করুন।' : 'Feed with organic compost once every month during growth periods.';
      }
    } else if (manualSymptom === 'curling_leaves') {
      cause = isBn ? 'থ্রিপস, জাবপোকা বা মাকড়ের আক্রমণ (Insect Pests / Leaf Curl)' : 'Sap-sucking Pests (Thrips, Mites, Aphids)';
      explanation = isBn
        ? 'ক্ষুদ্র পোকার দল কচি পাতার রস চুষে খাওয়ার কারণে পাতা উল্টে যায় বা কোঁকড়ায়।'
        : 'Insects feed on new shoot juices, causing cellular distortion and curling.';
      remedySteps = isBn
        ? [
              '৫ মিলি কোল্ড-প্রেসড নিম তেল ও ২ ফোঁটা তরল সাবান ১ লিটার পানিতে মিশিয়ে ভালো করে ঝাঁকিয়ে নিন।',
              'বিকালে বা সন্ধ্যায় পাতার উল্টো পিঠে স্প্রে করুন।',
              'আক্রান্ত ডগা বেশি কুঁকড়ে গেলে হালকা ছাঁটাই করে দিন।',
            ]
        : [
              'Emulsify 5ml cold-pressed neem oil with 2 drops mild dish soap in 1L water.',
              'Spray thoroughly on the undersides of foliage in late afternoon.',
              'Pinch heavily distorted apical shoots to prevent pest spreading.',
            ];
      prevention = isBn ? 'বারান্দায় বাতাস চলাচল নিশ্চিত করুন এবং অতিরিক্ত ইউরিয়া সার দেবেন না।' : 'Avoid excess synthetic nitrogen which attracts soft-bodied sap feeders.';
    } else if (manualSymptom === 'spots') {
      cause = isBn ? 'ছত্রাকজনিত পাতার দাগ রোগ (Fungal Leaf Spot / Blight)' : 'Fungal Leaf Spot Disease';
      explanation = isBn
        ? 'পাতায় পানি ছিটানো বা স্যাঁতসেঁতে ভেজা আবহাওয়ায় ছত্রাকের স্পোর ছড়িয়ে পড়ে।'
        : 'Water splashing onto foliage combined with humid air encourages fungal spore germination.';
      remedySteps = isBn
        ? [
              'আক্রান্ত দাগযুক্ত পাতাগুলো ছিঁড়ে মাটিতে পুঁতে ফেলুন।',
              'গাছের গোড়ায় পানি দিন, পাতায় পানি ছিটাবেন না।',
              'কাঠের ছাই বা ট্রাইকোডার্মা জৈব ছত্রাকনাশক স্প্রে করুন।',
            ]
        : [
              'Sanitize shears and remove heavily spotted leaves immediately.',
              'Water at the base of the soil only; keep leaf blades completely dry.',
              'Apply bio-fungicide like Trichoderma harzianum or copper soap.',
            ];
      prevention = isBn ? 'গাছগুলোর মধ্যে ফাঁকা জায়গা রাখুন যাতে রোদ ও বাতাস চলাচল করে।' : 'Ensure ample plant spacing for good ventilation.';
    } else {
      cause = isBn ? 'পরিবেশগত চাপ ও আলোর তারতম্য (Environmental Light Stress)' : 'Environmental Acclimation Stress';
      explanation = isBn
        ? 'হঠাৎ করে স্থান পরিবর্তন বা অপর্যাপ্ত সূর্যালোকের কারণে গাছের স্বাভাবিক বৃদ্ধি বাধাগ্রস্ত হচ্ছে।'
        : 'Sudden relocation, temperature shocks, or sub-optimal photosynthetically active radiation (PAR).';
      remedySteps = isBn
        ? [
              'গাছকে উজ্জ্বল পরোক্ষ আলোর স্থানে স্থানান্তর করুন।',
              'টবটি নিয়মিত ঘুরিয়ে দিন যাতে সব পাতার দিকে সমান আলো পড়ে।',
            ]
        : [
              'Relocate to bright, filtered natural light.',
              'Rotate pot a quarter turn weekly for symmetrical development.',
            ];
      prevention = isBn ? 'গাছের স্থান ঘন ঘন পরিবর্তন করবেন না।' : 'Avoid frequent drastic location changes.';
    }

    setManualResult({
      probableCause: cause,
      explanation,
      remedySteps,
      prevention,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-700 text-white flex items-center justify-center shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.plantDoctor.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            {t.plantDoctor.subtitle}
          </p>
        </div>

        {/* Tab Toggle Switch */}
        <div className="bg-stone-100 p-1 rounded-2xl border border-stone-200 flex items-center self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.plantDoctor.tabUpload}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'manual'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.plantDoctor.tabManual}</span>
          </button>
        </div>
      </div>

      {/* Preselected Plant Banner if redirected from MyGarden */}
      {preselectedPlant && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'bn' ? 'বাগান থেকে নির্বাচিত গাছ:' : 'Diagnosing plant from garden:'} <strong>{preselectedPlant.name}</strong>
            </span>
          </div>
          {onClearPreselectedPlant && (
            <button
              onClick={onClearPreselectedPlant}
              className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 underline"
            >
              {language === 'bn' ? 'মুছে ফেলুন' : 'Clear'}
            </button>
          )}
        </div>
      )}

      {/* TAB 1: AI PHOTO DIAGNOSIS */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            
            {/* Notice about AI Vision status */}
            {!hasAiApiKey && (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{t.app.demoModeActive}</p>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    {language === 'bn' 
                      ? 'কোনো জেমিনি এআই কি সংযুক্ত নেই। আপনি ছবি আপলোড করলে শিক্ষামূলক ডেমো ডায়াগনোসিস দেখতে পারবেন, অথবা সরাসরি "লক্ষণভিত্তিক প্রশ্নমালা" ট্যাব ব্যবহার করতে পারেন।' 
                      : 'No Gemini API key is currently detected. An educational demo diagnosis template will be shown upon photo upload, or you can switch to the Manual Symptom Questionnaire tab.'}
                  </p>
                </div>
              </div>
            )}

            {/* Photo Upload Zone */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {t.plantDoctor.uploadPrompt}
              </label>
              
              {!imagePreview ? (
                <label className="border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-stone-50/60 hover:bg-emerald-50/30 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-white text-emerald-600 shadow-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-stone-800 text-center">
                    {t.plantDoctor.uploadPrompt}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 text-center">
                    {t.plantDoctor.uploadHint}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-stone-100 max-h-80 flex items-center justify-center group">
                  <img
                    src={imagePreview}
                    alt="Uploaded leaf"
                    className="w-full h-full object-contain max-h-80"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-4 py-2 bg-white text-stone-800 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-stone-100 transition-all flex items-center space-x-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{t.plantDoctor.changePhoto}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Context Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.plantDoctor.plantNameHint}
                </label>
                <input
                  type="text"
                  value={plantHint}
                  onChange={(e) => setPlantHint(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: টমেটো, মরিচ বা মানি প্ল্যান্ট' : 'e.g. Tomato, Green Chili, Peace Lily'}
                  className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'bn' ? 'লক্ষণ বা নোট (ঐচ্ছিক)' : 'Symptoms or Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder={t.plantDoctor.symptomsHint}
                  className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
                />
              </div>
            </div>

            {analysisError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyzePhoto}
              disabled={!imageBase64 || isAnalyzing}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.plantDoctor.analyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.plantDoctor.analyzeBtn}</span>
                </>
              )}
            </button>

          </div>

          {/* Diagnosis Result Report Card */}
          {diagnosisResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-md space-y-6 animate-fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                      {t.plantDoctor.diagnosisTitle}
                    </span>
                    <h2 className="text-xl font-black text-stone-900">
                      {diagnosisResult.plantIdentification}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center">
                  {isDemoDiagnosis && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {language === 'bn' ? 'ডেমো পর্যবেক্ষণ' : 'Demo Observation'}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    diagnosisResult.healthyConfidence === 'Healthy'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {diagnosisResult.healthyConfidence}
                  </span>
                </div>
              </div>

              {/* Observed Symptoms */}
              <div>
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                  🔍 {t.plantDoctor.symptomsObserved}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {diagnosisResult.symptomsObserved.map((sym, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold"
                    >
                      • {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Possible Causes Grid */}
              <div>
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                  🩺 {t.plantDoctor.possibleCauses}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {diagnosisResult.possibleCauses.map((cause, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{cause.cause}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cause.probability === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : cause.probability === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}>
                          {cause.probability}
                        </span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">{cause.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safe Care Actions */}
              <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200">
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>{t.plantDoctor.safeCareActions}</span>
                </h3>
                <ul className="space-y-2 text-xs text-emerald-900">
                  {diagnosisResult.safeCareActions.map((action, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up Questions */}
              {diagnosisResult.followUpQuestions && diagnosisResult.followUpQuestions.length > 0 && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                  <h4 className="font-bold text-stone-800 mb-2 flex items-center space-x-1.5">
                    <HelpCircle className="w-4 h-4 text-stone-500" />
                    <span>{t.plantDoctor.followUpQuestions}:</span>
                  </h4>
                  <ul className="space-y-1 text-stone-600">
                    {diagnosisResult.followUpQuestions.map((q, idx) => (
                      <li key={idx}>❓ {q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Safety Agronomy Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{t.plantDoctor.disclaimer}:</span>{' '}
                  <span>{diagnosisResult.safetyDisclaimer || t.plantDoctor.disclaimerText}</span>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: MANUAL SYMPTOM QUESTIONNAIRE */}
      {activeTab === 'manual' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              {t.plantDoctor.manualTitle}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {t.plantDoctor.manualDesc}
            </p>
          </div>

          <div className="space-y-5">
            {/* Step 1: Plant Type */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2">
                {t.plantDoctor.step1}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'houseplant', label: language === 'bn' ? 'ইনডোর পাতা বাহারি' : 'Foliage Houseplant' },
                  { id: 'vegetable', label: language === 'bn' ? 'সবজি (টমেটো/মরিচ)' : 'Vegetable (Tomato/Chili)' },
                  { id: 'flower', label: language === 'bn' ? 'ফুল গাছ (গোলাপ)' : 'Flowering (Rose/Lily)' },
                  { id: 'succulent', label: language === 'bn' ? 'সাকুলেন্ট / অ্যালোভেরা' : 'Succulent / Aloe' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setManualPlantType(opt.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                      manualPlantType === opt.id
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Primary Symptom */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2">
                {t.plantDoctor.step2}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'yellow_leaves', label: language === 'bn' ? 'পাতা হলুদ হয়ে যাওয়া' : 'Yellowing Leaves' },
                  { id: 'curling_leaves', label: language === 'bn' ? 'পাতা ওপরের দিকে কোঁকড়ানো' : 'Curling / Deformed Leaves' },
                  { id: 'spots', label: language === 'bn' ? 'পাতায় কালো বা বাদামী ছোপ দাগ' : 'Dark Spots or Powdery Film' },
                  { id: 'slow_growth', label: language === 'bn' ? 'গাছের বৃদ্ধি থেমে যাওয়া ও ঢলে পড়া' : 'Stunted Growth & Drooping' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setManualSymptom(opt.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                      manualSymptom === opt.id
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Soil Moisture */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2">
                {t.plantDoctor.step3}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'soggy', label: language === 'bn' ? 'কাদাময় ও ভেজা' : 'Soggy & Wet' },
                  { id: 'normal', label: language === 'bn' ? 'স্বাভাবিক আর্দ্র' : 'Mildly Moist' },
                  { id: 'bone_dry', label: language === 'bn' ? 'শুকনো ও ফেটে যাওয়া' : 'Bone Dry' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setManualMoisture(opt.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                      manualMoisture === opt.id
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4 & 5 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  {t.plantDoctor.step4}
                </label>
                <select
                  value={manualLight}
                  onChange={(e) => setManualLight(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-stone-800 outline-none"
                >
                  <option value="direct_sun">{language === 'bn' ? 'সরাসরি কড়া রোদ (৫+ ঘণ্টা)' : 'Full Direct Midday Sun'}</option>
                  <option value="moderate">{language === 'bn' ? 'উজ্জ্বল পরোক্ষ আলো' : 'Bright Indirect Light'}</option>
                  <option value="low_shade">{language === 'bn' ? 'ছায়া বা ঘরের কম আলো' : 'Low Shade / Indoor Dark'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  {t.plantDoctor.step5}
                </label>
                <select
                  value={manualRegion}
                  onChange={(e) => setManualRegion(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-stone-800 outline-none"
                >
                  <option value="lower_leaves">{language === 'bn' ? 'নিচের পুরোনো পাতাগুলো' : 'Lower Mature Leaves'}</option>
                  <option value="new_shoots">{language === 'bn' ? 'ডগার নতুন কচি পাতা ও কুঁড়ি' : 'Fresh Top Shoots & Buds'}</option>
                  <option value="whole_plant">{language === 'bn' ? 'পুরো গাছ সমানভাবে আক্রান্ত' : 'Entire Plant Uniformly'}</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleManualAssessment}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{t.plantDoctor.viewManualRemedy}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Manual Result Card */}
          {manualResult && (
            <div className="mt-6 p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-4 animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    {language === 'bn' ? 'নির্ণীত সম্ভাব্য কারণ' : 'Probable Diagnosis'}
                  </span>
                  <h3 className="font-extrabold text-base text-stone-900">
                    {manualResult.probableCause}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {manualResult.explanation}
              </p>

              <div className="bg-white p-4 rounded-2xl border border-stone-200">
                <h4 className="text-xs font-bold text-emerald-900 mb-2">
                  ✅ {language === 'bn' ? 'করণীয় তাৎক্ষণিক পদক্ষেপ:' : 'Immediate Remedial Actions:'}
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {manualResult.remedySteps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-stone-500 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <strong>{language === 'bn' ? 'ভবিষ্যত সতর্কতা:' : 'Prevention Tip:'}</strong> {manualResult.prevention}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
