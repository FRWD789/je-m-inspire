import React, { useState } from 'react'
import usePrivateApi from '../hooks/usePrivateApi'
import { AxiosError } from 'axios'
import { authService } from '../service/AuthService'

export default function User() {
    const [log,setLog] = useState("")
    const api = usePrivateApi()
    const [count,setCount] = useState(0)
    const hadnelRequest = async ()=>{


        setCount(perv=>perv+1)


        try {

            const data = await authService.getProfile()
            setLog(JSON.stringify(data))
            
        } catch (error) {

            if(error instanceof AxiosError)
              setLog(error.message)

            else{
                setLog(error as string)
            }
            
        }




    }

  return (
    <>
        <div>{log}</div>
        <button onClick={hadnelRequest}>get data {count}</button>
    </>

  )
}
