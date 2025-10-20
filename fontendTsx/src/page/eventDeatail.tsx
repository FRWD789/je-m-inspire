import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEvent } from '@/context/EventContext';
import { Calendar, MapPin, User, Euro, ArrowLeft, DollarSignIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EventDetail() {
  const { id } = useParams();
  const { event, fetchEventById, loading } = useEvent();
  const navigate = useNavigate();

 
 useEffect(() => {
    if (id) fetchEventById(id);
  }, [id]);
  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center text-accent">
        <h1>
                    Chargement de l’événement...
          
        </h1>       
        </div>
      );
    }
   if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-accent">
        <h1>Événement introuvable.</h1>
        <button
          onClick={() => navigate("/events")}
          className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-primary transition"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <section className="  bg-white/40 backdrop-blur-3xl">
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full drop-shadow-xl overflow-hidden rounded-t-[12px]">
        <img
          src={event.thumbnail || "/assets/img/bg-hero.avif"}
          alt={event.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/15 flex flex-col justify-end p-8 text-white">
          <button
            onClick={() => navigate("/events")}
            className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-4xl md:text-5xl text-white font-bold mb-4">{event.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-200">
            <div className="flex items-center gap-1">
              <Calendar size={16} />{" "}
              {new Date(event.start_date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} /> {event.localisation.address || "Adresse à venir"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" px-[42px] py-[24px]  flex gap-8">
        {/* Left: Description & Organizer */}
        <div className="space-y-6 flex-1 ">
          {/* Organizer */}
          <div className="flex  items-center gap-3">
            {event.creator?
             <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-primary text-white border-gray-300 overflow-hidden">
                 {event.creator.profile_picture ?  <img src={`http://localhost:8000/storage/${event.creator.profile_picture}`} alt="" />:event.creator.name[0].toUpperCase()}
                </div>
            
            
           :
            <div className="w-12 h-12 flex items-center bg-primary text-white justify-center rounded-full object-cover">
              T

            </div>}
            <div>
              <p className="text-sm text-gray-600">Organisé par</p>
              <p className="font-semibold text-gray-800">
                {event.creator?.name || "Organisateur anonyme"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-semibold mb-3">À propos de l’événement</h2>
            <div className='max-h-[10vh] overflow-y-auto'>
               <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {event.description || "Aucune description disponible pour cet événement."}
            </p>

            </div>
           
          </div>

          {/* Category Tag */}
          {event.categorie && (
            <div>
              <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                Catégorie #{event.categorie.name}
              </span>
            </div>
          )}
        </div>

        {/* Right: Reservation Card */}
        <aside className="hover:bg-white transition rounded-2xl hover:shadow-md p-6 h-fit   space-y-4">
          <h3 className="text-xl font-semibold">Réserver votre place</h3>

          <div className="flex items-center gap-2 ">
            <DollarSignIcon size={18} />
            <span className="text-lg font-medium">{event.base_price} </span>
          </div>

          <button className="w-full py-3 bg-accent text-white rounded-[8px] hover:bg-primary transition font-medium">
            Réserver maintenant
          </button>

          {/* Map Preview */}
          {event.localisation.lat && event.localisation.lng && (
            <div className="h-48 mt-4 rounded-xl overflow-hidden bg-gray-100">
              <iframe
                src={`https://maps.google.com/maps?q=${event.localisation_lat},${event.localisation_lng}&z=14&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              ></iframe>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}