/**
 *  Function takes the Vite environment variables and returns the base URL used
 *  for all API communication with our web-service. Please use this function to set the
 *  ``Axios`` base URL when making API calls to the backend server.
 */
export function getAPIBaseURL(): string {
  return (
    import.meta.env.VITE_API_PROTOCOL +
    "://" +
    import.meta.env.VITE_API_DOMAIN + "/publicfaucet/api/v1"
  );
}

export function getAppBaseURL(): string {
  return (
    import.meta.env.VITE_WWW_PROTOCOL +
    "://" +
    import.meta.env.VITE_WWW_DOMAIN
  );
}

/**
 * Get the URL parameters
 * source: https://css-tricks.com/snippets/javascript/get-url-variables/
 * @param  {String} url The URL
 * @return {Object}     The URL parameters
 */
export function getParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const parser = document.createElement("a");
  parser.href = url;
  const query = parser.search.substring(1);
  const vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
}
