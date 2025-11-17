import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Menu, Search, X } from 'lucide-react';
import { MapEvents } from '@/components/map';
import EventList from '@/components/events/EventList';
import { useEvent } from '@/context/EventContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHeaderHeight } from '@/layout/Layout';

export default function PublicEvents() {
  const location = useLocation();
  const { events, loading } = useEvent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [priceSort, setPriceSort] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  const getCity = (address: string) => {
    if (!address) return '';
    const parts = address.split(',');
    return parts.length >= 2 ? parts[1].trim() : parts[0].trim();
  };
  const { headerHeight } = useHeaderHeight();
  const cities = useMemo(
    () => [...new Set(events.map(e => getCity(e.localisation?.address)).filter(Boolean))],
    [events]
  );

  const categories = useMemo(
    () => [...new Set(events.map(e => e.categorie?.name).filter(Boolean))],
    [events]
  );

  const filteredEvents = useMemo(() => {
    let list = events.filter((e) => {
      const matchesCategory = !selectedCategory || e.categorie?.name === selectedCategory;
      const matchesSearch =
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = !selectedCity || e.localisation?.address?.includes(selectedCity);
      const matchesPrice = (!minPrice || e.base_price >= minPrice) && (!maxPrice || e.base_price <= maxPrice);

      const eventDate = new Date(e.start_date);
      const now = new Date();

      const matchesDate = (() => {
        if (selectedDateFilter === 'today') return eventDate.toDateString() === now.toDateString();
        if (selectedDateFilter === 'week') {
          const diff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff < 7;
        }
        if (selectedDateFilter === 'month')
          return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
        return true;
      })();

      return matchesCategory && matchesSearch && matchesCity && matchesPrice && matchesDate;
    });

    if (priceSort === 'asc') list.sort((a, b) => a.base_price - b.base_price);
    if (priceSort === 'desc') list.sort((a, b) => b.base_price - a.base_price);

    return list;
  }, [events, selectedCategory, searchTerm, selectedCity, minPrice, maxPrice, selectedDateFilter, priceSort]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    const city = params.get('city') || '';
    setSearchTerm(search);
    setSelectedCity(city);
  }, [location.search]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 🔹 Map - Full Screen Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden">
        <MapEvents
          events={filteredEvents}
          selectedEventId={selectedEventId}
          onEventSelect={setSelectedEventId}
        />
      </div>

      {/* Overlay for mobile */}
      {showSidebar && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* 🔹 Sidebar */}
      <div
        className={`fixed  top-[${headerHeight}px] left-0 z-40 md:z-auto w-full md:w-1/2 lg:w-1/3 h-full md:h-[60vh]  flex flex-col bg-white/95 backdrop-blur-2xl border-r border-accent/30 shadow-lg rounded-none md:rounded-l-xl overflow-hidden transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full shadow-none'
        }`}
      >
        {/* Top Bar: Search + Filter + Close */}
        <div className="flex items-center justify-between gap-1.5 md:gap-2 p-2 md:p-4 border-b border-accent/40 bg-white/90 backdrop-blur-lg sticky top-0 z-10 flex-wrap">
          <div className="flex items-center gap-1.5 md:gap-2 flex-1 bg-gray-100 rounded-lg px-2 md:px-3 py-1.5 md:py-2 min-w-0 order-2 md:order-1">
            <Search className="text-gray-400 w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-xs md:text-sm bg-transparent focus:outline-none min-w-0"
            />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 order-1 md:order-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition flex-shrink-0 ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Filtres"
            >
              <Filter className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition flex-shrink-0"
              title="Fermer"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-b bg-gray-50/80 space-y-3 md:space-y-4 overflow-y-auto max-h-[40vh] p-3 md:p-4">
            {/* Category */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-700">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 px-2 md:px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-700">Ville</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full border border-gray-300 px-2 md:px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="">Toutes les villes</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-700">Date</label>
              <div className="flex flex-wrap gap-2 text-xs md:text-sm text-gray-700">
                {['all', 'today', 'week', 'month'].map((date) => (
                  <label key={date} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="date"
                      value={date}
                      checked={selectedDateFilter === date}
                      onChange={(e) => setSelectedDateFilter(e.target.value)}
                      className="cursor-pointer"
                    />
                    <span className="text-xs md:text-sm">
                      {date === 'all' ? 'Tous' : date === 'today' ? 'Aujourd\'hui' : date === 'week' ? 'Cette semaine' : 'Ce mois'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Sort */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-700">Tri par prix</label>
              <div className="flex gap-3 text-xs md:text-sm text-gray-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value="asc"
                    checked={priceSort === 'asc'}
                    onChange={(e) => setPriceSort(e.target.value)}
                    className="cursor-pointer"
                  />
                  <span>Croissant ↑</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value="desc"
                    checked={priceSort === 'desc'}
                    onChange={(e) => setPriceSort(e.target.value)}
                    className="cursor-pointer"
                  />
                  <span>Décroissant ↓</span>
                </label>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1.5 text-gray-700">Prix max</label>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{maxPrice} $</p>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedCity('');
                setSearchTerm('');
                setSelectedDateFilter('all');
                setPriceSort('');
                setMinPrice(0);
                setMaxPrice(500);
                setShowFilters(false);
              }}
              className="w-full py-1.5 md:py-2 mt-2 text-xs md:text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Réinitialiser
            </button>
          </div>
        )}

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4">
          {loading ? (
            <p className="text-center text-gray-500 text-sm md:text-base mt-10">Chargement...</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center text-gray-500 text-sm md:text-base mt-10">Aucun événement trouvé</p>
          ) : (
            <EventList
              events={filteredEvents}
              onEventClick={(id) => {
                navigate(`/events/${id}`);
                setShowSidebar(false);
              }}
              selectedEventId={selectedEventId}
            />
          )}
        </div>
      </div>

      {/* Toggle Sidebar Button - Mobile Only */}
      {!showSidebar && isMobile && (
        <button
          onClick={() => setShowSidebar(true)}
          className={`fixed top-[${headerHeight}px] mt-1 left-3 md:hidden bg-white/95 border border-accent text-accent shadow-lg rounded-full p-2.5 hover:bg-gray-100 transition z-20`}
          title="Ouvrir les filtres"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Mobile: Search and Filter Bar (Always visible when map is showing) */}
     
    </div>
  );
}