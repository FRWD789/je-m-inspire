import { useAuth } from '../context/AuthContext'
import { authService } from '../service/AuthService'

function useRefresh() {

    const {setAccessToken,setUser,user} = useAuth()

    const refresh = async()=>{
        try {
            const res = await authService.refresh()
            console.log(res)
            return {new_access_token:res.access_token,ref_user:res.user } 
        } catch (error) {
            setAccessToken(undefined);
            setUser(undefined);
            console.log(error)
            throw error   
        }finally{
            console.log(user)

        }
    }
    return refresh




}

export default useRefresh