import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/service/authService";

interface LinkedAccountSuccessProps {
    provider: "stripe" | "paypal";
}

export default function LinkedAccountSuccess({ provider }: LinkedAccountSuccessProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const finalize = async () => {
            try {
                const code = searchParams.get("code");
                if (!code) {
                    throw new Error(`Code ${provider} manquant`);
                }

                let response;

                if (provider === "stripe") {
                    response = await authService.linkStripe(code);
                } else {
                    response = await authService.linkPaypal(code);
                }

                if (!response.success) {
                    throw new Error(response.message || "Erreur lors de la liaison");
                }

                setSuccess(true);

                // 🔥 Redirection auto après 2 secondes
                setTimeout(() => {
                    navigate("/dashboard/profile-settings");
                }, 2000);

            } catch (err: any) {
                console.error("Erreur :", err);
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Une erreur est survenue"
                );
            } finally {
                setLoading(false);
            }
        };

        finalize();
    }, [provider, searchParams, navigate]);

    // ------------------------------
    //         LOADING
    // ------------------------------
    if (loading) {
        return (
            <div style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
                <div
                    style={{
                        width: "50px",
                        height: "50px",
                        border: "4px solid #eee",
                        borderTop: "4px solid #007bff",
                        borderRadius: "50%",
                        margin: "0 auto 20px",
                        animation: "spin 1s linear infinite",
                    }}
                />
                <h2>Finalisation en cours...</h2>

                <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // ------------------------------
    //         ERROR
    // ------------------------------
    if (error) {
        return (
            <div style={{
                maxWidth: "600px",
                margin: "50px auto",
                padding: "40px",
                textAlign: "center",
                backgroundColor: "#fff3cd",
                borderRadius: "10px",
                border: "1px solid #ffc107"
            }}>
                <h1 style={{ color: "#856404" }}>Erreur</h1>
                <p>{error}</p>

                <button
                    onClick={() => navigate("/dashboard/profile-settings")}
                    style={{
                        padding: "12px 30px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginRight: "10px"
                    }}
                >
                    Retour au profil
                </button>

                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: "12px 30px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    // ------------------------------
    //         SUCCESS
    // ------------------------------
    return (
        <div style={{
            maxWidth: "600px",
            margin: "50px auto",
            padding: "40px",
            textAlign: "center",
            backgroundColor: "#d4edda",
            borderRadius: "10px",
            border: "1px solid #c3e6cb"
        }}>
            <h1 style={{ color: "#155724" }}>
                Compte {provider === "stripe" ? "Stripe" : "PayPal"} lié avec succès !
            </h1>

            <p>Redirection...</p>

            <button
                onClick={() => navigate("/dashboard/profile-settings")}
                style={{
                    padding: "15px 40px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                }}
            >
                Aller au profil
            </button>
        </div>
    );
}
