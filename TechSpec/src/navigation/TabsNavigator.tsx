import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { MainTabParamList } from "./types";
import { useTheme } from "../context/ThemeContext";

import HomeStackNavigator from "./HomeStackNavigator";
import MySpecsScreen      from "../screens/MySpecsScreen";
import AddComponentScreen from "../screens/AddComponentScreen";
import ProfileScreen      from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export default function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   theme.brand,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor:  theme.border,
          borderTopWidth:  0.5,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [IoniconsName, IoniconsName]> = {
            HomeTab:    ["home",       "home-outline"],
            MySpecsTab: ["list",       "list-outline"],
            AddTab:     ["add-circle", "add-circle-outline"],
            ProfileTab: ["person",     "person-outline"],
          };
          const [active, inactive] = icons[route.name] ?? ["ellipse", "ellipse-outline"];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab"    component={HomeStackNavigator} options={{ tabBarLabel: "Inicio" }} />
      <Tab.Screen name="MySpecsTab" component={MySpecsScreen}      options={{ tabBarLabel: "Mis specs" }} />
      <Tab.Screen name="AddTab"     component={AddComponentScreen}  options={{ tabBarLabel: "Agregar" }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen}       options={{ tabBarLabel: "Perfil" }} />
    </Tab.Navigator>
  );
}
