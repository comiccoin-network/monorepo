import { useState, useEffect } from "react";

import {
  IsSyncing
} from "../../wailsjs/go/main/App";

const useSyncStatus = () => {
 const [isSyncing, setIsSyncing] = useState(true);

 useEffect(() => {
   const checkSync = async () => {
     try {
       const syncStatus = await IsSyncing();
       console.log("IsSyncing | response:", syncStatus);
       setIsSyncing(syncStatus);
     } catch (error) {
       console.error("Failed to check sync status:", error);
     }
   };

   // Check immediately
   checkSync();

   // Set up polling every 5 seconds
   const interval = setInterval(checkSync, 5000);

   // Cleanup interval on unmount
   return () => clearInterval(interval);
 }, []);

 return isSyncing;
};



export default useSyncStatus;
