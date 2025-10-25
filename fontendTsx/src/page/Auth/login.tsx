import Form from '../../components/form'
import z from 'zod'
import FormFiled from '../../components/utils/form/formFiled';
import Input from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ReCaptcha from '../../components/common/ReCaptcha';
import { useState } from 'react';

// Déclaration du type global pour grecaptcha
declare global {
    interface Window {
        grecaptcha?: {
            reset: (widgetId?: number) => void;
        };
    }
}

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// Type pour les données du formulaire
type LoginFormData = z.infer<typeof LoginSchema>;

export default function Login() {
    const location = useLocation()
    const navigate = useNavigate()
    const from = location.state?.from?.pathname || "/dashboard/profile"; 
    const { login } = useAuth()
    
    // États pour gérer le reCAPTCHA
    const [recaptchaToken, setRecaptchaToken] = useState<string>('');
    const [error, setError] = useState<string>('');
    
    const handelLogin = async (data: LoginFormData) => {
        // Vérifier que reCAPTCHA est validé
        if (!recaptchaToken) {
            setError('Veuillez valider le reCAPTCHA');
            return;
        }

        try {
            // Passer le token reCAPTCHA au login
            await login({ ...data, recaptchaToken });
            navigate(from, { replace: true });
        } catch(error) {
            console.error('Erreur de connexion:', error);
            setError('Erreur de connexion');
            
            // Réinitialiser le reCAPTCHA en cas d'erreur
            setRecaptchaToken('');
            if (window.grecaptcha) {
                try {
                    window.grecaptcha.reset();
                } catch (e) {
                    console.error('Erreur lors du reset du reCAPTCHA:', e);
                }
            }
        }
    }

    // Handlers pour reCAPTCHA
    const handleRecaptchaVerify = (token: string): void => {
        setRecaptchaToken(token);
        setError('');
    };

    const handleRecaptchaExpired = (): void => {
        setRecaptchaToken('');
        setError('reCAPTCHA expiré, veuillez revalider');
    };

    const handleRecaptchaError = (): void => {
        setRecaptchaToken('');
        setError('Erreur reCAPTCHA, veuillez recharger la page');
    };

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
                        
                        {/* Message d'erreur */}
                        {error && (
                            <div className='text-red-600 bg-red-50 p-3 rounded mb-4 text-sm text-center'>
                                {error}
                            </div>
                        )}
                        
                        {/* Composant reCAPTCHA */}
                        <div className='mb-4'>
                            <ReCaptcha 
                                onVerify={handleRecaptchaVerify}
                                onExpired={handleRecaptchaExpired}
                                onError={handleRecaptchaError}
                            />
                        </div>
                        
                        <button 
                            type='submit'
                            className='px-[4px] py-[8px] bg-text text-background w-full disabled:opacity-50 disabled:cursor-not-allowed'
                            disabled={!recaptchaToken}
                        >
                            Login
                        </button>
                    </Form>
                </div>
            </div>
        </section>
    )
}