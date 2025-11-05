import Form from '../../components/form'
import z from 'zod'
import FormFiled from '../../components/utils/form/formFiled';
import Input from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/button';
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
    const from = location.state?.from?.pathname || "/dashboard/";
    console.log(from) 
    const {login} = useAuth()
    const handelLogin = async (data:any)=>{
        try {
            await login(data)
            navigate(from,{replace:true})

        }catch(error){
            console.log(error)

        }

    }

  return (
 
            <section className=' w-full min-h-full flex flex-col flex-1 justify-center  items-center   '>
               <div className='max-w-xl grid gap-y-[32px]'>
                    <div className='text-center  '>
                        <h1>
                            Bon Retour
                        </h1>
                        <p>
                            Connectez-vous à votre compte Je m'inspire
                        </p>
                    </div>
                    <div className=' '>
                        <Form schema={LoginSchema} onSubmit={handelLogin}>
                        <FormFiled label='Email'>
                            <Input name='email' />
                        </FormFiled>
                            <FormFiled label='Password'>
                            <Input name='password' type='password' />
                        </FormFiled>
                        <Button type='submit'>Se Connecter</Button>
                    </Form>
                                                <small className='hover:underline cursor-pointer text-primary hover:text-accent'>Vous n'avez pas encore de compte ? <Link to={"/register"}>Créez-en un maintenant</Link></small>

                    </div>
                    <div>
                        
                    </div>
               </div>
                
            </section>


  )
}
