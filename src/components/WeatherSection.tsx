import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Droplet, 
  Wind, 
  Thermometer, 
  Sun, 
  CloudRain, 
  AlertTriangle, 
  MapPin, 
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { Language, WeatherData } from '../types';
import { translations } from '../translations';

interface WeatherSectionProps {
  language: Language;
}

const DISTRICT_COORDINATES: Array<{
  nameEn: string;
  nameBn: string;
  lat: number;
  lon: number;
}> = [
  { nameEn: 'Dhaka', nameBn: 'ঢাকা', lat: 23.8103, lon: 90.4125 },
  { nameEn: 'Bogura', nameBn: 'বগুড়া', lat: 24.8465, lon: 89.3778 },
  { nameEn: 'Rajshahi', nameBn: 'রাজশাহী', lat: 24.3745, lon: 88.6042 },
  { nameEn: 'Rangpur', nameBn: 'রংপুর', lat: 25.7439, lon: 89.2752 },
  { nameEn: 'Jessore', nameBn: 'যশোর', lat: 23.1664, lon: 89.2081 },
  { nameEn: 'Khulna', nameBn: 'খুলনা', lat: 22.8456, lon: 89.5403 },
  { nameEn: 'Chittagong', nameBn: 'চট্টগ্রাম', lat: 22.3569, lon: 91.7832 },
  { nameEn: 'Sylhet', nameBn: 'সিলেট', lat: 24.8949, lon: 91.8687 },
  { nameEn: 'Barisal', nameBn: 'বরিশাল', lat: 22.7010, lon: 90.3535 },
  { nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ', lat: 24.7471, lon: 90.4203 },
];

export const WeatherSection: React.FC<WeatherSectionProps> = ({ language }) => {
  const t = translations[language];

  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICT_COORDINATES[1]); // Default Bogura
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  const fetchWeather = async (district = selectedDistrict) => {
    setIsLoading(true);

    try {
      // Connect to Open-Meteo public weather API
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${district.lat}&longitude=${district.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=precipitation_probability_max&timezone=auto`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API response was not OK');

      const data = await res.json();
      const current = data.current;
      const daily = data.daily;

      const rainChance = daily?.precipitation_probability_max?.[0] ?? (current.precipitation > 0 ? 80 : 15);
      const temp = Math.round(current.temperature_2m);
      const humidity = current.relative_humidity_2m;
      const wind = Math.round(current.wind_speed_10m);

      // Generate realistic agrometeorological advisory based on actual numbers
      let advisoryEn = '';
      let advisoryBn = '';

      if (rainChance > 50) {
        advisoryEn = 'High probability of rain. Postpone foliar pesticide sprays and topsoil urea applications. Ensure field drainage ditches are unblocked.';
        advisoryBn = 'বৃষ্টির উচ্চ সম্ভাবনা রয়েছে। পাতায় তরল সার ও কীটনাশক স্প্রে করা স্থগিত রাখুন। জমিতে পানি নিষ্কাশন নালা খোলা রাখুন।';
      } else if (temp > 33) {
        advisoryEn = 'High heat wave conditions. Provide early morning irrigation to balcony pots and container plants to prevent wilting. Avoid midday fertilizer application.';
        advisoryBn = 'প্রচণ্ড তাপদাহ চলছে। টবের গাছ ও ফসলের গোড়ায় সকালে পর্যাপ্ত সেচ দিন। দুপুরের রোদে কোনো ধরনের সার প্রয়োগ করবেন না।';
      } else if (humidity > 80) {
        advisoryEn = 'High ambient humidity favors fungal spore development (leaf spot & powdery mildew). Avoid wetting leaves during watering; improve air spacing.';
        advisoryBn = 'বাতাসে অতিরিক্ত আর্দ্রতার কারণে ছত্রাকজনিত পাতার দাগ রোগের ঝুঁকি রয়েছে। গাছে পানি ছিটানো বন্ধ রাখুন এবং গোড়ায় পানি দিন।';
      } else {
        advisoryEn = 'Favorable weather conditions for field cultivation, weeding, pruning, and organic compost application.';
        advisoryBn = 'চাষাবাদ, নিড়ানি, আগাছা দমন ও জৈব সার প্রয়োগের জন্য অনুকূল আবহাওয়া।';
      }

      setWeatherData({
        city: district.nameEn,
        districtBn: district.nameBn,
        temperature: temp,
        feelsLike: Math.round(current.apparent_temperature),
        humidity,
        precipitationProb: rainChance,
        windSpeed: wind,
        weatherCode: current.weather_code,
        descriptionEn: getWeatherDescription(current.weather_code, 'en'),
        descriptionBn: getWeatherDescription(current.weather_code, 'bn'),
        isDemo: false,
        advisoryEn,
        advisoryBn,
      });

      setIsLiveApi(true);
    } catch (err) {
      console.warn('Could not fetch live weather from Open-Meteo, using verified sample demo data:', err);
      // Fallback to sample demo data
      setWeatherData({
        city: district.nameEn,
        districtBn: district.nameBn,
        temperature: 28,
        feelsLike: 30,
        humidity: 65,
        precipitationProb: 20,
        windSpeed: 12,
        weatherCode: 1,
        descriptionEn: 'Partly Sunny & Mild Breeze (Sample)',
        descriptionBn: 'আংশিক রৌদ্রোজ্জ্বল ও মিষ্টি হাওয়া (নমুনা)',
        isDemo: true,
        advisoryEn: 'Sample Demo Advisory: Ensure proper soil aeration and regular morning watering.',
        advisoryBn: 'নমুনা পরামর্শ: মাটির আর্দ্রতা পরীক্ষা করে নিয়মিত সকালের দিকে পানি দিন।',
      });
      setIsLiveApi(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedDistrict);
  }, [selectedDistrict]);

  const getWeatherDescription = (code: number, lang: 'en' | 'bn') => {
    if (code === 0) return lang === 'bn' ? 'পরিষ্কার আকাশ' : 'Clear Sky';
    if (code <= 3) return lang === 'bn' ? 'আংশিক মেঘলা' : 'Partly Cloudy';
    if (code <= 48) return lang === 'bn' ? 'কুয়াশাচ্ছন্ন' : 'Foggy / Hazy';
    if (code <= 65) return lang === 'bn' ? 'হালকা থেকে মাঝারি বৃষ্টি' : 'Light to Moderate Rain';
    if (code <= 82) return lang === 'bn' ? 'ভারী বৃষ্টিপাত' : 'Heavy Rain Showers';
    return lang === 'bn' ? 'রৌদ্রোজ্জ্বল' : 'Sunny';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <CloudSun className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.weather.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            {t.weather.subtitle}
          </p>
        </div>

        {/* Live vs Demo Status Badge */}
        <div className="self-start md:self-center">
          {isLiveApi ? (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.weather.dataSourceLive}</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.weather.dataSourceDemo}</span>
            </span>
          )}
        </div>
      </div>

      {/* District Selector Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
          📍 {t.weather.selectDistrict}
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {DISTRICT_COORDINATES.map((district) => (
            <button
              key={district.nameEn}
              onClick={() => setSelectedDistrict(district)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedDistrict.nameEn === district.nameEn
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {language === 'bn' ? district.nameBn : district.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Weather Card */}
      {weatherData && (
        <div className="bg-gradient-to-br from-blue-700 via-sky-800 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
                <MapPin className="w-4 h-4" />
                <span>{language === 'bn' ? weatherData.districtBn : weatherData.city}, Bangladesh</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                {weatherData.temperature}°C
              </h2>
              <p className="text-sm font-semibold text-sky-100 mt-1">
                {language === 'bn' ? weatherData.descriptionBn : weatherData.descriptionEn} • {t.weather.feelsLike} {weatherData.feelsLike}°C
              </p>
            </div>

            <button
              onClick={() => fetchWeather(selectedDistrict)}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center space-x-1.5 self-start md:self-center cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{language === 'bn' ? 'হালনাগাদ করুন' : 'Refresh Data'}</span>
            </button>
          </div>

          {/* Weather Metrics Grid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
              <div className="flex items-center space-x-1.5 text-sky-200 text-[11px] mb-1">
                <Thermometer className="w-4 h-4 text-amber-300" />
                <span>{t.weather.temperature}</span>
              </div>
              <p className="font-extrabold text-white text-base">{weatherData.temperature}°C</p>
            </div>

            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
              <div className="flex items-center space-x-1.5 text-sky-200 text-[11px] mb-1">
                <Droplet className="w-4 h-4 text-blue-300" />
                <span>{t.weather.humidity}</span>
              </div>
              <p className="font-extrabold text-white text-base">{weatherData.humidity}%</p>
            </div>

            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
              <div className="flex items-center space-x-1.5 text-sky-200 text-[11px] mb-1">
                <CloudRain className="w-4 h-4 text-indigo-300" />
                <span>{t.weather.rainChance}</span>
              </div>
              <p className="font-extrabold text-white text-base">{weatherData.precipitationProb}%</p>
            </div>

            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
              <div className="flex items-center space-x-1.5 text-sky-200 text-[11px] mb-1">
                <Wind className="w-4 h-4 text-teal-300" />
                <span>{t.weather.wind}</span>
              </div>
              <p className="font-extrabold text-white text-base">{weatherData.windSpeed} km/h</p>
            </div>
          </div>

          {/* Agrometeorological Advisory Box */}
          <div className="relative z-10 mt-6 p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs">
            <h4 className="font-extrabold text-amber-300 mb-1 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.weather.agAdvisory}</span>
            </h4>
            <p className="leading-relaxed text-white/95 font-medium">
              {language === 'bn' ? weatherData.advisoryBn : weatherData.advisoryEn}
            </p>
          </div>

        </div>
      )}

      {/* Agricultural Weather Notice */}
      <div className="p-4 rounded-2xl bg-stone-100 text-stone-600 text-xs flex items-center space-x-2">
        <HelpCircle className="w-4 h-4 text-stone-400 shrink-0" />
        <span>
          {language === 'bn' 
            ? 'লাইভ আবহাওয়া তথ্য ওপেন-মেটিও (Open-Meteo) মেটিওরোলোজিক্যাল এপিআই থেকে সরাসরি গৃহীত হচ্ছে। এটি রিয়েল-টাইম কৃষিকাজে সিদ্ধান্ত নিতে সহায়ক।' 
            : 'Meteorological telemetry is pulled live from the Open-Meteo API. Never invent or rely on unverified weather reports.'}
        </span>
      </div>

    </div>
  );
};
