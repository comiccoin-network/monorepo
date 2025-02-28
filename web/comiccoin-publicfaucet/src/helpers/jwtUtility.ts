/**
 *------------------------------------------------------------------------------
 * The purpose of this utility is to handle all API token related functionality
 * and provide an interface for the system to use.
 *------------------------------------------------------------------------------
 */

// Constants for storage keys to avoid repetition and potential typos
const ACCESS_TOKEN_KEY = 'COMICCOIN_FAUCET_TOKEN_UTILITY_ACCESS_TOKEN_DATA'
const REFRESH_TOKEN_KEY = 'COMICCOIN_FAUCET_TOKEN_UTILITY_REFRESH_TOKEN_DATA'

/**
 *  Saves our access token to persistent storage.
 *  @param accessToken - The JWT access token to store
 */
export function setAccessTokenInLocalStorage(accessToken: string): void {
    if (accessToken !== undefined && accessToken !== null && accessToken !== '') {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    } else {
        console.error('Setting undefined access token')
    }
}

/**
 *  Saves our refresh token to our persistent storage.
 *  @param refreshToken - The JWT refresh token to store
 */
export function setRefreshTokenInLocalStorage(refreshToken: string): void {
    if (refreshToken !== undefined && refreshToken !== null && refreshToken !== '') {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } else {
        console.error('Setting undefined refresh token')
    }
}

/**
 *  Gets our access token from persistent storage.
 *  @returns The stored access token or null if not found
 */
export function getAccessTokenFromLocalStorage(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 *  Gets our refresh token from persistent storage.
 *  @returns The stored refresh token or null if not found
 */
export function getRefreshTokenFromLocalStorage(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 *  Clears all the tokens on the user's browsers persistent storage.
 */
export function clearAllAccessAndRefreshTokensFromLocalStorage(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
}
