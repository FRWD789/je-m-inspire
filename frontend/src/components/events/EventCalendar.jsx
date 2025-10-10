import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, List, Grid3x3 } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { EventList } from './EventList';

const DEBUG = import.meta.env.DEV;
const debug = (...args) => {
  if (DEBUG) console.log(...args);
};
const debugError = (...args) => {
  if (DEBUG) console.error(...args);
};
const debugGroup = (...args) => {
  if (DEBUG) console.group(...args);
};
const debugGroupEnd = () => {
  if (DEBUG) console.groupEnd();
};


const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 6)); // 6 septembre 2025
  const [view, setView] = useState('month'); // 'month', 'list', 'day'
  
  // const { events, loading, error } = useEvents('/api/events'); // Utilisez ceci dans votre projet
  const { events, loading, error } = useEvents('/api/events');

  const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // Navigation entre les mois
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Générer les jours du calendrier
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines max
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [currentDate]);

  // Filtrer les événements par jour
  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Styles
  const containerStyle = {
    backgroundColor: '#f5f5f0',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    backgroundColor: '#4a5a40',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const navLinksStyle = {
    display: 'flex',
    gap: '30px',
    alignItems: 'center'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px'
  };

  const authLinksStyle = {
    display: 'flex',
    gap: '20px'
  };

  const titleStyle = {
    textAlign: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#333'
  };

  const controlsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '0 20px'
  };

  const dateNavigationStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  };

  const navButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    color: '#333'
  };

  const currentDateStyle = {
    fontSize: '18px',
    fontWeight: '500',
    color: '#333'
  };

  const viewButtonsStyle = {
    display: 'flex',
    gap: '10px'
  };

  const viewButtonStyle = (isActive) => ({
    padding: '8px 16px',
    backgroundColor: isActive ? '#4a5a40' : 'white',
    color: isActive ? 'white' : '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '500'
  });

  const calendarGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '10px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const dayHeaderStyle = {
    padding: '10px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#666',
    borderBottom: '2px solid #ddd'
  };

  const dayBoxStyle = (isCurrentMonth, isToday) => ({
    minHeight: '120px',
    padding: '8px',
    backgroundColor: isToday ? '#fff3e0' : 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    opacity: isCurrentMonth ? 1 : 0.4,
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  const dayNumberStyle = (isToday) => ({
    fontSize: '14px',
    fontWeight: isToday ? 'bold' : 'normal',
    color: isToday ? '#ff6b35' : '#333',
    marginBottom: '8px'
  });

  const eventItemStyle = {
    fontSize: '11px',
    padding: '4px 6px',
    marginBottom: '4px',
    backgroundColor: '#f0f0f0',
    borderLeft: '3px solid #4a5a40',
    borderRadius: '2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  };

  const eventTimeStyle = {
    fontWeight: 'bold',
    color: '#4a5a40',
    marginBottom: '2px'
  };

  const eventNameStyle = {
    color: '#666',
    fontSize: '10px'
  };

  return (
    <div style={containerStyle}>
      

      {/* Title */}
      <h1 style={titleStyle}>Evenements</h1>

      {/* Controls */}
      <div style={controlsStyle}>
        <div style={dateNavigationStyle}>
          <button onClick={goToPreviousMonth} style={navButtonStyle}>
            <ChevronLeft size={24} />
          </button>
          <div style={currentDateStyle}>
            {formatMonthYear()}
          </div>
          <button onClick={goToNextMonth} style={navButtonStyle}>
            <ChevronRight size={24} />
          </button>
          <button style={navButtonStyle}>
            <Calendar size={20} />
          </button>
        </div>

        <div style={viewButtonsStyle}>
          <button 
            onClick={() => setView('list')} 
            style={viewButtonStyle(view === 'list')}
          >
            <List size={16} /> List
          </button>
          <button 
            onClick={() => setView('month')} 
            style={viewButtonStyle(view === 'month')}
          >
            <Grid3x3 size={16} /> Month
          </button>
          <button 
            onClick={() => setView('day')} 
            style={viewButtonStyle(view === 'day')}
          >
            <Calendar size={16} /> Day
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {view === 'month' && (
        <div style={calendarGridStyle}>
          {/* Day headers */}
          {daysOfWeek.map(day => (
            <div key={day} style={dayHeaderStyle}>
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day.date);
            const isDayToday = isToday(day.date);

            return (
              <div 
                key={index} 
                style={dayBoxStyle(day.isCurrentMonth, isDayToday)}
              >
                <div style={dayNumberStyle(isDayToday)}>
                  {day.date.getDate()}
                </div>

                {/* Events for this day */}
                {dayEvents.map(event => (
                  <div key={event.id} style={eventItemStyle}>
                    <div style={eventTimeStyle}>
                      {formatTime(event.start_date)} - {formatTime(event.end_date)}
                    </div>
                    <div style={eventNameStyle}>
                      {event.name}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* List View - placeholder */}
      <div style={{ marginTop: '30px' }}>
            {view === 'list' && (
            <div>
                <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                borderLeft: '4px solid #2196f3'
                }}>
                <h2 style={{ 
                    margin: '0 0 5px 0',
                    fontSize: '20px',
                    color: '#1976d2'
                }}>
                    📅 Événements disponibles
                </h2>
                <p style={{ 
                    margin: 0,
                    fontSize: '14px',
                    color: '#666'
                }}>
                    Parcourez tous les événements publics et réservez votre place
                </p>
                </div>
                
                {debug('🔄 Rendu EventList pour /api/events')}
                <EventList 
                endpoint="/api/events" 
                showReserveButton={true}
                showEditButton={false}
                showDeleteButton={false}
                showRefundButton={false}
                showMap={true}  // ✅ Afficher la carte pour tous les événements
                title=""
                />
            </div>
            )}
        </div>

      {/* Day View - placeholder */}
      {view === 'day' && (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          margin: '0 20px'
        }}>
          <h2>Vue journalière</h2>
          <p>Vue du jour - À implémenter selon vos besoins</p>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;