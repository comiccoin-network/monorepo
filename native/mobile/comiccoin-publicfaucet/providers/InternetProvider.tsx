/**
 * InternetProvider.tsx
 *
 * PURPOSE:
 * This component monitors the device's internet connection and displays a modal
 * when the connection is lost. It's a wrapper component that provides internet
 * connectivity awareness to your entire application.
 *
 * BACKGROUND:
 * In mobile apps, internet connectivity can change frequently as users move around.
 * It's important to handle these situations gracefully by informing users when
 * they've lost connection and preventing them from attempting actions that would fail.
 *
 * This file implements what's known as a "Provider Pattern" - a way to make certain
 * functionality or data available throughout your application without passing props
 * through multiple component levels.
 */

// Import the core React library and specific hooks we'll need
import React, { useState, useEffect } from "react";
// Import the NetInfo library which lets us check network connectivity in React Native
import NetInfo from "@react-native-community/netinfo";
// Import our custom modal component that will display when there's no internet
import NoInternetModal from "../components/NoInternetModal";

/**
 * TypeScript Interface for the props this component accepts
 *
 * In TypeScript, interfaces define the shape of objects - in this case, what
 * props our component requires and their types.
 *
 * React.ReactNode is a type that represents anything that can be rendered:
 * numbers, strings, elements, arrays, fragments, etc. Here it means our
 * InternetProvider can wrap any valid React content.
 */
interface InternetProviderProps {
  children: React.ReactNode;
}

/**
 * InternetProvider Component
 *
 * This component wraps your application (or a part of it) and monitors
 * internet connectivity, showing a modal when connection is lost.
 *
 * @param {InternetProviderProps} props - Component properties
 * @param {React.ReactNode} props.children - The child components to render inside this provider
 *
 * @returns {JSX.Element} - The rendered component
 */
export default function InternetProvider({ children }: InternetProviderProps) {
  /**
   * State hook to track internet connectivity
   *
   * useState is a React Hook that lets you add state to functional components.
   * Here, we create a state variable called isConnected, initialize it to true,
   * and get a function called setIsConnected that lets us update this value.
   *
   * The <boolean> syntax is TypeScript telling React that this state
   * variable will always be a boolean (true or false).
   *
   * We optimistically initialize to true to avoid showing the no-connection
   * modal briefly when the app first loads.
   */
  const [isConnected, setIsConnected] = useState<boolean>(true);

  /**
   * Effect hook to monitor network state changes
   *
   * useEffect is a React Hook that lets you perform side effects in functional
   * components. Side effects include things like data fetching, subscriptions,
   * or manually changing the DOM - anything that interacts with the world outside
   * your component.
   *
   * This particular effect:
   * 1. Runs once when the component mounts (due to the empty dependency array [])
   * 2. Sets up a subscription to network changes
   * 3. Returns a cleanup function that runs when the component unmounts
   */
  useEffect(() => {
    /**
     * Subscribe to network state changes using NetInfo
     *
     * NetInfo.addEventListener creates a subscription that calls our callback
     * function whenever the network state changes.
     *
     * The callback receives a 'state' object with information about the
     * current network state, including whether the device is connected.
     */
    const unsubscribe = NetInfo.addEventListener((state) => {
      /**
       * Update our state based on connection status
       *
       * state.isConnected is a boolean or null, indicating if the device
       * is connected to the internet. The double bang (!!) converts any
       * non-boolean value (like null) to a boolean:
       * - null/undefined/0/"" -> false
       * - anything else -> true
       *
       * So if state.isConnected is null, !!state.isConnected will be false.
       */
      setIsConnected(!!state.isConnected);
    });

    /**
     * Cleanup function that runs when the component unmounts
     *
     * This is important to prevent memory leaks. Without this cleanup,
     * the subscription would continue running even after the component
     * is no longer in use, wasting resources and potentially causing bugs.
     *
     * By returning a function from useEffect, we tell React to run this
     * function when the component unmounts or before the effect runs again.
     */
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs once on mount

  /**
   * Render the component
   *
   * The component renders:
   * 1. The children (whatever components were wrapped by InternetProvider)
   * 2. The NoInternetModal, which is visible only when isConnected is false
   *
   * The empty fragments (<> </>) are a React feature called Fragments,
   * which let you group multiple elements without adding extra nodes to the DOM.
   */
  return (
    <>
      {/* Render the children components normally */}
      {children}

      {/*
        Render the NoInternetModal with visibility controlled by our
        isConnected state. The modal will only be visible when there's
        no internet connection (isConnected is false).
      */}
      <NoInternetModal visible={!isConnected} />
    </>
  );
}
