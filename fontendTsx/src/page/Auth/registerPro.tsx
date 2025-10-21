import FormFiled from '../../components/utils/form/formFiled';
import Input from '../../components/ui/input';
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
        if (!file || file === "" || (file instanceof FileList && file.length === 0)) {
          return true;
        }
        const candidate = file instanceof FileList ? file[0] : file;
        return candidate.size <= 2048 * 1024; // 2MB max
      },
      { message: "Profile picture must be less than 2MB" }
    ),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});

export default function RegisterPro() {
  const navigate = useNavigate();
  // ✅ Utilisation correcte du nouveau AuthContext
  const { registerProfessional, isAuthenticated } = useAuth();

  // ✅ Redirection si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (data: any) => {
    try {
      // ✅ Conversion en FormData
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('last_name', data.last_name);
      formData.append('email', data.email);
      formData.append('date_of_birth', data.date_of_birth);
      if (data.city) formData.append('city', data.city);
      formData.append('password', data.password);
      formData.append('password_confirmation', data.password_confirmation);
      formData.append('motivation_letter', data.motivation_letter);
      
      if (data.profile_picture && data.profile_picture instanceof FileList && data.profile_picture.length > 0) {
        formData.append('profile_picture', data.profile_picture[0]);
      }

      const result = await registerProfessional(formData);
      
      console.log('✅ Demande d\'inscription envoyée');
      alert(result.message || 'Votre demande a été envoyée. Un administrateur examinera votre candidature.');
      navigate('/login');
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error);
      alert(error.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <section className='w-full min-h-full flex flex-col flex-1 justify-center items-center py-8'>
      <div className='max-w-2xl w-full grid gap-y-[32px] px-4'>
        <div className='text-center'>
          <h1>Inscription Professionnel</h1>
          <p>Rejoignez Je m'inspire en tant que professionnel</p>
        </div>
        <div>
          <Form schema={registerSchema} onSubmit={handleRegister}>
            <div className='grid grid-cols-2 gap-x-[8px]'>
              <FormFiled label='First Name'>
                <Input name='name' />
              </FormFiled>
              <FormFiled label='Last Name'>
                <Input name='last_name' />
              </FormFiled>
            </div>
            <FormFiled label='City'>
              <Input name='city' />
            </FormFiled>
            <FormFiled label='Date of Birth'>
              <Input name='date_of_birth' type='date' />
            </FormFiled>
            <FormFiled label='Email'>
              <Input name='email' />
            </FormFiled>
            <FormFiled label='Password'>
              <Input name='password' type='password' />
            </FormFiled>
            <FormFiled label='Confirm Password'>
              <Input name='password_confirmation' type='password' />
            </FormFiled>
            <FormFiled label='Motivation Letter'>
              <TextArea name='motivation_letter' rows={6} />
            </FormFiled>
            <FormFiled label='Profile Picture (Optional)'>
              <Input name='profile_picture' type='file' accept='image/*' />
            </FormFiled>
            <button type='submit' className='px-[4px] py-[8px] bg-text text-background w-full'>
              Submit Application
            </button>
          </Form>
        </div>
      </div>
    </section>
  );
}