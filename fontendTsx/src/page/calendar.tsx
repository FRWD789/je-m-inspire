import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '@/context/EventContext';

type ViewType = 'month' | 'list' | 'day';

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();
  
  const { events, loading } = useEvent();

  const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Navigation entre les mois
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Générer les jours du calendrier
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    
    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [currentDate]);

  // Récupérer les événements pour un jour donné
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Vérifier si une date est aujourd'hui
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Formater l'heure
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Formater le mois et l'année
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  // Gérer le clic sur une date
  const handleDayClick = (date: Date) => {
    // Formater la date en YYYY-MM-DD en heure locale (pas UTC)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    navigate(`/events?date=${formattedDate}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Titre */}
      <h1 className="text-3xl font-bold text-center mb-8">Calendrier des Événements</h1>

      {/* Contrôles */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} />
          <span className="text-lg font-medium capitalize">{formatMonthYear()}</span>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Vue Calendrier */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-7 gap-2 bg-white p-4 rounded-lg shadow-sm">
          {/* En-têtes des jours */}
          {daysOfWeek.map(day => (
            <div
              key={day}
              className="text-center font-semibold text-sm text-gray-600 py-2 border-b-2"
            >
              {day}
            </div>
          ))}

          {/* Jours du calendrier */}
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day.date);
            const isDayToday = isToday(day.date);

            return (
              <div
                key={index}
                onClick={() => handleDayClick(day.date)}
                className={`
                  min-h-[120px] p-2 border rounded-md transition-all cursor-pointer
                  ${isDayToday ? 'bg-orange-50 border-orange-300' : 'bg-white border-gray-200'}
                  ${!day.isCurrentMonth ? 'opacity-40' : 'opacity-100'}
                  hover:shadow-md hover:border-primary
                `}
              >
                <div className={`text-sm mb-2 ${isDayToday ? 'font-bold text-orange-600' : 'text-gray-700'}`}>
                  {day.date.getDate()}
                </div>

                {/* Événements du jour */}
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${event.id}`);
                    }}
                    className="text-xs p-1 mb-1 bg-gray-100 border-l-2 border-primary rounded overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer hover:bg-gray-200"
                    title={event.name}
                  >
                    <div className="font-semibold text-primary text-[10px]">
                      {formatTime(event.start_date)}
                    </div>
                    <div className="text-gray-600 text-[10px]">
                      {event.name}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}