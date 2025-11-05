import { useAuth } from '../context/AuthContext'
import { authService } from '../service/AuthService'

interface RefreshResult {
    new_access_token: string;
    ref_user: any;
}

function useRefresh() {
    const { setAccessToken, setUser } = useAuth()

    const refresh = async (): Promise<RefreshResult> => {
        try {
            console.log('🔄 Starting token refresh...')
            const res = await authService.refresh()
            console.log('✅ Refresh response:', res)
            
            // FIX: Access the nested data property
            return {
                new_access_token: res.access_token, // res.data.access_token NOT res.access_token
                ref_user: res.user // res.data.user NOT res.user
            } 
        } catch (error) {
            console.error('❌ Refresh failed:', error)
            setAccessToken(undefined);
            setUser(undefined);
            throw error   
        }
    }

    return refresh
}

export default useRefresh