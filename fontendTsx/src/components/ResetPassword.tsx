import React, { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Button from "../components/Button"
import InputWithLabel from "../components/InputWithLabel"
import authService from "../service/authService"


// Zod schema for password reset
const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    password_confirmation: z.string().min(6, "La confirmation doit contenir au moins 6 caractères"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"],
  })

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token || !email) {
  
      return
    }

    try {
      await authService.resetPassword({
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
  
      reset()
      setTimeout(() => navigate("/login"), 2000)
    } catch (err: any) {

    }
  }

  return (
    <section className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Réinitialiser le mot de passe</h2>
        <p className="text-gray-600 text-center mb-6">
          Entrez votre nouveau mot de passe et confirmez-le pour réinitialiser votre compte.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <InputWithLabel
            type="password"
            label="Nouveau mot de passe"
            register={register}
            name="password"

            errors={errors}
            required
          />
          <InputWithLabel
            type="password"
            label="Confirmer le mot de passe"
            register={register}
            name="password_confirmation"
            errors={errors}
            required
          />

          <Button type="submit" disabled={!isValid || isSubmitting} isLoading={isSubmitting}>
            Réinitialiser le mot de passe
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Retour à la page de connexion ?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Se connecter
          </span>
        </p>
      </div>
    </section>
  )
}
