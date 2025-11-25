import React, { use, useEffect, useState, useRef } from "react"
import axios from "axios"
import { ImageUp, Settings, Shield, SlidersHorizontal, Upload, User2, X } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { useSearchParams, useNavigate } from "react-router-dom"
import Form from "@/components/form"
import { userAvtarProfileSchema, userPasswordSchema, userProfileSchema, type UserAvtarProfileFormType, type UserPasswordFormType, type UserProfileFormType } from "@/schema/userSchema"
import Input from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import LinkedAccountsSection from "./LinkedAccountsSection"
import TextArea from "@/components/ui/textArea"

export default function User() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);

  const [currentTab, setCurrentTab] = useState<"profile" | "security" | "plan">("profile");
  const {updateProfile,updateProfileImg,updatePassword,user} = useAuth()
  const [defaultValues,setDefaultValues] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | undefined>(user?.profile.profile_picture)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  
  // ✅ Écouter les changements d'URL pour mettre à jour le tab
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as "profile" | "security" | "plan" | null;
    
    if (tabFromUrl && ["profile", "security", "plan"].includes(tabFromUrl)) {
      console.log('🔄 Changement de tab depuis URL:', tabFromUrl);
      setCurrentTab(tabFromUrl);
      
      // Scroll vers le haut avec animation douce
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (!tabFromUrl) {
      // Si pas de paramètre tab, on affiche "profile" par défaut
      setCurrentTab("profile");
    }
  }, [searchParams]);

  // ✅ Fonction pour changer de tab ET mettre à jour l'URL
  const handleTabChange = (tab: "profile" | "security" | "plan") => {
    console.log('👆 Clic sur tab:', tab);
    
    // Mettre à jour l'URL avec le nouveau tab
    if (tab === "profile") {
      // Pour profile, on enlève le paramètre (comportement par défaut)
      setSearchParams({});
    } else {
      // Pour security et plan, on ajoute le paramètre
      setSearchParams({ tab });
    }
    
    // Le useEffect ci-dessus va gérer le changement de currentTab
  };

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
      setPreview("/src/assets/default-avatar.png");
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
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      setAvatarUrl(`${baseUrl}/storage/${res.profile_picture}`);
      setPreview(null);
      console.log(user)
      setMessage(t('profile.updateSuccess'))
    } catch {
      setMessage(t('profile.updateError'))
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (data: UserPasswordFormType) => {
    setLoading(true)
    setMessage(null)
    try {
      updatePassword(data)
      setMessage(t('profile.passwordUpdateSuccess'))
    } catch (err: any) {
      setMessage(t('profile.passwordUpdateError'))
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
      setMessage(t('profile.updateSuccess'))
    } catch {
      setMessage(t('profile.updateError'))
    } finally {
      setLoading(false)
    }
  }

  const tabs = ["profile", "security"];
  if (user.roles[0].role === "professionnel") tabs.push("plan");

  if (!user) return <p>{t('common.loading')}</p>;

  return (
    <section className="grid gap-y-4 md:gap-y-8 w-full" ref={topRef}>
      <div className="grid gap-y-2">
        <h1 className="text-xl md:text-2xl font-semibold flex gap-2 items-center">
          <Settings className="w-5 h-5 md:w-6 md:h-6" /> {t('dashboard.profileSettings')}
        </h1>
        
        {/* Tabs - Responsive - AVEC MISE À JOUR DE L'URL */}
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                currentTab === tab
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => handleTabChange(tab as "profile" | "security" | "plan")}
            >
              {tab === 'profile' && t('profile.title')}
              {tab === 'security' && t('profile.security')}
              {tab === 'plan' && t('profile.plan')}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu principal avec animation de transition */}
      <div className="rounded-lg animate-fadeIn">
        
        {currentTab === "profile" && ( 
          <div className="p-4 space-y-6 md:space-y-10">

            {/* ===== Avatar Section ===== */}
            <section className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-4">
                <ImageUp size={20} className="text-primary flex-shrink-0" />
                <h2 className="text-lg md:text-xl font-semibold">{t('profile.profilePicture')}</h2>
              </div>

              <div className="flex flex-col items-start gap-4">
                <div
                  className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 cursor-pointer group flex-shrink-0"
                  onClick={() => setShowAvatarModal(true)}
                >
                  <img
                    src={preview || avatarUrl || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded-full">
                    <span className="text-white text-xs md:text-sm font-medium">{t('profile.changePicture')}</span>
                  </div>
                </div>
                <p 
                  className="text-sm md:text-base text-accent hover:text-primary transition cursor-pointer" 
                  onClick={() => setShowAvatarModal(true)}
                >
                  {t('profile.changePicture')}
                </p>
              </div>
            </section>

            {/* ===== User Info Form ===== */}
            <section className="border-t border-gray-200 pt-6 md:pt-8">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <User2 size={20} className="text-primary flex-shrink-0" />
                <h2 className="text-lg md:text-xl font-semibold">{t('profile.personalInfo')}</h2>
              </div>

              <Form defaultValues={defaultValues} schema={userProfileSchema} onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  
                  <div className="flex flex-col col-span-1 md:col-span-2">
                    <label htmlFor="biography" className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">{t('profile.biography')}</label>
                    <textarea id="biography" name="biography" className='border-[1px] px-2 py-[4px] rounded-[4px] focus:outline-0' placeholder= {t('profile.biographyPlaceholder')} rows={4} />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="name" className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">{t('profile.firstName')}</label>
                    <Input id="name" type="text" name="name" placeholder={t('auth.firstNamePlaceholder')} />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="last_name" className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">{t('profile.lastName')}</label>
                    <Input id="last_name" type="text" name="last_name" placeholder={t('auth.lastNamePlaceholder')} />
                  </div>

                  <div className="flex flex-col col-span-1 md:col-span-2">
                    <label htmlFor="email" className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">{t('profile.email')}</label>
                    <Input id="email" type="email" name="email" placeholder={t('auth.emailPlaceholder')} />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="city" className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">{t('profile.city')}</label>
                    <Input id="city" type="text" name="city" placeholder={t('auth.cityPlaceholder')} />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="date_of_birth" className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">{t('profile.dateOfBirth')}</label>
                    <Input id="date_of_birth" type="date" name="date_of_birth" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 mt-6 md:mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-primary text-white px-4 md:px-6 py-2 rounded-lg font-medium shadow hover:bg-primary/90 disabled:opacity-50 transition text-sm md:text-base"
                  >
                    {loading ? t('common.loading') : t('profile.saveChanges')}
                  </button>
                  {message && <p className="text-xs md:text-sm text-green-600">{message}</p>}
                </div>
              </Form>
            </section>
          </div>
        )}

        {currentTab === "plan" && (
          <div className="p-4 md:p-8 lg:p-10 mx-auto space-y-6 md:space-y-8 max-w-4xl">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <SlidersHorizontal size={20} className="text-primary flex-shrink-0" />
              <h2 className="text-lg md:text-xl font-semibold">{t('profile.accountPlan')}</h2>
            </div>
            <LinkedAccountsSection />
          </div>
        )}

        {currentTab === "security" && (
          <div className="p-4 md:p-8 lg:p-10 mx-auto space-y-6 md:space-y-8 max-w-4xl">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Shield size={20} className="text-primary flex-shrink-0" />
              <h2 className="text-lg md:text-xl font-semibold">{t('profile.accountSecurity')}</h2>
            </div>

            <Form
              onSubmit={handlePasswordUpdate}
              schema={userPasswordSchema}
            >
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                
                <div className="flex flex-col">
                  <label htmlFor="current_password" className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">{t('profile.currentPassword')}</label>
                  <Input id="current_password" name="current_password" type="password" placeholder="********" />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="new_password" className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">{t('profile.newPassword')}</label>
                  <Input id="new_password" name="new_password" type="password" placeholder="********" />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="new_password_confirmation" className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">{t('profile.confirmPassword')}</label>
                  <Input id="new_password_confirmation" name="new_password_confirmation" type="password" placeholder="********" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 mt-6 md:mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-primary text-white px-4 md:px-6 py-2 rounded-lg font-medium shadow hover:bg-primary/90 disabled:opacity-50 transition text-sm md:text-base"
                >
                  {loading ? t('common.loading') : t('profile.changePassword')}
                </button>
                {message && <p className="text-xs md:text-sm text-green-600">{message}</p>}
              </div>
            </Form>
          </div>
        )}
      </div>

      {/* Popup / Modal pour avatar - Responsive */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-200 p-4">
          <div className="bg-white rounded-2xl p-4 md:p-8 shadow-xl w-full max-w-sm relative animate-fadeIn">
            
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
              onClick={() => setShowAvatarModal(false)}
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Upload size={20} className="text-primary flex-shrink-0" />
              <h2 className="text-lg md:text-xl font-semibold">{t('profile.changePicture')}</h2>
            </div>

            <Form schema={userAvtarProfileSchema} onSubmit={handleUpload}>
              <div className="flex flex-col items-center gap-4 md:gap-5">

                {/* Avatar Preview */}
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-gray-200 group flex-shrink-0">
                  <img
                    src={preview || avatarUrl || "/default-avatar.png"}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded-full">
                    <span className="text-white text-xs md:text-sm">{t('profile.changePicture')}</span>
                  </div>
                </div>

                {/* File Input */}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 md:px-5 py-2 md:py-2.5 rounded-lg flex items-center gap-2 transition w-full justify-center text-sm md:text-base font-medium">
                  <Upload size={18} className="flex-shrink-0" /> {t('profile.selectImage')}
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
                  className="w-full bg-primary text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-medium shadow hover:bg-primary/90 disabled:opacity-50 transition text-sm md:text-base"
                >
                  {loading ? t('profile.uploading') : t('common.save')}
                </button>

              </div>
            </Form>
          </div>
        </div>
      )}
    </section>
  )
}