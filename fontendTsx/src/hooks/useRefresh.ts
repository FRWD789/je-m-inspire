import { useAuth } from '../context/AuthContext'
import { authService } from '../service/AuthService'

function useRefresh() {

    const {setAccessToken,setUser} = useAuth()

    const refresh = async()=>{
        try {
            const res = await authService.refresh()
            setAccessToken(res.access_token)
            setUser(res.user);
            return res.access_token  
        } catch (error) {
            console.log(error)
            throw error   
        }
    }
    return refresh




}

export default useRefresh