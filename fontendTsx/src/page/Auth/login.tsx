import Form from '../../components/form'
import z from 'zod'
import FormFiled from '../../components/utils/form/formFiled';
import Input from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function Login() {
    const location = useLocation()
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth() // 👈 AJOUT isAuthenticated
    
    // 👇 AJOUT : Redirection si déjà connecté
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    
    // Récupérer l'URL d'où vient l'utilisateur, sinon rediriger vers /
    const from = location.state?.from?.pathname || "/";
    
    const handelLogin = async (data: any) => {
        try {
            await login(data)
            navigate(from, { replace: true }) // 👈 Redirige vers / ou l'URL d'origine
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <section className='w-full min-h-full flex flex-col flex-1 justify-center items-center'>
            <div className='max-w-xl grid gap-y-[32px]'>
                <div className='text-center'>
                    <h1>Welcome Back</h1>
                    <p>Login to your Je m'inspire account</p>
                </div>
                <div>
                    <Form schema={LoginSchema} onSubmit={handelLogin}>
                        <FormFiled label='Email'>
                            <Input name='email' />
                        </FormFiled>
                        <FormFiled label='Password'>
                            <Input name='password' type='password' />
                        </FormFiled>
                        <button className='px-[4px] py-[8px] bg-text text-background'>
                            Login
                        </button>
                    </Form>
                </div>
            </div>
        </section>
    )
}