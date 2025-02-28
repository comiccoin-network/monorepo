// monorepo/web/comiccoin-publicfaucet/src/services/transactionsService.ts
import { AxiosInstance } from 'axios'
import getCustomAxios from '../helpers/customAxios'
import { Transaction } from '../types'

class TransactionsService {
    private readonly api: AxiosInstance

    constructor() {
        this.api = getCustomAxios(() => {
            console.log('🔒 TRANSACTIONS SERVICE: Authentication expired, user needs to login again')
            window.location.href = '/login'
        })
    }

    public async getTransactions(): Promise<Transaction[]> {
        try {
            const response = await this.api.get<Transaction[]>('/transactions')
            return response.data
        } catch (error: any) {
            console.error('❌ TRANSACTIONS SERVICE: Failed to fetch transactions', error)
            throw error // Re-throw to be handled by React Query
        }
    }
}

export const transactionsService = new TransactionsService()
export default transactionsService
