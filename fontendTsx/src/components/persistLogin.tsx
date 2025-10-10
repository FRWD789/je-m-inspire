import  { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Outlet } from 'react-router-dom'
import useRefresh from '../hooks/useRefresh'

export default function PersistLogin() {

     const {accessToken} = useAuth()
     const refresh = useRefresh() 
     const [isLoading,setIsloading]= useState(true)

     useEffect(()=>{

        const verifyRefreshToken = async () =>{
            try {
                await refresh()
            }catch(error){
                console.log(error)
            }finally{
                setIsloading(false)
            }
        }
     
        !accessToken ? verifyRefreshToken() : setIsloading(false);
     },[])


     useEffect(()=>{
        console.log("is loading :",isLoading)
        console.log(accessToken)

     },[isLoading])

  return (
    <>
    {isLoading
        ?<p>loading...</p>
        :<Outlet/>}
    </>
    
  )
}
