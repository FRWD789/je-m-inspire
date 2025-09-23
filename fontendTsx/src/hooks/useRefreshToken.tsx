import React from 'react'
import { api } from '../api/api'

function useRefreshToken() {
    const refresh = async ()=>{
        const response = await api.get("/refresh",{
            withCredentials:true
        })
        console.log(response.data.access_token)
        return response.data.access_token
    }
    return refresh

    
  
}

export default useRefreshToken