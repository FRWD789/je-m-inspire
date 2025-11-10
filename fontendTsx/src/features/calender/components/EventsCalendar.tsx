import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, MapPin, Calendar as CalendarIcon, Users, Calendar } from 'lucide-react';
import type { Event } from '@/types/events';
import EventCard from '@/features/events/components/EventCard';


// Sample events data based on your API response


const EventsCalendar = ({events}:{events:Event[]}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if a date has events
  const getEventsForDate = (day) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      return checkDate >= new Date(startDate.toDateString()) && 
             checkDate <= new Date(endDate.toDateString());
    });
  };

  // Handle date click
  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayEvents = getEventsForDate(day);
    
    if (dayEvents.length > 0) {
      setSelectedDate({ date: clickedDate, events: dayEvents });
      setShowModal(true);
    }
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-24 bg-gray-50"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(day);
    const hasEvents = dayEvents.length > 0;
    const isToday = 
      day === new Date().getDate() && 
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear();

    calendarDays.push(
      <div
        key={day}
        onClick={() => handleDateClick(day)}
        className={`min-h-24 border  border-gray-200 p-2 transition-all ${
          hasEvents ? 'cursor-pointer hover:bg-blue-50 bg-white' : 'bg-white'
        } ${isToday ? 'ring-2 ring-accent' : ''}`}
      >
        <div className={`text-sm font-semibold mb-1 ${
          isToday ? 'text-accent' : 'text-gray-700'
        }`}>
          {day}
        </div>
        {hasEvents && (
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className="text-xs bg-primary text-white px-2 py-1 rounded truncate"
                title={event.name}
              >
                {event.name}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-primary font-semibold">
                +{dayEvents.length - 2} plus
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6  ">
      {/* Calendar Header */}
      <div className='flex gap-2 items-center'>
      
        <h1>Calendrier</h1>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {calendarDays}
      </div>

      {/* Event Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-3xl bg-opacity-50 flex items-center justify-center z-9999 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b z-999 shadow-2xl border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                Événements - {selectedDate.date.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>


            {/* Modal Content - Grid of Event Cards */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDate.events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
 
                />
              ))}
            </div>
           
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;