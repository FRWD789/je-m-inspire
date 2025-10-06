import React from 'react'
import Form from '../../components/From'
import z from 'zod'
import FormFiled from '../../components/utils/form/formFiled';
import Input from '../../components/ui/input';
import { authService } from '../../service/AuthService';
import { useAuth } from '../../context/AuthContext';
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

    const {login} = useAuth()
  return (
 
            <section className=' w-full h-screen grid justify-center  items-center py-[24px] px-[16px]  gap-y-[32px] '>
               <div className='max-w-xl grid gap-y-[32px]'>
                    <div className='text-center  '>
                        <h1>
                            Welcome Back
                        </h1>
                        <p>
                            Login to your Je m'inspire account
                        </p>
                    </div>
                    <div className=' '>
                        <Form schema={LoginSchema} onSubmit={login}>
                        <FormFiled label='Email'>
                            <Input name='email' />
                        </FormFiled>
                            <FormFiled label='Password'>
                            <Input name='password' type='password' />
                        </FormFiled>
                        <button className='px-[4px] py-[8px] bg-text text-background'>Login</button>
                    </Form>
                        
                    </div>
               </div>
                
            </section>


  )
}
