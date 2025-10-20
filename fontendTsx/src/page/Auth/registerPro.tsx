import FormFiled from '../../components/utils/form/formFiled'
import Input from '../../components/ui/input'
import { z } from "zod";
import Form from '../../components/form';
import { useAuth } from '../../context/AuthContext';
import TextArea from '@/components/ui/textArea';
import { Navigate, useNavigate } from 'react-router-dom';

export const registerSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name must not exceed 255 characters"),

  last_name: z.string()
    .min(1, "Last name is required")
    .max(255, "Last name must not exceed 255 characters"),

  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email must not exceed 255 characters"),

  date_of_birth: z.string()
    .refine(
      (val) => !isNaN(Date.parse(val)) && new Date(val) < new Date(),
      { message: "Date of birth must be a valid date before today" }
    ),

  city: z.string()
    .max(255, "City must not exceed 255 characters")
    .optional()
    .nullable(),

  password: z.string()
    .min(6, "Password must be at least 6 characters long"),

  password_confirmation: z.string()
    .min(6, "Password confirmation must be at least 6 characters long"),

  motivation_letter: z.string()
    .min(50, "Motivation letter must be at least 50 characters")
    .max(2000, "Motivation letter must not exceed 2000 characters"),

  profile_picture: z
    .any()
    .optional()
    .refine(
      (file) => {
        // ✅ No file uploaded (undefined, empty string, or empty FileList)
        if (
          !file ||
          file === "" ||
          (file instanceof FileList && file.length === 0)
        ) {
          return true;
        }

        // ✅ If we have a FileList, grab the first file
        const candidate = file instanceof FileList ? file[0] : file;

        // ✅ Validate file size (5MB)
        if (candidate.size > 5 * 1024 * 1024) {
          return false;
        }

        // ✅ Validate file type
        return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(candidate.type);
      },
      {
        message: "Profile picture must be a valid image (JPEG, PNG, GIF, WebP) under 5MB"
      }
    )
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});

export default function RegisterPro() {
  const navigate = useNavigate();
  const { registerPro, isAuthenticated } = useAuth(); // 👈 AJOUT isAuthenticated

  // 👇 AJOUT : Redirection si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleRegister = async (data: any) => {
    try {
      const formData = new FormData();
      
      // Ajouter tous les champs texte
      Object.keys(data).forEach(key => {
        if (key === 'profile_picture' && data[key] instanceof FileList) {
          if (data[key].length > 0) {
            formData.append(key, data[key][0]);
          }
        } else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      await registerPro(data);
      alert('Demande d\'inscription envoyée ! Vous recevrez un email une fois approuvé.');
      navigate('/'); // 👈 Redirige vers /
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'inscription professionnelle');
    }
  };

  return (
    <section className='w-full min-h-full flex flex-col flex-1 justify-center items-center py-8'>
      <div className='max-w-2xl grid gap-y-[32px]'>
        <div className='text-center'>
          <h1>Inscription Professionnelle</h1>
          <p>Rejoignez notre communauté de professionnels du bien-être</p>
        </div>
        <div>
          <Form schema={registerSchema} onSubmit={handleRegister}>
            <div className='grid grid-cols-2 gap-x-[8px]'>
              <FormFiled label='Prénom'>
                <Input name='name' />
              </FormFiled>
              <FormFiled label='Nom'>
                <Input name='last_name' />
              </FormFiled>
            </div>
            <FormFiled label='Ville'>
              <Input name='city' />
            </FormFiled>
            <FormFiled label='Date de naissance'>
              <Input name='date_of_birth' type='date' />
            </FormFiled>
            <FormFiled label='Email'>
              <Input name='email' />
            </FormFiled>
            <FormFiled label='Mot de passe'>
              <Input name='password' type='password' />
            </FormFiled>
            <FormFiled label='Confirmer le mot de passe'>
              <Input name='password_confirmation' type='password' />
            </FormFiled>
            <FormFiled label='Lettre de motivation (50-2000 caractères)'>
              <TextArea name='motivation_letter' rows={6} />
            </FormFiled>
            <FormFiled label='Photo de profil (optionnel)'>
              <Input name='profile_picture' type='file' accept='image/*' />
            </FormFiled>
            <button type='submit' className='px-[4px] py-[8px] bg-text text-background'>
              Envoyer ma demande
            </button>
          </Form>
        </div>
      </div>
    </section>
  )
}