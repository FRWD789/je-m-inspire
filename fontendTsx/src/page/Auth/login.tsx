import FormFiled from '../../components/utils/form/formFiled';
import Input from '../../components/ui/input';
import { z } from "zod";
import Form from '../../components/form';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

export const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string()
    .min(1, "Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  // ✅ Utilisation correcte du nouveau AuthContext
  const { login, isAuthenticated } = useAuth();

  // ✅ Redirection si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (data: any) => {
    try {
      // ⚠️ IMPORTANT: Le nouveau AuthContext nécessite un recaptchaToken
      // Pour le moment, on passe une string vide (à remplacer par le vrai token)
      await login(data.email, data.password, '');
      
      console.log('✅ Connexion réussie');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      alert(error.message || 'Erreur lors de la connexion');
    }
  };

  return (
    <section className='w-full min-h-full flex flex-col flex-1 justify-center items-center'>
      <div className='max-w-xl grid gap-y-[32px]'>
        <div className='text-center'>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to Je m'inspire</p>
        </div>
        <div>
          <Form schema={loginSchema} onSubmit={handleLogin}>
            <FormFiled label='Email'>
              <Input name='email' type='email' />
            </FormFiled>
            <FormFiled label='Password'>
              <Input name='password' type='password' />
            </FormFiled>
            <button type='submit' className='px-[4px] py-[8px] bg-text text-background w-full'>
              Sign In
            </button>
          </Form>
        </div>
      </div>
    </section>
  );
}