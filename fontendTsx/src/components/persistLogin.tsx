import  { use, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Outlet } from 'react-router-dom'
import useRefresh from '../hooks/useRefresh'

export default function PersistLogin() {

     const { accessToken,user,setAccessToken,setUser } = useAuth();    
    const refresh = useRefresh() 
     const [isLoading,setIsloading]= useState(true)

     useEffect(()=>{
          

        const verifyRefreshToken = async () =>{
             console.log('🔄 Tentative de refresh du token...');
            try {
               const {new_access_token,ref_user} = await refresh();
               if (new_access_token&&ref_user) {
                console.log('✅ Token refreshed avec succès');
                console.log(ref_user,new_access_token)
                setAccessToken(new_access_token)
                setUser(ref_user)

                }
            }catch(error){
                console.log(error)
            }finally{
                setIsloading(false)
            }
        }
        if (!accessToken) {
                console.log('ℹ️ Pas de token, tentative de refresh...');
                verifyRefreshToken();
            } else {
                console.log('✅ Token existe déjà');
                setIsloading(false);
            }

     },[])




  return (
    <>
    {isLoading
        ?<p>loading...</p>
        :<Outlet/>}
    </>
    
  )
}
