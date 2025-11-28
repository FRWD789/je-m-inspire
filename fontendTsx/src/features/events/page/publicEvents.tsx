import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Filter, Menu, Search, X, Map as MapIcon, Maximize2, Minimize2 } from 'lucide-react';
import { MapEvents } from '@/components/map';
import EventList from '@/features/events/components/EventList';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // États pour la carte draggable
  const [showMap, setShowMap] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

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

  // Gestion du drag de la carte
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.map-drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - mapPosition.x,
        y: e.clientY - mapPosition.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Limiter le mouvement dans les limites de l'écran
      const maxX = window.innerWidth - (mapRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (mapRef.current?.offsetHeight || 0);
      
      setMapPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, mapPosition]);

  return (
    <div className="relative w-full min-h-screen bg-gray-50" style={{ paddingTop: `${headerHeight}px` }}>
      {/* Conteneur principal - Liste d'événements */}
      <div className="container mx-auto px-4 py-6">
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
              className={`p-2 rounded-lg hover:bg-gray-100 transition ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
              title="Filtres"
            >
              <Filter className="w-5 h-5" />
            </button>
            {!isMobile && (
              <button
                onClick={() => setShowMap(!showMap)}
                className={`p-2 rounded-lg hover:bg-gray-100 transition ${
                  showMap ? 'bg-green-100 text-green-600' : 'text-gray-600'
                }`}
                title={showMap ? 'Masquer la carte' : 'Afficher la carte'}
              >
                <MapIcon className="w-5 h-5" />
              </button>
            )}
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
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Prix max: {maxPrice} $</label>
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
          <p className="text-gray-600 text-sm">
            {loading ? 'Chargement...' : `${filteredEvents.length} événement${filteredEvents.length !== 1 ? 's' : ''} trouvé${filteredEvents.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Liste d'événements */}
        {loading ? (
          <p className="text-center text-gray-500 py-10">Chargement...</p>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">Aucun événement trouvé</p>
            <p className="text-gray-400 text-sm">Essayez de modifier vos filtres de recherche</p>
          </div>
        ) : (
          <EventList
            events={filteredEvents}
            onEventClick={(id) => navigate(`/events/${id}`)}
            selectedEventId={selectedEventId}
          />
        )}
      </div>

      {/* Carte draggable (Desktop uniquement) */}
      {showMap && !isMobile && (
        <div
          ref={mapRef}
          onMouseDown={handleMouseDown}
          className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden transition-all ${
            isDragging ? 'cursor-grabbing' : 'cursor-default'
          } ${mapExpanded ? 'w-[90vw] h-[90vh]' : 'w-[400px] h-[500px]'}`}
          style={{
            right: mapExpanded ? '50%' : mapPosition.x || '20px',
            top: mapExpanded ? '50%' : mapPosition.y || `${headerHeight + 20}px`,
            transform: mapExpanded ? 'translate(50%, -50%)' : 'none',
          }}
        >
          {/* Barre de contrôle de la carte */}
          <div className="map-drag-handle absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-2 flex items-center justify-between cursor-grab active:cursor-grabbing z-10">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Carte des événements</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMapExpanded(!mapExpanded)}
                className="p-1.5 rounded hover:bg-gray-100 transition"
                title={mapExpanded ? 'Réduire' : 'Agrandir'}
              >
                {mapExpanded ? (
                  <Minimize2 className="w-4 h-4 text-gray-600" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => setShowMap(false)}
                className="p-1.5 rounded hover:bg-gray-100 transition"
                title="Fermer"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Contenu de la carte */}
          <div className="w-full h-full pt-10">
            <MapEvents
              events={filteredEvents}
              selectedEventId={selectedEventId}
              onEventSelect={setSelectedEventId}
            />
          </div>
        </div>
      )}
    </div>
  );
}