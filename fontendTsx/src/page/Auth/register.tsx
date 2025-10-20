import FormFiled from '../../components/utils/form/formFiled'
import Input from '../../components/ui/input'
import Select from '../../components/ui/select'
import { z } from "zod";
import Form from '../../components/form';
import { useAuth } from '../../context/AuthContext';
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

  role: z.enum(["utilisateur", "professionnel"], {
    errorMap: () => ({ message: "Please select a valid role" })
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});

export default function Register() {
  const navigate = useNavigate();
  const { registerUser, isAuthenticated } = useAuth(); // 👈 AJOUT isAuthenticated

  // 👇 AJOUT : Redirection si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const options = [
    { description: "Utilisateur", value: "utilisateur" },
    { description: "Professionnel", value: "professionnel" }
  ];

  const handleRegister = async (data: any) => {
    try {
      await registerUser(data);
      alert('Inscription réussie !');
      navigate('/'); // 👈 Redirige vers /
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'inscription');
    }
  };

  return (
    <section className='w-full min-h-full flex flex-col flex-1 justify-center items-center'>
      <div className='max-w-xl grid gap-y-[32px]'>
        <div className='text-center'>
          <h1>Create Account</h1>
          <p>Join Je m'inspire community</p>
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
            <FormFiled label='Role'>
              <Select name='role' options={options} />
            </FormFiled>
            <FormFiled label='Password'>
              <Input name='password' type='password' />
            </FormFiled>
            <FormFiled label='Confirm Password'>
              <Input name='password_confirmation' type='password' />
            </FormFiled>
            <button type='submit' className='px-[4px] py-[8px] bg-text text-background'>
              Register
            </button>
          </Form>
        </div>
      </div>
    </section>
  )
}