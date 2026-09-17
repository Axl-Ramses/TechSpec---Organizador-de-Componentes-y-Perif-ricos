import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { navigationRef } from "./src/navigation/NavigationService";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { StructuresProvider } from "./src/context/StructuresContext";
import { store } from "./src/store";

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <StructuresProvider>
            <NavigationContainer ref={navigationRef}>
              <StackNavigator />
            </NavigationContainer>
          </StructuresProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}