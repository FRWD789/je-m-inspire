import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Search, X, ChevronDown } from 'lucide-react';
import { MapEvents } from '@/components/map';
import { useEvent } from '@/context/EventContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHeaderHeight } from '@/layout/Layout';
import { ThumbnailImage } from '@/components/ui/ResponsiveImage';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // États pour le redimensionnement
  const [mapWidth, setMapWidth] = useState(40); // Pourcentage (40% par défaut)
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Gestion du redimensionnement
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const windowWidth = window.innerWidth;
      const newMapWidth = ((windowWidth - e.clientX) / windowWidth) * 100;
      
      // Limiter entre 20% et 60%
      if (newMapWidth >= 20 && newMapWidth <= 60) {
        setMapWidth(newMapWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div className="w-full h-screen bg-gray-50" 
    style={{ 
      
      height: `calc(100svh - ${headerHeight}px)`
    
     }}>
      <div className="flex h-screen overflow-hidden" style={{ height: `calc(100svh - ${headerHeight}px)` }}>
        {/* Section Événements - Largeur dynamique */}
        <div 
          className="w-full lg:w-auto overflow-y-auto"
          style={{ width: isMobile ? '100%' : `${100 - mapWidth}%` }}
        >
          <div className="p-4 lg:p-6">
            {/* Barre de recherche et filtres */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                  <Search className="text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un événement..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 ${
                    showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                  }`}
                  title="Filtres"
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden md:inline text-sm font-medium">Filtres</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filtres */}
              {showFilters && (
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Catégorie */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Catégorie</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      >
                        <option value="">Toutes les catégories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ville */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Ville</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      >
                        <option value="">Toutes les villes</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tri par prix */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Tri par prix</label>
                      <select
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      >
                        <option value="">Par défaut</option>
                        <option value="asc">Prix croissant</option>
                        <option value="desc">Prix décroissant</option>
                      </select>
                    </div>
                  </div>

                  {/* Date et Prix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Date</label>
                      <div className="flex flex-wrap gap-3">
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
                            <span className="text-sm">
                              {date === 'all'
                                ? 'Tous'
                                : date === 'today'
                                ? "Aujourd'hui"
                                : date === 'week'
                                ? 'Cette semaine'
                                : 'Ce mois'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Prix max */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">
                        Prix max: {maxPrice} $
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </div>

                  {/* Bouton réinitialiser */}
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
                    className="w-full md:w-auto px-6 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition font-medium"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>

            {/* Résultats */}
            <div className="mb-4">
              <p className="text-gray-600 text-sm font-medium">
                {loading
                  ? 'Chargement...'
                  : `${filteredEvents.length} événement${filteredEvents.length !== 1 ? 's' : ''} trouvé${
                      filteredEvents.length !== 1 ? 's' : ''
                    }`}
              </p>
            </div>

            {/* Grille d'événements - 2 colonnes */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Chargement des événements...</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto mb-2" />
                </div>
                <p className="text-gray-500 text-lg mb-2">Aucun événement trouvé</p>
                <p className="text-gray-400 text-sm">Essayez de modifier vos filtres de recherche</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      {event.thumbnail ? (
                       <ThumbnailImage
                          src={event.thumbnail_path}
                          alt={event.name}
                          size="md"
                          className="w-full aspect-square object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-4xl">📷</span>
                        </div>
                      )}
                      
                      {/* Badge places disponibles */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                        {event.available_places > 0 ? (
                          <span className="text-green-600">{event.available_places} places</span>
                        ) : (
                          <span className="text-red-600">Complet</span>
                        )}
                      </div>

                      {/* Catégorie badge */}
                      {event.categorie?.name && (
                        <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white">
                          {event.categorie.name}
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      {/* Titre */}
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {event.name}
                      </h3>

                      {/* Description */}
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                      )}

                      {/* Infos */}
                      <div className="space-y-2 mb-4">
                        {/* Localisation */}
                        {event.localisation?.name && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="truncate">{event.localisation.name}</span>
                          </div>
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="truncate">
                            {new Date(event.start_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Footer - Prix et niveau */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div>
                          <span className="text-2xl font-bold text-primary">
                            {event.base_price > 0 ? `${event.base_price.toFixed(2)} $` : 'Gratuit'}
                          </span>
                        </div>
                        {event.level && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                            Niveau {event.level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section Carte - Largeur dynamique (Desktop uniquement) */}
        {!isMobile && (
          <>
            {/* Handle de redimensionnement */}
            <div
              onMouseDown={handleMouseDown}
              className="hidden lg:block w-1 bg-gray-300 hover:bg-primary hover:w-1.5 cursor-col-resize transition-all relative group"
              style={{ flexShrink: 0 }}
            >
              {/* Indicateur visuel */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
                  ← Glisser pour redimensionner →
                </div>
              </div>
            </div>

            {/* Carte */}
            <div 
              className="hidden lg:flex bg-white"
              style={{ width: `${mapWidth}%`, flexShrink: 0 }}
            >
            <div className="w-full flex flex-col">
              {/* Header de la carte */}
              <div className="bg-primary/5 border-b border-primary/20 p-3 flex-shrink-0">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Carte des événements
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''} sur la carte
                </p>
              </div>

              {/* Contenu de la carte - HAUTEUR FIXE */}
              <div className="flex-1 relative" style={{ minHeight: '400px' }}>
                {filteredEvents.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center p-6">
                      <svg
                        className="w-16 h-16 mx-auto mb-3 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      <p className="text-sm font-medium">Aucun événement à afficher</p>
                      <p className="text-xs mt-1">Les événements apparaîtront ici</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0">
                    <MapEvents
                      events={filteredEvents}
                      selectedEventId={selectedEventId}
                      onEventSelect={setSelectedEventId}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}