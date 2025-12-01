// ForgotPasswordPage.tsx
import { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormFiled from '@/components/utils/form/formFiled';
import { z } from 'zod';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Form from '@/components/form';
import { authService } from '../service/authService';

const ForgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required'),
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await authService.senResetLink(data)
      setSuccessMessage('Password reset link sent to your email');
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error :any) {
      setErrorMessage('An error occurred. Please try again.');
      console.error('Forgot password error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {t('auth.forgotPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.forgotPasswordDescription')}
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        <Form
          schema={ForgotPasswordSchema}
          onSubmit={handleForgotPassword}
        >
          <FormFiled htmlFor='email' label={t('auth.email')} >
            <Input
              name="email"
              type="email"
              placeholder="example@email.com"
              disabled={isLoading}
            />
          </FormFiled>

          <Button
            type="submit"
            isLoading={isLoading}
            loadingText={t('auth.sending')}
          >
            {t('auth.sendResetLink')}
          </Button>
        </Form>

        <div className="text-center">
          <a
            href="/login"
            className="text-accent hover:text-primary font-medium"
          >
            {t('auth.backToLogin')}
          </a>
        </div>
      </div>
    </div>
  );
}