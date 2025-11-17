

import FormFiled from '../../components/utils/form/formFiled'
import Input from '../../components/ui/input'
import { z } from "zod";
import Form from '../../components/form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TextArea from '@/components/ui/textArea';
import Button from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

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

      // ✅ Validate type & size
      return (
        candidate instanceof File &&
        ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp", "image/avif"].includes(candidate.type) &&
        candidate.size <= 2 * 1024 * 1024
      );
    },
    { message: "Profile picture must be a valid image under 2MB" }
  ),

})
.superRefine(({ password, password_confirmation }, ctx) => {
  if (password !== password_confirmation) {
    ctx.addIssue({
      path: ["password_confirmation"],
      code: "custom",
      message: "Password confirmation does not match",
    });
  }
})


export default function RegisterPro() {

  const {registerPro}= useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/login";
  const { t } = useTranslation();

  const handelRegister = async (data: any) => {
      try {
          await registerPro(data)
          navigate(from, { replace: true })
          
      } catch (error) {
          console.log(error)
      }
  }
   

  return (
    <section className='w-full h-auto grid justify-center items-center  px-[16px] gap-y-[32px]'>
      <div className='max-w-xl grid gap-y-[32px]'>
        <div className='text-center'>
          <h1>{t('auth.registerProTitle')}</h1>
          <p>{t('auth.registerProSubtitle')}</p>
        </div>
        <div>
           <Form schema={registerSchema} onSubmit={handelRegister}>
          {/* Name Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <FormFiled label={t('auth.firstName')}>
              <Input name='name' />
            </FormFiled>
            <FormFiled label={t('auth.lastName')}>
              <Input name='last_name' />
            </FormFiled>
          </div>

          {/* City & Date of Birth */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <FormFiled label={t('auth.city')}>
              <Input name='city' />
            </FormFiled>
            <FormFiled label={t('auth.dateOfBirth')}>
              <Input name='date_of_birth' type='date' />
            </FormFiled>
          </div>

          {/* Email */}
          <FormFiled label={t('auth.email')} className='mb-4'>
            <Input name='email' type='email' />
          </FormFiled>

          {/* Password Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <FormFiled label={t('auth.password')}>
              <Input name='password' type='password' />
            </FormFiled>
            <FormFiled label={t('auth.passwordConfirmation')}>
              <Input name='password_confirmation' type='password' />
            </FormFiled>
          </div>

          {/* Motivation Letter */}
          <FormFiled label={t('auth.motivationLetter')} className='mb-6'>
            <TextArea name='motivation_letter' rows={6} />
          </FormFiled>

          {/* Submit Button */}
          <Button type='submit'
          >
            {t('auth.registerButton')}
          </Button>
          </Form>
        </div>
      </div>
    </section>
  )
}
