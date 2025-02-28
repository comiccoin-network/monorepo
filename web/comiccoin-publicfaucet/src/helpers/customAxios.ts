import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import {
    getAccessTokenFromLocalStorage,
    getRefreshTokenFromLocalStorage,
    setAccessTokenInLocalStorage,
    setRefreshTokenInLocalStorage,
} from './jwtUtility'

// Define the refresh token endpoint using environment variables
export const COMICCOIN_FAUCET_REFRESH_TOKEN_API_ENDPOINT = `${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_DOMAIN}/publicfaucet/api/v1/refresh-token`

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
    // IMPORTANT: THIS IS THE ONLY WAY WE CAN GET THE ACCESS TOKEN.
    const accessToken = getAccessTokenFromLocalStorage()

    console.log('getCustomAxios - accessToken:', accessToken)

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

    // Attach our Axios "refresh token" interceptor.
    customAxios.interceptors.response.use(
        // Successful response handler
        (response: AxiosResponse) => {
            return response
        },
        // Error response handler with token refresh logic
        async (error) => {
            // Check if we have a response and it's a 401 Unauthorized
            if (error.response?.status === 401) {
                let originalConfig: InternalAxiosRequestConfig = error.config

                // Get the refresh token from storage
                const refreshToken = getRefreshTokenFromLocalStorage()

                if (refreshToken) {
                    try {
                        // Make an API call to refresh the token
                        const respRefresh = await handleRefresh(refreshToken, unauthorizedCallback)

                        // On successful token refresh, run the following code
                        if (respRefresh && respRefresh.status === 200) {
                            // Extract the new values from the response
                            const { access_token: newAccessToken, refresh_token: newRefreshToken } = respRefresh.data

                            // Save the new tokens
                            setAccessTokenInLocalStorage(newAccessToken)
                            setRefreshTokenInLocalStorage(newRefreshToken)

                            // Reset our axios authorization header but keep the original configuration intact
                            originalConfig = {
                                ...originalConfig,
                                headers: {
                                    ...originalConfig.headers,
                                    Authorization: `JWT ${newAccessToken}`,
                                },
                            } as InternalAxiosRequestConfig

                            // Retry the original request with the new token
                            return customAxios(originalConfig)
                        }
                    } catch (refreshError) {
                        // If refresh token fails, we don't handle it here as it will fall through to the Promise.reject below
                        console.error('Token refresh failed:', refreshError)
                    }
                }
            }

            // Return a rejected promise with the error data for all other error cases
            return Promise.reject(error.response?.data || error)
        }
    )

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
    // Set the data we will be sending to the 'refresh token' API endpoint
    const param = {
        value: token,
    }

    // Set authorization header for the refresh request
    axiosServiceRefresh.defaults.headers.common.Authorization = `Bearer ${token}`

    try {
        // Attempt to refresh the token
        const response = await axiosServiceRefresh.post<RefreshTokenResponse>(
            COMICCOIN_FAUCET_REFRESH_TOKEN_API_ENDPOINT,
            param
        )
        return response
    } catch (error: any) {
        // Check if the refresh token is also expired (401)
        if (error.response?.status === 401) {
            console.log(
                'customAxios | getCustomAxios | handleRefresh | failed refreshing - you need to log in again as refresh token expired.'
            )

            // If unauthorizedCallback is provided, invoke it
            if (unauthorizedCallback) {
                unauthorizedCallback()
            }
        } else {
            console.log('Other error occurred during token refresh:', error)
        }

        // Re-throw the error to be handled by the caller
        throw error
    }
}
