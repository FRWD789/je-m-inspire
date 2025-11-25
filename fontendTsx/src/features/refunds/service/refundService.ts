import { privateApi } from "@/api/api";

export const RefundService = () => ({
    requestRefund: async (operationId: number, motif: string, montant: number) => {
      const res = await privateApi.post("/remboursements", { operation_id: operationId, motif, montant });
      return res.data;
    },
    getMyRefunds: async () => {
      const res = await privateApi.get("/mes-remboursements");
      return res.data;
    },
    // Retourne admin (indirect) ou pro (direct) selon le rôle
    getAllRefunds: async () => {
      const res = await privateApi.get("/remboursements");
      return res.data;
    },
    processRefund: async (
        id: number,
        data: { statut: "approuve" | "refuse"; commentaire_admin?: string }
      ) => {
        const res = await privateApi.put(`/remboursements/${id}/traiter`, data);
        return res.data;
      },
});