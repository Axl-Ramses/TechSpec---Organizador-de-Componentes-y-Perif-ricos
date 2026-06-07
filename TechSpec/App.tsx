import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { navigationRef } from "./src/navigation/NavigationService";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { ComponentsProvider } from "./src/context/ComponentsContext";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ComponentsProvider>
          <NavigationContainer ref={navigationRef}>
            <StackNavigator />
          </NavigationContainer>
        </ComponentsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}