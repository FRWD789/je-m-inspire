import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterInput } from "../schema/auth"
import { AxiosError } from "axios"
import { useAuth } from "../context/AuthContext"
import FormField from "@/components/FormField"
import Input from "@/components/Input"
import Button from "@/components/Button"
import { Link } from "react-router-dom"
import { api } from "@/api/api"

interface Role {
  id: number
  role: string
  description: string
}

export default function Register() {
  const {register_user } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  })

  // Fetch roles on mount
  const fetchRoles = async () => {
      try {
        const response = await api.get('/roles')
        console.log(response.data)
        setRoles(response.data)
      } catch (error) {
        console.error('Error fetching roles:', error)
        setServerError('Impossible de charger les rôles')
      } finally {
        setLoadingRoles(false)
      }
    }
  useEffect(() => {
    
    fetchRoles()
  }, [])

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null)
    try {
      await register_user(data)
      console.log("User registered successfully")
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const status = error.response?.status
        const validationErrors = error.response?.data?.errors

        if (status === 422 && validationErrors) {
          // Handle Laravel validation errors
          Object.keys(validationErrors).forEach((field) => {
            setError(field as keyof RegisterInput, {
              message: validationErrors[field][0],
            })
          })
          setServerError("Veuillez corriger les erreurs du formulaire.")
        } else if (status === 422) {
          setError("email", { message: "Cet email est déjà utilisé." })
          setServerError("Un compte existe déjà avec cette adresse e-mail.")
        } else {
          setServerError("Échec de l'inscription. Veuillez réessayer.")
        }
      } else {
        setServerError("Échec de l'inscription. Veuillez réessayer.")
      }
    }
  }

  return (
    <section className="flex relative min-h-screen w-full items-center">
      {/* Logo */}
      <Link to="/" className="absolute top-4 left-4 z-10">
        <img
          src="/assets/img/logo.png"
          alt="Logo"
          className="w-24 hover:opacity-80 transition-opacity"
        />
      </Link>

      {/* Form Section */}
      <div className="sm:w-1/2 w-full min-h-screen flex px-5 sm:px-28 items-center py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Créer un compte
            </h1>
            <p className="text-gray-600">
              Remplissez le formulaire pour créer votre compte
            </p>
          </div>

          {/* Global Server Error */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{serverError}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Prénom" error={errors.name}>
                <Input
                  name="name"
                  type="text"
                  register={register}
                  errors={errors}
                  placeholder="Jean"
                />
              </FormField>

              <FormField label="Nom" error={errors.last_name}>
                <Input
                  name="last_name"
                  type="text"
                  register={register}
                  errors={errors}
                  placeholder="Dupont"
                />
              </FormField>
            </div>

            {/* Email */}
            <FormField label="Email" error={errors.email}>
              <Input
                name="email"
                type="email"
                register={register}
                errors={errors}
                placeholder="jean.dupont@example.com"
              />
            </FormField>

            {/* Date of Birth & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Date de naissance" error={errors.date_of_birth}>
                <Input
                  name="date_of_birth"
                  type="date"
                  register={register}
                  errors={errors}
                />
              </FormField>

              <FormField label="Ville (optionnel)" error={errors.city}>
                <Input
                  name="city"
                  type="text"
                  register={register}
                  errors={errors}
                  placeholder="Montréal"
                />
              </FormField>
            </div>

            {/* Role */}
            <FormField label="Rôle" error={errors.role}>
              <select
                {...register('role')}
                disabled={loadingRoles}
                className="w-full flex border-[1px]  items-center justify-between rounded-[2px] px-[8px] py-[6px]"
              >
                <option value="">
                  {loadingRoles ? "Chargement..." : "Sélectionnez un rôle"}
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.role}>
                    {role.description || role.role}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
              )}
            </FormField>

            {/* Password Fields */}
            <FormField label="Mot de passe" error={errors.password}>
              <Input
                name="password"
                type="password"
                register={register}
                errors={errors}
                placeholder="Minimum 6 caractères"
              />
            </FormField>

            <FormField label="Confirmer le mot de passe" error={errors.password_confirmation}>
              <Input
                name="password_confirmation"
                type="password"
                register={register}
                errors={errors}
                placeholder="Confirmez votre mot de passe"
              />
            </FormField>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isValid || isSubmitting || loadingRoles}
              isLoading={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Création en cours..." : "Créer le compte"}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Vous avez déjà un compte?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Hero Image */}
      <div className="hidden sm:block flex-1 h-screen sticky top-0">
        <img
          src="/assets/img/bg-hero.avif"
          alt="Inscription"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  )
}