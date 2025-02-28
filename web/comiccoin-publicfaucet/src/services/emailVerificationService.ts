// monorepo/web/comiccoin-publicfaucet/src/services/emailVerificationService.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

/**
 * Interface for the email verification API response
 */
interface EmailVerificationResponse {
    // Define the shape of your successful response
    // Adjust these fields based on your actual API response
    id?: string
    status?: string
    message?: string
}

/**
 * Interface for error response
 */
interface ErrorResponse {
    [key: string]: string | string[]
}

/**
 * Email Verification Service class to handle API interactions
 */
class EmailVerificationService {
    private axiosInstance: AxiosInstance
    private baseUrl: string

    constructor() {
        // Build the API base URL from Vite environment variables
        const apiProtocol = import.meta.env.VITE_API_PROTOCOL || 'https'
        const apiDomain = import.meta.env.VITE_API_DOMAIN

        this.baseUrl = `${apiProtocol}://${apiDomain}`

        // Create axios instance with base configuration
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        })
    }

    /**
     * Verify email using the provided verification code
     * @param verificationCode - The verification code to send
     * @returns Promise resolving to the verification response
     */
    async verifyEmail(verificationCode: string): Promise<EmailVerificationResponse> {
        try {
            const apiUrl = '/publicfaucet/api/v1/verify'
            console.log(`📡 Connecting to API: ${this.baseUrl}${apiUrl}`)

            const response: AxiosResponse<EmailVerificationResponse> = await this.axiosInstance.post(apiUrl, {
                code: verificationCode,
            })

            // Return the response data directly without key transformation
            return response.data
        } catch (error) {
            // Handle different types of errors
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>

                // Extract error response
                const errorResponse = axiosError.response?.data || axiosError.message

                // Special handling for specific error messages
                if (typeof errorResponse === 'string' && errorResponse.includes('Incorrect email or password')) {
                    throw new Error('Incorrect email or password')
                }

                // Throw the error directly
                throw new Error(JSON.stringify(errorResponse || 'Unknown error'))
            }

            // Fallback error handling
            throw error
        }
    }
}

export default new EmailVerificationService()
