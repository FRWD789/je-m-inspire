import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useAuth } from "@/context/AuthContext"
import useApi from "@/hooks/useApi"

// Account schema
const accountSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom de famille doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
})

// Password schema
const passwordSchema = z.object({
  current_password: z.string().min(6, "Le mot de passe actuel est requis"),
  new_password: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
  new_password_confirmation: z.string().min(6),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["new_password_confirmation"],
})

type AccountFormData = z.infer<typeof accountSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export function PasswordChange() {
  const { user, updateUser } = useAuth()
  const { privateApi } = useApi()
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Account form
  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    formState: { errors: accountErrors, isSubmitting: isSubmittingAccount },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  })

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmitAccount = async (data: AccountFormData) => {
    setAccountSuccess(null)
    setAccountError(null)
    try {
      const response = await privateApi.put("/user/profile", data)
      updateUser(response.data)
      setAccountSuccess("Profil mis à jour avec succès")
    } catch (error: any) {
      setAccountError(error.response?.data?.message || "Erreur lors de la mise à jour")
    }
  }

  const onSubmitPassword = async (data: PasswordFormData) => {
    setPasswordSuccess(null)
    setPasswordError(null)
    try {
      await privateApi.put("/api/user/password", data)
      setPasswordSuccess("Mot de passe modifié avec succès. Vous allez être déconnecté.")
      resetPassword()
      // Logout after 2 seconds
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || "Erreur lors du changement de mot de passe")
    }
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="password">Mot de passe</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
              <CardDescription>
                Modifiez vos informations personnelles. Cliquez sur enregistrer pour valider.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitAccount(onSubmitAccount)}>
              <CardContent className="space-y-4">
                {accountSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {accountSuccess}
                  </div>
                )}
                {accountError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {accountError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Prénom</Label>
                  <Input
                    id="name"
                    {...registerAccount("name")}
                    placeholder="Jean"
                  />
                  {accountErrors.name && (
                    <p className="text-red-500 text-sm">{accountErrors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    {...registerAccount("last_name")}
                    placeholder="Dupont"
                  />
                  {accountErrors.last_name && (
                    <p className="text-red-500 text-sm">{accountErrors.last_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerAccount("email")}
                    placeholder="jean.dupont@example.com"
                  />
                  {accountErrors.email && (
                    <p className="text-red-500 text-sm">{accountErrors.email.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmittingAccount}>
                  {isSubmittingAccount ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>
                Modifiez votre mot de passe. Vous serez déconnecté après validation.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
              <CardContent className="space-y-4">
                {passwordSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="current_password">Mot de passe actuel</Label>
                  <Input
                    id="current_password"
                    type="password"
                    {...registerPassword("current_password")}
                  />
                  {passwordErrors.current_password && (
                    <p className="text-red-500 text-sm">{passwordErrors.current_password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">Nouveau mot de passe</Label>
                  <Input
                    id="new_password"
                    type="password"
                    {...registerPassword("new_password")}
                  />
                  {passwordErrors.new_password && (
                    <p className="text-red-500 text-sm">{passwordErrors.new_password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password_confirmation">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="new_password_confirmation"
                    type="password"
                    {...registerPassword("new_password_confirmation")}
                  />
                  {passwordErrors.new_password_confirmation && (
                    <p className="text-red-500 text-sm">{passwordErrors.new_password_confirmation.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmittingPassword}>
                  {isSubmittingPassword ? "Modification..." : "Modifier le mot de passe"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}