import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  Circle, 
  Trash2, 
  Clock, 
  Bell, 
  BellRing, 
  BellOff, 
  Droplet, 
  Sparkles, 
  Scissors, 
  Layers, 
  Bug, 
  Package, 
  AlertCircle,
  X
} from 'lucide-react';
import { Reminder, Language, Plant, ReminderType } from '../types';
import { translations } from '../translations';

interface SmartRemindersProps {
  reminders: Reminder[];
  plants: Plant[];
  onAddReminder: (reminder: Partial<Reminder>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  language: Language;
}

export const SmartReminders: React.FC<SmartRemindersProps> = ({
  reminders,
  plants,
  onAddReminder,
  onToggleComplete,
  onDeleteReminder,
  language,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // New Reminder form state
  const [title, setTitle] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [customPlantName, setCustomPlantName] = useState('');
  const [type, setType] = useState<ReminderType>('water');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState<string>('09:00');
  const [repeat, setRepeat] = useState<any>('weekly');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Check browser Notification support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }
  }, []);

  const requestNotificationAccess = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert(t.reminders.notificationsUnsupported);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification(t.app.name, {
          body: language === 'bn' 
            ? 'স্মার্ট রিমাইন্ডার সফলভাবে চালু হয়েছে! গাছের যত্ন নেওয়ার সময় হলে বার্তা পাবেন।' 
            : 'Smart plant care notifications are now active! You will be reminded when care tasks are due.',
          icon: '/favicon.ico',
        });
      }
    } catch (e) {
      console.error('Notification permission error:', e);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const todayReminders = reminders.filter(
    (r) => !r.completed && r.dueDate <= todayStr
  );

  const upcomingReminders = reminders.filter(
    (r) => !r.completed && r.dueDate > todayStr
  );

  const completedReminders = reminders.filter((r) => r.completed);

  const getFilteredReminders = () => {
    if (activeTab === 'today') return todayReminders;
    if (activeTab === 'upcoming') return upcomingReminders;
    return completedReminders;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে কাজের নাম লিখুন।' : 'Please provide a task name.');
      return;
    }

    const linkedPlant = plants.find((p) => p.id === selectedPlantId);
    const plantDisplayName = linkedPlant ? linkedPlant.name : customPlantName.trim() || 'General Garden';

    onAddReminder({
      plantId: selectedPlantId || undefined,
      plantName: plantDisplayName,
      title: title.trim(),
      type,
      dueDate,
      dueTime,
      repeat,
      completed: false,
      notes: notes.trim() || undefined,
    });

    // Reset & close
    setTitle('');
    setSelectedPlantId('');
    setCustomPlantName('');
    setType('water');
    setNotes('');
    setFormError('');
    setIsAddModalOpen(false);
  };

  const getTypeIcon = (taskType: ReminderType) => {
    switch (taskType) {
      case 'water':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'fertilize':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'prune':
        return <Scissors className="w-4 h-4 text-emerald-600" />;
      case 'soil_work':
        return <Layers className="w-4 h-4 text-stone-600" />;
      case 'pest_check':
        return <Bug className="w-4 h-4 text-rose-500" />;
      default:
        return <Package className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Calendar className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {t.reminders.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            {t.reminders.subtitle}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.reminders.addNew}</span>
        </button>
      </div>

      {/* Browser Notification Status Bar */}
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          {notificationPermission === 'granted' ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-600 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
          )}
          <div>
            <span className="font-bold text-stone-800 block">
              {notificationPermission === 'granted'
                ? t.reminders.notificationsEnabled
                : language === 'bn' ? 'ব্রাউজার নোটিফিকেশন বন্ধ রয়েছে' : 'Browser notifications inactive'}
            </span>
            <span className="text-stone-500 text-[11px]">
              {notificationPermission === 'granted'
                ? (language === 'bn' ? 'কাজের সময় হলে ব্রাউজারে পপআপ নোটিফিকেশন দেখানো হবে।' : 'Push reminders will notify you when tasks are due.')
                : (language === 'bn' ? 'ব্রাউজার অনুমোদন দিলে স্বয়ংক্রিয় অ্যালার্ট পাবেন।' : 'Grant browser permission to receive push alerts.')}
            </span>
          </div>
        </div>

        {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
          <button
            onClick={requestNotificationAccess}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-emerald-800 border border-emerald-300 font-bold transition-all cursor-pointer self-start sm:self-center shrink-0"
          >
            {t.reminders.notificationsBtn}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
        {[
          { id: 'today', label: t.reminders.tabToday, count: todayReminders.length },
          { id: 'upcoming', label: t.reminders.tabUpcoming, count: upcomingReminders.length },
          { id: 'completed', label: t.reminders.tabCompleted, count: completedReminders.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-emerald-900 text-emerald-100' : 'bg-stone-200 text-stone-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Reminder Tasks List */}
      <div className="space-y-3">
        {getFilteredReminders().length > 0 ? (
          getFilteredReminders().map((reminder) => (
            <div
              key={reminder.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                reminder.completed
                  ? 'bg-stone-50/80 border-stone-200 opacity-70'
                  : reminder.dueDate < todayStr
                  ? 'bg-rose-50/60 border-rose-200'
                  : 'bg-white border-stone-200/90 shadow-2xs hover:border-emerald-400'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                {/* Complete checkbox button */}
                <button
                  onClick={() => onToggleComplete(reminder.id)}
                  className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                  title={reminder.completed ? t.reminders.markUndone : t.reminders.markDone}
                >
                  {reminder.completed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 hover:text-emerald-600" />
                  )}
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {getTypeIcon(reminder.type)}
                      <span className="capitalize">{t.reminders[`type${reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}` as keyof typeof t.reminders] || reminder.type}</span>
                    </span>

                    <span className="text-xs font-bold text-emerald-800">
                      🌿 {reminder.plantName}
                    </span>

                    {reminder.repeat !== 'none' && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🔁 {t.reminders[`repeat${reminder.repeat.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}` as keyof typeof t.reminders] || reminder.repeat}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm font-bold ${reminder.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                    {reminder.title}
                  </h3>

                  {reminder.notes && (
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {reminder.notes}
                    </p>
                  )}

                  <div className="mt-2 flex items-center space-x-3 text-[11px] text-stone-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{reminder.dueDate} {reminder.dueTime && `@ ${reminder.dueTime}`}</span>
                    </span>
                    {reminder.dueDate < todayStr && !reminder.completed && (
                      <span className="text-rose-600 font-bold">
                        ⚠️ {language === 'bn' ? 'বিলম্বিত' : 'Overdue'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => onDeleteReminder(reminder.id)}
                className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
                title="Delete Reminder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-stone-200">
            <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-700 mb-1">
              {t.reminders.noReminders}
            </p>
            <p className="text-xs text-stone-400">
              {t.reminders.allCaughtUp}
            </p>
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-lg font-bold text-stone-900">
                {t.reminders.addNew}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.reminders.taskTitle} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.reminders.taskTitlePlaceholder}
                  className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
                />
              </div>

              {/* Plant selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.reminders.selectPlant}
                </label>
                {plants.length > 0 ? (
                  <select
                    value={selectedPlantId}
                    onChange={(e) => setSelectedPlantId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none mb-2"
                  >
                    <option value="">{language === 'bn' ? '-- সাধারণ বাগান / কাস্টম গাছ --' : '-- General Garden / Custom Plant --'}</option>
                    {plants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.bengaliName ? `(${p.bengaliName})` : ''}
                      </option>
                    ))}
                  </select>
                ) : null}

                {!selectedPlantId && (
                  <input
                    type="text"
                    value={customPlantName}
                    onChange={(e) => setCustomPlantName(e.target.value)}
                    placeholder={language === 'bn' ? 'গাছের নাম (যেমন: পুদিনা পাতা, ছাদবাগান)' : 'Plant or Location Name (e.g. Balcony Herbs)'}
                    className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
                  />
                )}
              </div>

              {/* Task Type & Repeat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.reminders.taskType}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ReminderType)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
                  >
                    <option value="water">{t.reminders.typeWater}</option>
                    <option value="fertilize">{t.reminders.typeFertilize}</option>
                    <option value="prune">{t.reminders.typePrune}</option>
                    <option value="soil_work">{t.reminders.typeSoil}</option>
                    <option value="pest_check">{t.reminders.typePest}</option>
                    <option value="harvest">{t.reminders.typeHarvest}</option>
                    <option value="repot">{t.reminders.typeRepot}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.reminders.repeat}
                  </label>
                  <select
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
                  >
                    <option value="none">{t.reminders.repeatNone}</option>
                    <option value="daily">{t.reminders.repeatDaily}</option>
                    <option value="every_2_days">{t.reminders.repeat2Days}</option>
                    <option value="every_3_days">{t.reminders.repeat3Days}</option>
                    <option value="weekly">{t.reminders.repeatWeekly}</option>
                    <option value="biweekly">{t.reminders.repeatBiweekly}</option>
                    <option value="monthly">{t.reminders.repeatMonthly}</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.reminders.dueDate}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {language === 'bn' ? 'সময়' : 'Time'}
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.reminders.notes}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: শিকড়ে পানি দেবেন, পাতায় নয়।' : 'e.g. Water roots only; avoid leaves.'}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-800 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-all cursor-pointer"
                >
                  {t.plantForm.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  {t.reminders.saveReminder}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
