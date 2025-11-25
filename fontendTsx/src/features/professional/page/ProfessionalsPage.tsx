import React, { useEffect, useState } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import ProfessionalCard from "@/features/professional/component/ProfessionalCard";
import { ProfessionalService } from "@/features/professional/service/professionalService";

interface Professional {
  id: number;
  name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
  city?: string;
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredPros, setFilteredPros] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    // Filtrer les professionnels par nom/ville
    if (searchTerm.trim() === "") {
      setFilteredPros(professionals);
    } else {
      const filtered = professionals.filter((pro) => {
        const fullName = `${pro.name} ${pro.last_name}`.toLowerCase();
        const city = pro.city?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || city.includes(search);
      });
      setFilteredPros(filtered);
    }
  }, [searchTerm, professionals]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await ProfessionalService.getAll();
      
      // L'API retourne { data: [...] } ou directement un array
      const prosData = response.data || response;
      setProfessionals(prosData);
      setFilteredPros(prosData);
    } catch (err: any) {
      console.error("Erreur chargement professionnels:", err);
      setError("Impossible de charger les professionnels");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement des professionnels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={fetchProfessionals}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Users size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Nos Professionnels
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les professionnels qualifiés de notre plateforme
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher par nom ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="text-center mb-8">
          <p className="text-gray-600">
            {filteredPros.length === professionals.length ? (
              <span>
                <strong className="text-primary">{professionals.length}</strong> professionnel
                {professionals.length > 1 ? "s" : ""} disponible{professionals.length > 1 ? "s" : ""}
              </span>
            ) : (
              <span>
                <strong className="text-primary">{filteredPros.length}</strong> résultat
                {filteredPros.length > 1 ? "s" : ""} sur {professionals.length}
              </span>
            )}
          </p>
        </div>

        {/* Grille de professionnels */}
        {filteredPros.length === 0 ? (
          <div className="text-center py-20">
            <Users size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun professionnel trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Essayez avec d'autres mots-clés"
                : "Aucun professionnel n'est disponible pour le moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPros.map((pro) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}