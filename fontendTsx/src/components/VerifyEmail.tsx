import React, { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { privateApi } from "../api/api"
import Button from "../components/Button"

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<string | null>("Vérification en cours...")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyEmail = async () => {
      const id = searchParams.get("id")
      const hash = searchParams.get("hash")
      const expires = searchParams.get("expires")
      const signature = searchParams.get("signature")

      if (!id || !hash || !expires || !signature) {
        setError("Lien de vérification invalide.")
        setStatus(null)
        setLoading(false)
        return
      }

      try {
        const res = await privateApi.get(`/email/verify/${id}/${hash}`, {
          params: { expires, signature },
        })

        if (res.data?.message) {
          setStatus(res.data.message)
        } else {
          setStatus("Email vérifié avec succès !")
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Échec de la vérification. Veuillez réessayer.")
        setStatus(null)
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <section className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Vérification de l’email</h2>

        {loading && <p>Vérification en cours...</p>}

        {status && !loading && <p className="text-green-600">{status}</p>}
        {error && !loading && <p className="text-red-600">{error}</p>}

        {!loading && (
          <Button className="mt-6 w-full" onClick={() => navigate("/login")}>
            Retour à la connexion
          </Button>
        )}
      </div>
    </section>
  )
}
