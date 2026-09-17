import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MySpecsStackParamList } from "./types";
import { useTheme } from "../context/ThemeContext";

import MySpecsScreen         from "../screens/MySpecsScreen";
import ComponentDetailScreen from "../screens/ComponentDetailScreen";
import AddComponentScreen    from "../screens/AddComponentScreen";
import CompareScreen         from "../screens/CompareScreen";

const Stack = createNativeStackNavigator<MySpecsStackParamList>();

/**
 * Stack del tab "Mis specs". Antes el tab montaba la pantalla suelta, por lo
 * que tocar una tarjeta no podía abrir el detalle ni editar la ficha.
 */
export default function MySpecsStackNavigator() {
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
      <Stack.Screen name="MySpecs"         component={MySpecsScreen}         options={{ headerShown: false }} />
      <Stack.Screen name="ComponentDetail" component={ComponentDetailScreen} options={({ route }) => ({ title: route.params.component.name })} />
      <Stack.Screen name="AddComponent"    component={AddComponentScreen}    options={{ title: "Nueva ficha", presentation: "modal" }} />
      <Stack.Screen name="Compare"         component={CompareScreen}         options={{ title: "Comparar componentes" }} />
    </Stack.Navigator>
  );
}
