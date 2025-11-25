import { publicApi } from "@/api/api";

export const ProfessionalService = {
  /**
   * Récupérer tous les professionnels approuvés
   */
  getAll: async () => {
    const response = await publicApi.get("/professionnels");
    return response.data;
  },

  /**
   * Récupérer un professionnel par ID
   */
  getById: async (id: number) => {
    const response = await publicApi.get(`/users/${id}`);
    return response.data;
  },
};