import React, { use, useEffect, useState } from "react"
import axios from "axios"
import { ImageUp, Settings, Shield, SlidersHorizontal, Upload, User2, X } from "lucide-react"
import Form from "@/components/form"
import { userAvtarProfileSchema, userPasswordSchema, userProfileSchema, type UserAvtarProfileFormType, type UserPasswordFormType, type UserProfileFormType } from "@/schema/userSchema"
import Input from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import LinkedAccountsSection from "./LinkedAccountsSection"
import TextArea from "@/components/ui/textArea"

export default function User() {

  const [currentTab, setCurrentTab] = useState<"profile" | "security" | "plan">("profile")
  const {updateProfile,updateProfileImg,updatePassword,user} = useAuth()
  const [defaultValues,setDefaultValues] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | undefined>(user?.profile.profile_picture)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const normalizeUserDate = (user:any) => ({
    ...user,
    date_of_birth: user?.date_of_birth
      ? new Date(user.date_of_birth).toISOString().split("T")[0]
      : "",
  });
  useEffect(() => {
    if(user) {
       setDefaultValues(normalizeUserDate(user.profile));
    }
  if (user?.profile.profile_picture) {
    setPreview(user.profile.profile_picture);
    } else {
      setPreview("/default-avatar.png");
    }
  }, [user]);
const handleUpload = async (data:UserAvtarProfileFormType) => {
  const file = data.profile_picture[0]
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append("profile_picture", file)

    try {
      const res = await updateProfileImg(formData)
      setAvatarUrl(`http://localhost:8000/storage/${res.profile_picture}`);
      setPreview(null);
      console.log(user)
      setMessage("Photo mise à jour avec succès.")
    } catch {
      setMessage("Erreur lors du téléversement de la photo.")
    } finally {
      setLoading(false)
    }
}

 const handlePasswordUpdate = async (data: UserPasswordFormType) => {
  setLoading(true)
  setMessage(null)
  try {
    updatePassword(data)
    setMessage("Mot de passe mis à jour avec succès !")
  } catch (err: any) {
    setMessage("Erreur lors de la mise à jour du mot de passe.")
  } finally {
    setLoading(false)
  }
}

  const onSubmit = async (data: UserProfileFormType) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== "") formData.append(key, value as any)
    })

    try {
      updateProfile(formData)
      setDefaultValues(normalizeUserDate(user))
      setMessage("Profil mis à jour avec succès.")
    } catch {
      setMessage("Erreur lors de la mise à jour du profil.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <p>Loading...</p>;

  return (
    <section className="grid gap-y-8">
      <div className="grid gap-y-2">
        <h1 className="text-2xl font-semibold flex gap-2 items-center">
          <Settings /> Paramètre du compte
        </h1>
        {/* Tabs */}
        <div className="flex gap-3 ">
          {["profile", "security", "plan"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
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
      </div>

      {/* Contenu principal */}
      <div className=" shadow-sm bg-white/50  p-6">
        {currentTab === "profile" && ( 
            <div className="p-8 md:p-10  mx-auto space-y-10">

                {/* ===== Avatar Section ===== */}
                <section className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageUp size={20} className="text-primary" />
                    <h2 className="text-xl font-semibold">Photo de profil</h2>
                  </div>

                  <div
                    className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 cursor-pointer group"
                    onClick={() => setShowAvatarModal(true)}
                  >
                    <img
                      src={preview || avatarUrl || "/default-avatar.png"}
                      alt="Avatar"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded-full">
                      <span className="text-white text-sm font-medium">Modifier</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Cliquez pour changer la photo</p>
                </section>

                  {/* ===== User Info Form ===== */}
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <User2 size={20} className="text-primary" />
                      <h2 className="text-xl font-semibold">Informations personnelles</h2>
                    </div>

                    <Form defaultValues={defaultValues} schema={userProfileSchema} onSubmit={onSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col md:col-span-2">
                          <label htmlFor="name" className="text-sm font-medium mb-1">Bio</label>
                          <TextArea id="biography"  name="biography"  />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="name" className="text-sm font-medium mb-1">Nom</label>
                          <Input id="name" type="text" name="name" placeholder="Votre nom" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="last_name" className="text-sm font-medium mb-1">Prénom</label>
                          <Input id="last_name" type="text" name="last_name" placeholder="Votre prénom" />
                        </div>
                        <div className="flex flex-col md:col-span-2">
                          <label htmlFor="email" className="text-sm font-medium mb-1">Email</label>
                          <Input id="email" type="email" name="email" placeholder="exemple@mail.com" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="city" className="text-sm font-medium mb-1">Ville</label>
                          <Input id="city" type="text" name="city" placeholder="Votre ville" />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="date_of_birth" className="text-sm font-medium mb-1">Date de naissance</label>
                          <Input id="date_of_birth" type="date" name="date_of_birth" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-6">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-primary text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-primary/90 disabled:opacity-50 transition"
                        >
                          {loading ? "Enregistrement..." : "Sauvegarder"}
                        </button>
                        {message && <p className="text-sm text-green-600">{message}</p>}
                      </div>
                    </Form>
                  </section>
                </div>
          )}
          {currentTab === "plan" && (
                <div className="p-8 md:p-10 mx-auto space-y-8">
                  <div className="flex items-center gap-2 mb-6">
                    <SlidersHorizontal  size={20} className="text-primary" />
                    <h2 className="text-xl font-semibold">plan du compte</h2>
                  </div>
                  <LinkedAccountsSection/>
                </div>
              )}
             {currentTab === "security" && (
              <div className="p-8 md:p-10 mx-auto space-y-8">
                <div className="flex items-center gap-2 mb-6">
                  <Shield size={20} className="text-primary" />
                  <h2 className="text-xl font-semibold">Sécurité du compte</h2>
                </div>

                <Form onSubmit={handlePasswordUpdate}
                schema={userPasswordSchema}
                >

                  <div className="grid grid-cols-1  gap-6">
                    <div className="flex flex-col">
                      <label htmlFor="current_password" className="text-sm font-medium mb-1">Mot de passe actuel</label>
                      <Input id="current_password" name="current_password" type="password" placeholder="********" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="new_password" className="text-sm font-medium mb-1">Nouveau mot de passe</label>
                      <Input id="new_password" name="new_password" type="password" placeholder="********" />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="new_password_confirmation" className="text-sm font-medium mb-1">Confirmer le mot de passe</label>
                      <Input id="new_password_confirmation" name="new_password_confirmation" type="password" placeholder="********" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-primary/90 disabled:opacity-50 transition"
                    >
                      {loading ? "Mise à jour..." : "Modifier le mot de passe"}
                    </button>
                    {message && <p className="text-sm text-green-600">{message}</p>}
                  </div>

                </Form>
              </div>
            )}
      </div>

      

      {/* Popup / Modal pour avatar */}
      {showAvatarModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-200">
            <div className="bg-white  rounded-2xl p-6 md:p-8 shadow-xl w-80 relative animate-fadeIn">
              
              {/* Close button */}
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowAvatarModal(false)}
              >
                <X size={20} />
              </button>

              {/* Modal Title */}
              <div className="flex items-center gap-2 mb-4">
                <Upload size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Changer la photo</h2>
              </div>

              <Form schema={userAvtarProfileSchema} onSubmit={handleUpload}>
                <div className="flex flex-col items-center gap-4">

                  {/* Avatar Preview */}
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border group">
                    <img
                      src={preview || avatarUrl || "/default-avatar.png"}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded-full">
                      <span className="text-white text-sm">Modifier</span>
                    </div>
                  </div>

                  {/* File Input */}
                  <label className="cursor-pointer bg-gray-100 flex-col   hover:bg-gray-200  px-5 py-2 rounded-lg flex items-center gap-2 transition">
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !preview}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-primary/90 disabled:opacity-50 transition"
                  >
                    {loading ? "Téléversement..." : "Enregistrer"}
                  </button>

                </div>
              </Form>
            </div>
          </div>
        )}
    </section>
  )
}
