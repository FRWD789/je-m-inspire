import { useAuth } from '@/context/AuthContext'
import  { useState } from 'react'
import Form from './form'
import { userOnboardingSchema } from '@/schema/userSchema'
import { Upload, X } from 'lucide-react'
import Input from './ui/input'

import TextArea from './ui/textArea'
import { privateApi } from '@/api/api'

export default function OnBoarding({ onComplete }: { onComplete: () => void }) {
  
  const { updateProfile, updateProfileImg, user } = useAuth()


  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | undefined>(user?.profile.profile_picture)
  const [message, setMessage] = useState<string | null>(null)


  const handleSubmit = async (data: any) => {
    setLoading(true)

    console.log(data)
    try {
    const formData = new FormData()
      // upload image if provided
      if (data.profile_picture) {
        formData.append("profile_picture", data.profile_picture)
      }
      // update bio
      if (data.biography) {
        
        formData.append("biography", data.biography)
      
      }
        
      await updateProfile(formData)

      setMessage("Profil complété avec succès !")
      setTimeout(() => onComplete(), 800)
    } catch (err) {
      console.error(err)
      setMessage("Erreur lors de la mise à jour du profil.")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      await privateApi.post("/onboarding/skip-onboarding")
      onComplete()
    } catch {
      alert("Erreur lors du skip")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md relative shadow-xl">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={handleSkip}
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-2 text-center">Bienvenue, {user?.profile.name} 👋</h2>
        <p className="text-gray-500 text-center mb-6">
          Personnalisez votre profil pour commencer — ou passez pour l’instant.
        </p>

        <Form schema={userOnboardingSchema} onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border group">
              <img
                src={preview || "/default-avatar.png"}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* File Input */}
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-lg flex items-center gap-2 transition">
              <Upload size={18} /> Choisir une photo
               <Input
                    name="profile_picture"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setPreview(URL.createObjectURL(file))
                    }}
                />
            </label>

            {/* Bio Input */}
            <div className="w-full grid">
              <label htmlFor="biography" className="text-sm font-medium mb-1">
                Bio
              </label>
              <TextArea
                id="biography"
                name="biography"
                className="border rounded-lg w-full p-2"
              
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between w-full mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Enregistrement..." : "Terminer"}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Passer
              </button>
            </div>

            {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
          </div>
        </Form>
      </div>
    </div>
  )
}

