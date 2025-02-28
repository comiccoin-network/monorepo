// monorepo/web/comiccoin-publicfaucet/src/services/getMeService.ts
import { AxiosInstance } from 'axios'
import getCustomAxios from '../helpers/customAxios'
import { User, API_ENDPOINTS } from '../types'

class GetMeService {
    private readonly api: AxiosInstance

    constructor() {
        this.api = getCustomAxios(() => {
            console.log('🔒 GET ME SERVICE: Authentication expired, user needs to login again')
            window.location.href = '/login'
        })
    }

    public async getMe(): Promise<User> {
        try {
            const response = await this.api.get<User>(API_ENDPOINTS.ME)
            return response.data
        } catch (error: any) {
            console.error('❌ GET ME SERVICE: Failed to fetch user profile', error)
            throw error // Re-throw to be handled by React Query
        }
    }
}

export const getMeService = new GetMeService()
export default getMeService
