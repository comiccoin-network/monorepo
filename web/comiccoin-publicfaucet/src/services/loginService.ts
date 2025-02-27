import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// User type based on the provided Go struct
interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    name: string
    role: number
    wasEmailVerified?: boolean
    // Add other relevant fields from the provided User struct
}

// Login request interface matching the backend expectation
interface LoginRequestData {
    email: string
    password: string
}

// Login response interface matching the backend response
interface LoginResponse {
    user: User
    accessToken: string
    accessTokenExpiryTime: string
    refreshToken: string
    refreshTokenExpiryTime: string
}

/**
 * Login Service class to handle authentication API interactions
 */
class LoginService {
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
     * Perform user login
     * @param email - User's email address
     * @param password - User's password
     * @returns Promise resolving to login response
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const apiUrl = '/publicfaucet/api/v1/login'
            console.log(`📡 Connecting to Login API: ${this.baseUrl}${apiUrl}`)

            const requestData: LoginRequestData = { email, password }

            const response: AxiosResponse<LoginResponse> = await this.axiosInstance.post(apiUrl, requestData)

            // Return the login response
            return response.data
        } catch (error) {
            // Handle different types of errors
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError

                // Extract error response
                const errorResponse = axiosError.response?.data || axiosError.message

                // Special handling for specific error messages
                if (typeof errorResponse === 'string' && errorResponse.includes('Incorrect email or password')) {
                    throw new Error('Incorrect email or password')
                }

                // Throw the error directly
                throw new Error(JSON.stringify(errorResponse || 'Login failed'))
            }

            // Fallback error handling
            throw error
        }
    }

    /**
     * Store authentication tokens in local storage
     * @param accessToken - JWT access token
     * @param refreshToken - JWT refresh token
     */
    storeTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
    }

    /**
     * Remove authentication tokens from local storage
     */
    clearTokens(): void {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
    }

    /**
     * Get the current access token
     * @returns Access token or null
     */
    getAccessToken(): string | null {
        return localStorage.getItem('accessToken')
    }
}

export default new LoginService()
