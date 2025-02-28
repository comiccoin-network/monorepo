// monorepo/web/comiccoin-publicfaucet/src/services/dashboardService.ts
import { AxiosInstance } from 'axios'
import getCustomAxios from '../helpers/customAxios'
import { DashboardDTO, API_ENDPOINTS } from '../types'

class DashboardService {
    private readonly api: AxiosInstance

    constructor() {
        this.api = getCustomAxios(() => {
            console.log('🔒 DASHBOARD SERVICE: Authentication expired, user needs to login again')
            window.location.href = '/login'
        })
    }

    public async getDashboard(): Promise<DashboardDTO> {
        try {
            const response = await this.api.get<DashboardDTO>(API_ENDPOINTS.DASHBOARD)
            return response.data
        } catch (error: any) {
            console.error('❌ DASHBOARD SERVICE: Failed to fetch dashboard', error)
            throw error // Re-throw to be handled by React Query
        }
    }
}

export const dashboardService = new DashboardService()
export default dashboardService
