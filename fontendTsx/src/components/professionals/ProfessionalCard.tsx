import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

interface Professional {
  id: number;
  name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
  city?: string;
}

interface ProfessionalCardProps {
  professional: Professional;
}

export default function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/user/${professional.id}`);
  };

  const getProfileImageUrl = (path: string | null) => {
    if (!path) return null;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://api.jminspire.com";
    return `${baseUrl}/storage/${path}`;
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-primary/30"
    >
      {/* Photo de profil */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
        {professional.profile_picture ? (
          <img
            src={getProfileImageUrl(professional.profile_picture)}
            alt={`${professional.name} ${professional.last_name}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              // Fallback si l'image ne charge pas
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        
        {/* Fallback icon si pas d'image */}
        <div
          className={`${
            professional.profile_picture ? "hidden" : "flex"
          } absolute inset-0 items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20`}
        >
          <User size={80} className="text-primary/40" />
        </div>

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badge "Pro" */}
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
          PRO
        </div>
      </div>

      {/* Informations */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
          {professional.profile.name} {professional.profile.last_name}
        </h3>
        
        {professional.city && (
          <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
            <span>📍</span> {professional.city}
          </p>
        )}

        {/* Bouton */}
        <button className="w-full mt-3 py-2 px-4 bg-primary/10 text-primary rounded-lg font-medium text-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
          Voir le profil →
        </button>
      </div>
    </div>
  );
}