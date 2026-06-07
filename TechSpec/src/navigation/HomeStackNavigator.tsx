import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList } from "./types";
import { useTheme } from "../context/ThemeContext";

import HomeScreen            from "../screens/HomeScreen";
import CategoryListScreen    from "../screens/CategoryListScreen";
import ComponentDetailScreen from "../screens/ComponentDetailScreen";
import AddComponentScreen    from "../screens/AddComponentScreen";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: theme.brandDark },
        headerTintColor:  theme.white,
        headerTitleStyle: { fontWeight: "500", fontSize: 17 },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Home"            component={HomeScreen}            options={{ headerShown: false }} />
      <Stack.Screen name="CategoryList"    component={CategoryListScreen}    options={({ route }) => ({ title: route.params.category.name })} />
      <Stack.Screen name="ComponentDetail" component={ComponentDetailScreen} options={({ route }) => ({ title: route.params.component.name })} />
      <Stack.Screen name="AddComponent"    component={AddComponentScreen}    options={{ title: "Nueva ficha", presentation: "modal" }} />
    </Stack.Navigator>
  );
}
