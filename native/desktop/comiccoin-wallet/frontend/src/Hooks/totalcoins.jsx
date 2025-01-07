import { useState, useEffect } from "react";
import { GetTotalCoins } from "../../wailsjs/go/main/App";

const useTotalCoins = (currentOpenWalletAtAddress, setForceURL) => {
  const [totalCoins, setTotalCoins] = useState(0);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const coins = await GetTotalCoins(currentOpenWalletAtAddress);
        // console.log("GetTotalCoins: results:", coins);
        setTotalCoins(coins);
      } catch (error) {
        console.log("GetTotalCoins: errors:", error);
        if (error.includes("address is null")) {
          setForceURL("/wallets");
        }
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 5000);

    return () => clearInterval(interval);
  }, [currentOpenWalletAtAddress, setForceURL]);

  return totalCoins;
};

export default useTotalCoins;
