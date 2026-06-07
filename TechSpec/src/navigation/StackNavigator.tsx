import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import LoginScreen    from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import TabNavigator   from "./TabNavigator";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: "slide_from_right",
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
