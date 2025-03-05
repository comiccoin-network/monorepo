import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import screens
import GetStartedScreen from "../screens/GetStartedScreen";
// Import other screens as you create them:
// import HomeScreen from '../screens/HomeScreen';
// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import TermsScreen from '../screens/TermsScreen';
// import PrivacyScreen from '../screens/PrivacyScreen';

// Create the navigation stack
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="GetStarted"
        screenOptions={{
          headerShown: false, // Hide the default header
          cardStyle: { backgroundColor: "#f5f3ff" }, // Light purple background
        }}
      >
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />

        {/* Add other screens as you create them */}
        {/*
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
