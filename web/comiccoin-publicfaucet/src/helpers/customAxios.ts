import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import {
    getAccessTokenFromLocalStorage,
    getRefreshTokenFromLocalStorage,
    setAccessTokenInLocalStorage,
    setRefreshTokenInLocalStorage,
} from './jwtUtility'

// Define the refresh token endpoint using environment variables
export const COMICCOIN_FAUCET_REFRESH_TOKEN_API_ENDPOINT = `${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_DOMAIN}/publicfaucet/api/v1/token/refresh`

// Define the shape of the refresh token response
interface RefreshTokenResponse {
    access_token: string
    refresh_token: string
}

/**
 *  Function returns a custom `Axios` instance tailered to the `cps backend`
 *  API web-service for authenticated users.
 *
 *  Features:
 *  (1) Inform API to expect request encoded with `JSON` format.
 *  (2) Inform API we expect responses to be in `JSON` format.
 *  (3) Attach authorization bearer token.
 *  (4) Integrate automatic refresh token when token expires.
 *  (5) Provides an `unauthorizedCallback` callback parameter for a function to
 *      be called if both the token and refresh token have expired and therefore
 *      this function gets called.
 */
export default function getCustomAxios(unauthorizedCallback: (() => void) | null = null): AxiosInstance {
    console.log('🚀 Starting getCustomAxios setup...')

    // IMPORTANT: THIS IS THE ONLY WAY WE CAN GET THE ACCESS TOKEN.
    const accessToken = getAccessTokenFromLocalStorage()

    console.log('🔑 Retrieved accessToken from localStorage:', accessToken ? '✅ Token exists' : '❌ No token found')

    // Create a new Axios instance using our oAuth 2.0 bearer token
    // and various other headers.
    const customAxios = axios.create({
        baseURL: `${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_DOMAIN}/publicfaucet/api/v1`,
        headers: {
            Authorization: 'JWT ' + accessToken,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    })
    console.log(
        '🔧 Created custom Axios instance with baseURL:',
        `${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_DOMAIN}/publicfaucet/api/v1`
    )

    // Attach our Axios "refresh token" interceptor.
    customAxios.interceptors.response.use(
        // Successful response handler
        (response: AxiosResponse) => {
            console.log('✅ Request succeeded:', {
                url: response.config.url,
                method: response.config.method,
                status: response.status,
            })
            return response
        },
        // Error response handler with token refresh logic
        async (error) => {
            console.log('❌ Request failed:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
            })

            // Check if we have a response and it's a 401 Unauthorized
            if (error.response?.status === 401) {
                console.log('🔄 Detected 401 Unauthorized - Starting token refresh flow')
                let originalConfig: InternalAxiosRequestConfig = error.config

                // Get the refresh token from storage
                const refreshToken = getRefreshTokenFromLocalStorage()
                console.log(
                    '🔑 Retrieved refreshToken:',
                    refreshToken ? '✅ Refresh token exists' : '❌ No refresh token found'
                )

                if (refreshToken) {
                    try {
                        console.log('🔄 Attempting to refresh token...')
                        // Make an API call to refresh the token
                        const respRefresh = await handleRefresh(refreshToken, unauthorizedCallback)

                        // On successful token refresh, run the following code
                        if (respRefresh && (respRefresh.status === 200 || respRefresh.status === 201)) {
                            console.log('✅ Token refresh successful!')

                            // Extract the new values from the response
                            // IMPORTANT: Make sure the property names match the API response
                            const { access_token: newAccessToken, refresh_token: newRefreshToken } = respRefresh.data

                            console.log('🔑 Received new tokens:', {
                                accessToken: newAccessToken ? '✅ Present' : '❌ Missing',
                                refreshToken: newRefreshToken ? '✅ Present' : '❌ Missing',
                            })

                            if (newAccessToken && newRefreshToken) {
                                // Save the new tokens
                                console.log('💾 Saving new tokens to localStorage')
                                setAccessTokenInLocalStorage(newAccessToken)
                                setRefreshTokenInLocalStorage(newRefreshToken)

                                // Log the token refresh to confirm the update
                                console.log('✅ Tokens updated after refresh')

                                // Reset our axios authorization header but keep the original configuration intact
                                originalConfig = {
                                    ...originalConfig,
                                    headers: {
                                        ...originalConfig.headers,
                                        Authorization: `JWT ${newAccessToken}`,
                                    },
                                } as InternalAxiosRequestConfig
                                console.log('🔄 Updated request configuration with new token')

                                // Retry the original request with the new token
                                console.log('🔁 Retrying original request with new token')
                                return customAxios(originalConfig)
                            } else {
                                console.error('❌ Refresh succeeded but tokens missing in response')
                                throw new Error('Invalid token response format')
                            }
                        }
                    } catch (refreshError) {
                        // If refresh token fails, we don't handle it here as it will fall through to the Promise.reject below
                        console.error('❌ Token refresh failed:', refreshError)
                    }
                }
            }

            // Return a rejected promise with the error data for all other error cases
            console.log('❌ Returning error to caller:', error.response?.data || error)
            return Promise.reject(error.response?.data || error)
        }
    )

    console.log('✅ Custom Axios instance setup complete with interceptors')
    // Return our custom Axios instance for our application
    return customAxios
}

/**
 * Axios instance specifically for token refresh operations
 */
const axiosServiceRefresh = axios.create({
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
})
console.log('🔧 Created axiosServiceRefresh instance for token refresh operations')

/**
 * Handle the token refresh process
 * @param token - The refresh token to use
 * @param unauthorizedCallback - Optional callback if unauthorized
 * @returns Promise with the refresh response
 */
const handleRefresh = async (
    token: string,
    unauthorizedCallback: (() => void) | null = null
): Promise<AxiosResponse<RefreshTokenResponse>> => {
    console.log('🔄 handleRefresh function called')
    // Set the data we will be sending to the 'refresh token' API endpoint
    const param = {
        value: token,
    }
    console.log('📦 Prepared refresh token payload')

    // Set authorization header for the refresh request
    axiosServiceRefresh.defaults.headers.common.Authorization = `Bearer ${token}`
    console.log('🔑 Set Authorization header for refresh request')

    try {
        // Verify the endpoint is correct for your API
        const refreshEndpoint = `${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_DOMAIN}/publicfaucet/api/v1/token/refresh`
        console.log('🌐 Sending refresh token request to:', refreshEndpoint)

        // Attempt to refresh the token
        const response = await axiosServiceRefresh.post<RefreshTokenResponse>(refreshEndpoint, param)
        console.log('✅ Refresh token request successful, status:', response.status)

        // LOG the response structure to debug
        console.log('🔍 Refresh token response structure:', Object.keys(response.data))

        return response
    } catch (error: any) {
        // Handle error and log details
        console.error('❌ Token refresh failed:', error)
        throw error
    }
}
