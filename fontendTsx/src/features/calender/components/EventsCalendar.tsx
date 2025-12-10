import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';
import type { Event } from '@/types/events';
import EventCard from '@/features/events/components/EventCard';
import { useTranslation } from 'react-i18next';

const EventsCalendar = ({ events }: { events: Event[] }) => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const monthNames = [...Array(12).keys()].map((m) =>
    new Date(2000, m, 1).toLocaleDateString(i18n.language, { month: 'long' })
  );

  const dayNames = [...Array(7).keys()].map((d) =>
    new Date(2000, 0, d + 2).toLocaleDateString(i18n.language, { weekday: 'short' })
  );

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const goToPreviousMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const goToNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDate = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter((event) => {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date);
      return (
        checkDate >= new Date(start.toDateString()) &&
        checkDate <= new Date(end.toDateString())
      );
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayEvents = getEventsForDate(day);

    if (dayEvents.length > 0) {
      setSelectedDate({ date: clickedDate, events: dayEvents });
      setShowModal(true);
    }
  };

  const calendarDays: React.ReactNode[] = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="hidden sm:block h-16 md:h-24 bg-gray-50" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(day);
    const hasEvents = dayEvents.length > 0;
    const today = new Date();
    const isToday =
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();

    calendarDays.push(
      <div
        key={day}
        onClick={() => handleDateClick(day)}
        className={`h-16 sm:h-20 md:h-24 border border-gray-200 p-1 sm:p-2 overflow-hidden flex flex-col transition-all
          ${hasEvents ? 'cursor-pointer hover:bg-blue-50 bg-white' : 'bg-white'}
          ${isToday ? 'ring-2 ring-accent' : ''}`}
      >
        <div className={`text-xs sm:text-sm font-semibold mb-1 ${isToday ? 'text-accent' : 'text-gray-700'}`}>
          {day}
        </div>

        {hasEvents && (
          <div className="space-y-0.5 overflow-hidden flex-1">
            {dayEvents.slice(0, isMobile ? 1 : 2).map((event) => (
              <div
                key={event.id}
                className="text-xs bg-primary text-white px-2 py-1 rounded truncate"
                title={event.name}
              >
                {event.name}
              </div>
            ))}

            {dayEvents.length > (isMobile ? 1 : 2) && (
              <div className="text-xs text-primary font-semibold truncate">
                +{dayEvents.length - (isMobile ? 1 : 2)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 md:p-6">

      <div className="flex gap-2 items-center mb-3 md:mb-6">
        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <h1 className="text-lg md:text-2xl font-semibold">{t("calendar.title")}</h1>
      </div>

      <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label={t("calendar.prev")}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label={t("calendar.next")}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-7 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center font-semibold text-gray-600 py-2 text-sm">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 mb-2 sm:hidden">
        {dayNames.map((d) => (
          <div key={d} className="text-center font-semibold text-gray-600 py-1 text-xs">
            {d.charAt(0)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {calendarDays}
      </div>

      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-3xl flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

            <div className="sticky top-0 bg-white border-b p-4 flex justify-between shadow-sm">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">
                {t("calendar.eventsFor")}{" "}
                {selectedDate.date.toLocaleDateString(i18n.language, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </h3>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label={t("calendar.close")}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDate.events.map((event:any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;