import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  ArrowLeft, 
  Printer, 
  Share2, 
  Tag, 
  BookOpen,
  Check
} from 'lucide-react';
import { KnowledgeArticle, Language } from '../types';
import { translations } from '../translations';
import { knowledgeArticles } from '../data/knowledgeArticles';

interface KnowledgeHubProps {
  language: Language;
}

export const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ language }) => {
  const t = translations[language];

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('krishi_bookmarked_articles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
      }
    }
    return ['vermicompost-organic-fertilizer', 'neem-oil-pest-management'];
  });
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    localStorage.setItem('krishi_bookmarked_articles', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredArticles = knowledgeArticles.filter((article) => {
    const matchesSearch =
      article.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      article.titleBn.toLowerCase().includes(search.toLowerCase()) ||
      article.summaryEn.toLowerCase().includes(search.toLowerCase()) ||
      article.summaryBn.toLowerCase().includes(search.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      article.categoryEn === selectedCategory ||
      article.categoryBn === selectedCategory;

    const matchesBookmark = !showBookmarksOnly || bookmarkedIds.includes(article.id);

    return matchesSearch && matchesCategory && matchesBookmark;
  });

  const categories = [
    { id: 'all', label: t.knowledge.allCategories },
    { id: 'Soil & Organic Compost', label: language === 'bn' ? 'মাটি ও জৈব সার' : 'Soil & Organic Compost' },
    { id: 'Pest & Health', label: language === 'bn' ? 'রোগ ও বালাই দমন' : 'Pest & Health' },
    { id: 'Balcony & Rooftop', label: language === 'bn' ? 'বারান্দা ও ছাদবাগান' : 'Balcony & Rooftop' },
    { id: 'Water & Irrigation', label: language === 'bn' ? 'সেচ ও পানি ব্যবস্থাপনা' : 'Water & Irrigation' },
    { id: 'Sustainable Farming', label: language === 'bn' ? 'টেকসই চাষাবাদ' : 'Sustainable Farming' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* If article reading view is open */}
      {selectedArticle ? (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          
          {/* Top navigation row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center space-x-2 text-xs font-bold text-stone-600 hover:text-emerald-700 bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-2xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.knowledge.backToList}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleBookmark(selectedArticle.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  bookmarkedIds.includes(selectedArticle.id)
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {bookmarkedIds.includes(selectedArticle.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-amber-600" />
                    <span>{t.knowledge.bookmarked}</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-stone-400" />
                    <span>{t.knowledge.bookmark}</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-2xs transition-all"
                title={t.knowledge.printArticle}
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-2xs transition-all"
                title="Share link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Article Full Body */}
          <article className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm p-6 sm:p-10 space-y-6">
            
            {/* Cover image */}
            <div className="rounded-2xl overflow-hidden h-64 sm:h-80 w-full bg-stone-100">
              <img
                src={selectedArticle.coverImage}
                alt={selectedArticle.titleEn}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Meta */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase tracking-wider">
                  {language === 'bn' ? selectedArticle.categoryBn : selectedArticle.categoryEn}
                </span>
                <span className="flex items-center space-x-1 text-xs text-stone-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{selectedArticle.readTime} {t.knowledge.readTime}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                {language === 'bn' ? selectedArticle.titleBn : selectedArticle.titleEn}
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                {t.knowledge.publishedOn}
              </p>
            </div>

            {/* Content formatted */}
            <div className="prose prose-stone max-w-none text-stone-800 text-sm leading-relaxed whitespace-pre-line border-t border-stone-100 pt-6">
              {language === 'bn' ? selectedArticle.contentBn : selectedArticle.contentEn}
            </div>

            {/* Tags */}
            <div className="pt-6 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-stone-400" />
              {selectedArticle.tags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs font-semibold">
                  #{tag}
                </span>
              ))}
            </div>

          </article>

        </div>
      ) : (
        /* Articles List View */
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                  {t.knowledge.title}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
                {t.knowledge.subtitle}
              </p>
            </div>

            {/* Bookmarks Toggle button */}
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border self-start md:self-center cursor-pointer ${
                showBookmarksOnly
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{t.knowledge.savedFavorites} ({bookmarkedIds.length})</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.knowledge.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs text-stone-800 outline-none transition-all"
              />
            </div>

            {/* Category horizontal scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
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

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => {
                const isBookmarked = bookmarkedIds.includes(article.id);
                return (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="group bg-white rounded-3xl border border-stone-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                        <img
                          src={article.coverImage}
                          alt={article.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        
                        {/* Category tag */}
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-stone-800 shadow-xs">
                          {language === 'bn' ? article.categoryBn : article.categoryEn}
                        </span>

                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => toggleBookmark(article.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-amber-600 flex items-center justify-center transition-all shadow-xs"
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark for offline'}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center space-x-1 text-[11px] text-stone-400 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime}</span>
                        </div>

                        <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug mb-2">
                          {language === 'bn' ? article.titleBn : article.titleEn}
                        </h3>

                        <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                          {language === 'bn' ? article.summaryBn : article.summaryEn}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 pb-5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
                      <span>{t.knowledge.readArticle}</span>
                      <span>→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200">
              <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700">
                {language === 'bn' ? 'কোনো আর্টিকেল পাওয়া যায়নি।' : 'No articles match your search or filter.'}
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
