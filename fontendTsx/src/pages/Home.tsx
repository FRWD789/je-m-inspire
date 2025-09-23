import React from 'react'
import useRefreshToken from '../hooks/useRefreshToken'
import axios from 'axios'
import useApi from '../hooks/useApi'
import usePrivateApi from '../hooks/usePrivateApi'


function Home() {
  const privateApi = usePrivateApi()
  const refresh = useRefreshToken()
  const getProtectedContent = async () =>{
    try{

      const res = privateApi.get("/user")
      console.log(res)

   

    }catch(err){

       console.error("protected failed:", err)

    }

  }

  const handleRefresh = async () => {
    try {
       const response = await refresh()
    } catch (err) {
      console.error("Refresh failed:", err)
    }
  }

  return (
    <>  
      <div>Logged in</div>
      <button onClick={handleRefresh}>Refresh Token</button>
      <button onClick={getProtectedContent}>test</button>
    </>
  )
}

export default Home
