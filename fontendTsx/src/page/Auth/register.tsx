
import React, { use } from 'react'
import FormFiled from '../../components/utils/form/formFiled'
import Input from '../../components/ui/input'
import { z } from "zod";
import Form from '../../components/form';
import Select from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
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
    // Laravel also checks `unique:users`, but that's DB-level, so you’ll handle it separately

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

  role: z.string()
    .min(1, "Role is required"),
})
.superRefine(({ password, password_confirmation }, ctx) => {
  if (password !== password_confirmation) {
    ctx.addIssue({
      path: ["password_confirmation"],
      code: "custom",
      message: "Password confirmation does not match",
    });
  }
});




export default function Register() {

  const {registerUser}= useAuth()
  const { t } = useTranslation();

  return (
    <section className=' w-full h-auto grid justify-center  items-center py-[24px] px-[16px]  gap-y-[32px] '>
      <div className='max-w-xl grid gap-y-[32px]'>
        <div className='text-center  '>
            <h1>
                {t('auth.registerUserTitle')}
            </h1>
            <p>
                {t('auth.registerUserSubtitle')}
            </p>
        </div>
        <div className=' '>
          <Form schema={registerSchema} onSubmit={registerUser}  >
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

          <Button type='submit'>{t('auth.registerButton')}</Button>
          </Form>
          <small className='hover:underline cursor-pointer text-primary hover:text-accent'> <Link to={"/login"}>{t('auth.alreadyAccount')}</Link></small>

                        
        </div>
        </div>
            <hr />
            <small className='hover:underline cursor-pointer text-primary hover:text-accent'> <Link to={"/register-pro"}>{t('auth.registerPro')}</Link></small>            
        <div>
      </div>          
    </section>
  )
}
