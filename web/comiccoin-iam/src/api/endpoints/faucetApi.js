// monorepo/web/comiccoin-iam/src/api/endpoints/faucetApi.js
import { usePublicQuery } from "../../hooks/useApi";

// Custom hook for fetching faucet data (GET only)
export const useFaucet = (options = {}) => {
  return usePublicQuery(["faucet"], "/faucet/1", options); // ChainID = 1 is mainnet.
};
