import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { loginSchema, type LoginInput } from '../schema/auth'
import InputWithLabel from '../components/InputWithLabel'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import type { LoginCredentials } from '../types/auth'

function Login() {
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // validate on input change
  })

  const onSubmit = async (data: LoginInput) => {
    try {

        const credentials: LoginCredentials = {
      email: data.email,
      password: data.password
    };
      await login(credentials)
      console.log('Logged in successfully')
    } catch (error) {
      console.error('Login failed', error)
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
              Pour vous connecter à votre compte, renseignez votre adresse e-mail ainsi que votre mot de passe.
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
                type="password"
                label="Mot de Passe"
                register={register}
                name="password"
              />
            </div>

            <Button
              type="submit"
              disabled={!isValid}
              isLoading={isSubmitting}
            >
              Se connecter
            </Button>
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

export default Login
