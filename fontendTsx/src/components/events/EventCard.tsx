import React from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import Button from "../ui/button";
import Card from "../ui/card";

type EventCardProps = {
  orientation?:"horizontale"|"vertical",
  event: any;
  onEdit?: (event: any) => void;
  isSelected?: boolean;
  onDelete?: (event: any) => void;
  className?: string; // optional, for carousel layout adjustments
};

export default function EventCard({
  orientation="horizontale",
  event,
  onEdit,
  onDelete,
  className = "",
}: EventCardProps) {
  return (
    <Card
      key={event.id}
      className={`flex flex-col ${orientation=="horizontale"?"md:flex-row":""} items-start gap-4 p-4 hover:shadow-md transition-all duration-200 border border-gray-100 rounded-2xl bg-white ${className}`}
    >
      {/* Image */}
      <div className="w-full md:w-[120px] h-[100px] flex-shrink-0 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-sm overflow-hidden">
        {event.thumbnail ? (
          <img
            src={event.thumbnail}
            alt={event.name}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          "No Image"
        )}
      </div>

      {/* Event info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{event.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {event.categorie?.name} • {event.level}
          </p>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
          <MapPin size={14} className="text-gray-400" />
          <span className="truncate">{event.localisation?.name}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
          <Calendar size={12} />
          <span>
            {new Date(event.start_date).toLocaleDateString()} →{" "}
            {new Date(event.end_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col items-end justify-between h-full mt-2 md:mt-0">
        <div className="text-right">
          <p className="text-base font-semibold text-gray-800">
            {event.base_price} €
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Users size={12} />
            {event.available_places}/{event.max_places} places
          </div>
        </div>

        {event.is_creator && (
          <div className="mt-3 flex flex-col gap-2">
            <Button
              onClick={() => onEdit(event)}
              variant="outline"
              className="text-xs font-medium w-auto px-3 py-1"
            >
              Modifier
            </Button>
            <Button
              onClick={() => onDelete(event)}
             
              className="text-xs font-medium w-auto px-3 py-1"
            >
              Supprimer
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
