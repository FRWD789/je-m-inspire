import  { useEffect } from 'react'
import { privateApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import useRefresh from './useRefresh';

export default function usePrivateApi() {

    const {accessToken} = useAuth()
    const refresh =  useRefresh()
    useEffect(()=>{

          const responseIntercept =  privateApi.interceptors.request.use(



            async config=>{
                            console.log("at interceptors req")
                   if(!config.headers["Authorization"]){
                                config.headers["Authorization"] = `Bearer ${accessToken}`
                            
                }
             
            return config
            },
            error=>{
             return Promise.reject(error);
            }



        );


        const requestIntercept = privateApi.interceptors.response.use(
            res => res,
        async error =>{
            const prevReq = error?.config;
            if(error?.response?.status === 401 && !prevReq?.sent){
                prevReq.sent = true
                try{
                    const newAccessToken = await refresh()
                    prevReq.headers["Authorization"] = `Bearer ${newAccessToken}`
                    return privateApi(prevReq)

                }catch (error){
                    console.log(error)
                }
           
            }

               return Promise.reject(error);

        }
    
        );
        return () => {
            privateApi.interceptors.response.eject(responseIntercept);
            privateApi.interceptors.request.eject(requestIntercept);
        };
    },[accessToken,refresh])
  return privateApi
}
