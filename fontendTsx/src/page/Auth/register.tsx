
import React, { use } from 'react'
import FormFiled from '../../components/utils/form/formFiled'
import Input from '../../components/ui/input'






import { z } from "zod";
import Form from '../../components/form';
import Select from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';

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


const options= [
    {
          description: "utilisateur du site",
            value: "utilisateur"
},
   {
          description: "professionnel du site",
            value: "professionnel"
},
 {
          description: "admin du site",
            value: "admin"
}



]

  return (
               <section className=' w-full h-screen grid justify-center  items-center py-[24px] px-[16px]  gap-y-[32px] '>
                  <div className='max-w-xl grid gap-y-[32px]'>
                       <div className='text-center  '>
                           <h1>
                               Welcome Back
                           </h1>
                           <p>
                               Register to your Je m'inspire account
                           </p>
                       </div>
                       <div className=' '>
                           <Form schema={registerSchema} onSubmit={registerUser}  >
                               <div className='flex gap-x-[8px]'>
                                   <FormFiled label='Name'>
                                        <Input name='name'  />
                                    </FormFiled>
                                     <FormFiled label='Last Name'>
                                        <Input name='last_name'  />
                                    </FormFiled>
                               </div>
                                <FormFiled label='City'>
                                    <Input name='city' />
                                </FormFiled>
                                      <FormFiled label='Date of Birth'>
                                    <Input name='date_of_birth' type='date' />
                                </FormFiled>
                                <FormFiled label='Email'>
                                    <Input name='email'  />
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
                                <button type='submit' className='px-[4px] py-[8px] bg-text text-background'>Register</button>
                            </Form>
                           
                       </div>
                  </div>
                   
               </section>
  )
}
