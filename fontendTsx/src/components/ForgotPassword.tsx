import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import Button from "../components/Button"
import InputWithLabel from "./Input"
import authService from "../service/authService"
import { z } from "zod"
import FormField from "./FormField"
import Input from "./Input"

// Zod schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
})

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const res = await authService.forgotPassword(data.email)
      alert(res.message || "Lien de réinitialisation envoyé ! Vérifiez votre email.") // or toast
      reset()
    } catch (err: any) {
      alert(err.response?.data?.message || "Échec de l'envoi du lien de réinitialisation.") // or toast
    }
  }

  return (
    <section className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Mot de passe oublié</h2>
        <p className="text-gray-600 text-center mb-6">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <FormField   label="Email" error={errors.email}>
            <Input
            type="email"
          
            register={register}
            name="email"
            errors={errors}
            // placeholder="votre.email@exemple.com"
            required
          />

          </FormField>
          

          <Button type="submit" disabled={!isValid || isSubmitting} isLoading={isSubmitting}>
            Envoyer le lien
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Retour à la page de connexion ?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </section>
  )
}
