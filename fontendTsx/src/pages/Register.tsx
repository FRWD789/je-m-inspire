import React, { useState } from 'react'
import InputWithLabel from '../components/InputWithLabel'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '../schema/auth'
import { AxiosError } from 'axios'

function Register() {
  const { register_user } = useAuth()
 const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange', // validate on input change
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      const userData: RegisterInput = {
        email: data.email,
        name: data.name, // <-- use data.name instead of email
        password: data.password,
        password_confirmation: data.password_confirmation,
      }

      await register_user(userData)
      console.log('User added successfully')
    } catch (error) {
        if(error instanceof AxiosError){
                if(error?.status === 422){
                    setError('email', { message: 'Cet email est déjà utilisé.' })
                    setServerError('Un compte existe déjà avec cette adresse e-mail.')
                }
        }else{
             setServerError('Échec de connexion. Veuillez réessayer.')

        }
      
    }
  }

  return (
    <section className="flex relative h-screen w-full items-center">
      {/* Logo */}
      <img
        src="/assets/img/logo.png"
        alt="Logo"
        className="absolute top-4 left-2 w-24"
      />

      {/* Form Section */}
      <div className="sm:w-1/2 w-full h-full grid px-5 sm:px-28 items-center">
        <div className="grid gap-8">
          {/* Heading */}
          <div className="grid justify-center gap-4 text-center">
            <h1 className="text-3xl font-bold">Bonjour!</h1>
            <h3 className="text-gray-600">
              Pour créer votre compte, renseignez votre adresse e-mail et choisissez un mot de passe
            </h3>
          </div>

          {/* Form */}
          <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <InputWithLabel
                errors={errors}
                type="email"
                label="Email"
                register={register}
                name="email"
              />
              <InputWithLabel
                errors={errors}
                type="text"
                label="Nom"
                register={register}
                name="name"
              />
              <InputWithLabel
                errors={errors}
                type="password"
                label="Mot de Passe"
                register={register}
                name="password"
              />
              <InputWithLabel
                errors={errors}
                type="password"
                label="Confirmer le Mot de Passe"
                register={register}
                name="password_confirmation"
              />
            </div>

            <Button
              type="submit"
              disabled={!isValid}
              isLoading={isSubmitting}
            >
              Créer le compte
            </Button>
              {/* Error Section */}
            {serverError && (
              <p className="text-red-600 text-sm font-medium text-center">
                {serverError}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Hero Image */}
      <div className="hidden sm:block flex-1 h-full w-full">
        <img
          src="/assets/img/bg-hero.avif"
          alt="hero-bg"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  )
}

export default Register
