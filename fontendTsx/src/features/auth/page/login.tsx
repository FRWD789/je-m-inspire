import Form from '@/components/form'
import z from 'zod'
import FormFiled from '@/components/utils/form/formFiled';
import Input from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/button';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import { useTranslation } from 'react-i18next';

import { useState } from 'react';



export default function Login() {
    const { t } = useTranslation();
    const location = useLocation()
    const navigate = useNavigate()
    const [errorMessage, setErrorMessage] = useState('');

    const [isSubmitting,setIsSubmitting] = useState(false)
    const from = location.state?.from?.pathname || "/";
    const { login } = useAuth()

    const handelLogin = async (data: any) => {
        try {
            setIsSubmitting(true)
            await login(data)
            navigate(from, { replace: true })
            window.location.reload() 
        } catch (error) {
            console.log(error)
             setErrorMessage('An error occurred. Please try again.');
        }finally{
             setIsSubmitting(false)
        }
    }

    const LoginSchema = z.object({
        email: z.string().min(1, { message: t('validation.required') }),
        password: z.string().min(6, { message: t('validation.minLength', { count: 6 }) }),
    });

    const handleGoogleError = (error: any) => {
        // Gérer l'erreur personnalisée
        console.error('Google login failed:', error);
        // Afficher un toast ou message d'erreur
    };

    return (
        <section className='w-full min-h-full flex flex-col flex-1 justify-center items-center'>
            <div className='max-w-xl grid gap-y-8 w-full px-4'>
                <div className='text-center'>
                    <h1>{t('auth.loginTitle')}</h1>
                    <p>{t('auth.loginSubtitle')}</p>
                </div>

                <div className='space-y-6'>
                    {/* ✅ Google Login Button */}
                    <GoogleLoginButton onError={handleGoogleError} />

                    {/* Divider */}
                    <div className="relative my-6">
                        {/* Divider line */}
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>

                        {/* Centered text */}
                        <div className="relative flex justify-center z-10">
                            <span className="px-2 backdrop-blur-3xl text-accent text-sm">
                            {t('auth.middleText')}
                            </span>
                        </div>
                    </div>
                     {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {errorMessage}
                        </div>
                        )}

                    {/* Email/Password Form */}
                    <Form schema={LoginSchema} onSubmit={handelLogin}>
                        <FormFiled htmlFor='email' label={t('auth.email')}>
                            <Input name='email' />
                        </FormFiled>
                        <FormFiled htmlFor='password' label={t('auth.password')}>
                            <Input name='password' type='password' />
                        </FormFiled>
                        <Button loadingText='connecting...' isLoading={isSubmitting}  type='submit'>{t('auth.loginButton')}</Button>
                    </Form>

                    <small className='hover:underline cursor-pointer text-primary hover:text-accent block text-center'>
                        
                        <Link to={"/register"}>{t('auth.noAccount')}{' '}{t('auth.createAccount')}</Link>
                    </small>
                </div>
            </div>
        </section>
    )
}