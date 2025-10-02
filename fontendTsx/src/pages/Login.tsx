import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { loginSchema, type LoginInput } from '../schema/auth'
import InputWithLabel from '../components/Input'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import type { LoginCredentials } from '../types/auth'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import FormField from '@/components/FormField'
import Input from '../components/Input'
import { treeifyError } from 'zod'
// import { toast } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'

function Login() {
  const location = useLocation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const from = location.state?.from?.pathname || "/"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
      }

      await login(credentials)
      // toast.success('Connexion réussie !')
      navigate(from,{replace:true})
    } catch (error: any) {
      // toast.error(
      //   error?.response?.data?.message || 'Échec de la connexion. Veuillez réessayer.'
      // )
      console.error('Login failed', error)
    }
  }

  return (
    <section className="flex flex-col sm:flex-row h-screen w-full">
      {/* Logo */}
      <img
        src="/assets/img/logo.png"
        alt="Logo"
        className="absolute top-4 left-2 w-24 sm:w-28"
      />

      {/* Form Section */}
      <div className="sm:w-1/2 w-full h-full flex flex-col justify-center px-5 sm:px-28">
        <div className="max-w-md mx-auto grid gap-8">
          {/* Heading */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Bonjour !</h1>
            <p className="mt-2 text-gray-600">
              Connectez-vous à votre compte en utilisant votre e-mail et votre mot de passe.
            </p>
          </div>

          {/* Form */}
          <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)}>

            <FormField    label="Email" error={errors.email}>
                   <Input
              errors={errors}
              type="email"
           
              register={register}
              name="email"
              // placeholder="votre.email@exemple.com"
              required
            />

            </FormField>
            <FormField     label="Mot de passe" error={errors.password}>
            <Input
                errors={errors}
                type="password"
               
                register={register}
                name="password"
                // placeholder="••••••••"
                required
              />
            </FormField>
            <div className="flex justify-between items-center text-sm">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
              className="w-full"
            >
              Se connecter
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-4">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>

      {/* Hero Image */}
      <div className="hidden sm:block flex-1 h-full w-full">
        <img
          src="/assets/img/bg-hero.avif"
          alt="Illustration d'accueil"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  )
}

export default Login
