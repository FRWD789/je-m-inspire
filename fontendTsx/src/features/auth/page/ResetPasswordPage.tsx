// ResetPasswordPage.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormFiled from '@/components/utils/form/formFiled';
import { z } from 'zod';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Form from '@/components/form';
import { authService } from '../service/authService';

const ResetPasswordSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(8, 'Password confirmation is required'),
  token: z.string().min(1, 'Invalid reset token'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Validate that token and email are present
  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Invalid reset link. Please request a new password reset.
          </div>
          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-accent hover:text-primary font-medium"
            >
              {t('auth.backToForgotPassword')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleResetPassword = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await authService.resetPassword(data);
      setSuccessMessage('Password reset successfully! Redirecting to login...');
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      const message = error.response?.data?.message || 'An error occurred. Please try again.';
      setErrorMessage(message);
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {t('auth.resetPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.resetPasswordDescription')}
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
          schema={ResetPasswordSchema}
          onSubmit={handleResetPassword}
          defaultValues={{
            email: email || '',
            password: '',
            password_confirmation: '',
            token: token || '',
          }}
        >
          <FormFiled htmlFor='email' label={t('auth.email')}>
            <Input
              name="email"
              type="email"
              placeholder="example@email.com"
              disabled={true}
              readOnly
            />
          </FormFiled>

          <FormFiled  htmlFor='password' label={t('auth.newPassword')}>
            <Input
              name="password"
              type="password"
              placeholder={t('auth.enterNewPassword')}
              disabled={isLoading}
            />
          </FormFiled>

          <FormFiled label={t('auth.confirmPassword')}>
            <Input
              name="password_confirmation"
              type="password"
              placeholder={t('auth.confirmNewPassword')}
              disabled={isLoading}
            />
          </FormFiled>

          <Button
            type="submit"
            isLoading={isLoading}
            loadingText={t('auth.resetting')}
          >
            {t('auth.resetPassword')}
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