import { AlertTriangle, Plus, Trash2, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react';
import FormEvents from './FormEvents';

import { useEvent } from '@/context/EventContext';
import EventCard from '@/features/events/components/EventCard';


type EventListProps = {
  events: any[];
  onEventClick?: (eventId: number) => void;
  selectedEventId?: number | null;
}

export default function EventList({ events, onEventClick, selectedEventId }: EventListProps) {
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedDeleteEvent, setSelectedDeleteEvent] = useState<any | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { deleteEvent } = useEvent();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSelectedEvent(null);
      }
    }
    if (selectedEvent) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedEvent]);

  // 🟢 Auto-scroll selected card into view
  useEffect(() => {
    if (!selectedEventId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-event-id="${selectedEventId}"]`);
    if (el) {
      (el as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedEventId]);

  const handleEventClick = (event: any) => {
    if (onEventClick) onEventClick(event.id);
  };

  const handleEdit = (event: any) => {
    setSelectedEvent(event);
  };

  const handleDelete = (event: any) => {
    setSelectedDeleteEvent(event);
  };

  return (
    <>
      {/* Event Cards List */}
      <div
        ref={listRef}
        className=" max-h-full overflow-x-hidden grid grid-cols-1 max-w-full gap-y-[16px] px-6 py-[24px]"
      >
        {events.map((event) => (
          <div
            key={event.id}
            data-event-id={event.id}
            onClick={() => handleEventClick(event)}
            className={`transition-all duration-200  cursor-pointer ${
              selectedEventId === event.id ? 'ring-2 ring-accent ring-offset-0' : ''
            }`}
          >
            <EventCard
              event={event}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      {/* Edit Event Drawer */}
      {selectedEvent && (
        <div className="w-full z-[9999] fixed top-0 left-0 h-screen inset-0 backdrop-blur-lg bg-black/30">
          <div
            ref={menuRef}
            className="px-[24px] py-[32px] h-screen grid gap-y-[24px] absolute top-0 right-0 bg-white w-full sm:w-[480px]"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Modifier l'événement : {selectedEvent.name}
              </h2>
              <Plus
                className="rotate-45 cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => setSelectedEvent(null)}
              />
            </div>
            <div className="max-h-[600px] px-[16px] py-[24px] overflow-y-auto">
              <FormEvents
                onSuccess={() => setSelectedEvent(null)}
                type="edit"
                eventId={selectedEvent.id}
                defaultValues={selectedEvent}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selectedDeleteEvent && (
        <div className="fixed inset-0 backdrop-blur-lg bg-black/30 flex justify-center items-center z-[999]">
          <div
            ref={menuRef}
            className="bg-white rounded-xl shadow-xl p-6 w-[400px] max-w-[90%] animate-fadeIn"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Supprimer l'événement
              </h2>
              <button
                onClick={() => setSelectedDeleteEvent(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-3 text-gray-600">
              <p>
                Êtes-vous sûr de vouloir supprimer{' '}
                <span className="font-semibold text-gray-900">
                  {selectedDeleteEvent.name}
                </span>{' '}
                ? Cette action est <strong>irréversible</strong>.
              </p>

              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-500 space-y-1">
                <p>
                  📅{' '}
                  {new Date(
                    selectedDeleteEvent.start_date
                  ).toLocaleDateString()}{' '}
                  →{' '}
                  {new Date(
                    selectedDeleteEvent.end_date
                  ).toLocaleDateString()}
                </p>
                <p>
                  📍 {selectedDeleteEvent.localisation?.name || 'Non spécifié'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDeleteEvent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  deleteEvent(selectedDeleteEvent.id);
                  setSelectedDeleteEvent(null);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
