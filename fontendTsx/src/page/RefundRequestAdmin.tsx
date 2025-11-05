import React, { useEffect, useState } from "react";
import { Shield, Check, X, MessageCircle, RefreshCcw } from "lucide-react";
import usePrivateApi from "@/hooks/usePrivateApi";
import { RefundService } from "@/service/RefundService";
import Button from "@/components/ui/button";

interface RefundRequest {
  id: number;
  user: { id: number; name: string; email: string };
  operation: { id: number; quantity: number; event: { name: string } };
  montant: number;
  motif: string;
  statut: "en_attente" | "approuve" | "refuse";
  date_traitement?: string;
  message?: string; // admin message
}

export default function RefundRequestAdmin() {
  const api = usePrivateApi();
  const service = RefundService(api);

  const [viewContent, setViewContent] = useState<{ title: string; content: string } | null>(null);
  const [currentTab, setCurrentTab] = useState<"pending" | "approved" | "refused" | "all">("pending");
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [modalRequest, setModalRequest] = useState<RefundRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "refuse" | null>(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await service.getAllRefunds();
      setRequests(res || []);
    } catch {
      setError("Impossible de récupérer les demandes de remboursement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcess = async () => {
    if (!modalRequest || !actionType) return;
    if (adminMessage.length < 5) return;

    setProcessingId(modalRequest.id);
    try {
      await service.processRefund(modalRequest.id, {
        statut: actionType === "approve" ? "approuve" : "refuse",
        commentaire_admin: adminMessage,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === modalRequest.id
            ? {
                ...r,
                statut: actionType === "approve" ? "approuve" : "refuse",
                message: adminMessage,
                date_traitement: new Date().toISOString(),
              }
            : r
        )
      );
      setModalRequest(null);
      setAdminMessage("");
      setActionType(null);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (currentTab === "pending") return r.statut === "en_attente";
    if (currentTab === "approved") return r.statut === "approuve";
    if (currentTab === "refused") return r.statut === "refuse";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header + Stats */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Shield size={24} /> Gestion des demandes de remboursement
          </h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>En attente: {requests.filter((r) => r.statut === "en_attente").length}</span>
            <span>Approuvées: {requests.filter((r) => r.statut === "approuve").length}</span>
            <span>Refusées: {requests.filter((r) => r.statut === "refuse").length}</span>
          </div>
        </div>
        <button
          onClick={fetchRequests}
          className="px-3 py-2 rounded-[4px] bg-primary/60 text-white hover:bg-primary/80 transition-all text-sm flex items-center gap-2"
        >
          <RefreshCcw size={15} /> Rafraîchir
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        {["pending", "approved", "refused", "all"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-md font-medium ${
              currentTab === tab
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setCurrentTab(tab as any)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center mt-6">Chargement des demandes...</p>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg py-16">
          <MessageCircle size={40} className="mx-auto text-accent mb-4" />
          <h2 className="text-lg font-semibold mb-2">Aucune demande trouvée</h2>
          <p className="text-gray-500">Aucune demande correspondant à ce filtre</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-[4px] shadow-sm border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="py-3 px-4 font-semibold">Utilisateur</th>
                <th className="py-3 px-4 font-semibold">Événement</th>
                <th className="py-3 px-4 font-semibold">Montant (€)</th>
                <th className="py-3 px-4 font-semibold">Motif</th>
                <th className="py-3 px-4 font-semibold">Message</th>
                <th className="py-3 px-4 font-semibold">Statut / Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    {req.user.name} ({req.user.email})
                  </td>
                  <td className="py-3 px-4">
                    {req.operation.event.name} x{req.operation.quantity}
                  </td>
                  <td className="py-3 px-4">{req.montant}</td>

                  {/* Motif click */}
                  <td
                    className="py-3 px-4 cursor-pointer text-primary hover:underline max-w-[200px] truncate"
                    onClick={() =>
                      req.motif &&
                      setViewContent({ title: "Motif de remboursement", content: req.motif })
                    }
                  >
                    {req.motif
                      ? req.motif.slice(0, 40) +
                        (req.motif.length > 40 ? "..." : "")
                      : "Aucun motif"}
                  </td>

                  {/* Message click */}
                  <td
                    className="py-3 px-4 cursor-pointer text-primary hover:underline max-w-[200px] truncate"
                    onClick={() =>
                      req.commentaire_admin &&
                      setViewContent({ title: "Message de l'administrateur", content: req.commentaire_admin })
                    }
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageCircle size={18} />
                      {req.commentaire_admin
                        ? req.commentaire_admin.slice(0, 40) +
                          (req.commentaire_admin.length > 40 ? "..." : "")
                        : "Aucun message"}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 flex flex-col gap-2">
                    {req.statut === "en_attente" ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setModalRequest(req);
                            setActionType("approve");
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                        >
                          <Check size={16} /> Approuver
                        </Button>
                        <Button
                          onClick={() => {
                            setModalRequest(req);
                            setActionType("refuse");
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                        >
                          <X size={16} /> Refuser
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {req.statut === "approuve" ? "Approuvé" : "Refusé"} le{" "}
                        {req.date_traitement
                          ? new Date(req.date_traitement).toLocaleString()
                          : "-"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Content Modal (motif / message) */}
      {viewContent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-3">{viewContent.title}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{viewContent.content}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewContent(null)}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80 text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for admin approval/refusal */}
      {modalRequest && actionType && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-3">
              {actionType === "approve" ? "Approuver" : "Refuser"} la demande de{" "}
              {modalRequest.user.name}
            </h3>
            <textarea
              placeholder="Ajouter un message (minimum 5 caractères)..."
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              rows={4}
              className="w-full rounded-md p-2 mb-2 border border-gray-300 focus:ring-primary focus:border-primary text-sm"
            />
            {adminMessage.length > 0 && adminMessage.length < 5 && (
              <p className="text-red-600 text-sm mb-2">
                Le message doit contenir au moins 5 caractères.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalRequest(null);
                  setActionType(null);
                  setAdminMessage("");
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleProcess}
                disabled={adminMessage.length < 5 || processingId === modalRequest.id}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                  adminMessage.length < 5
                    ? "bg-gray-400 cursor-not-allowed"
                    : actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processingId === modalRequest.id ? "⏳" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
