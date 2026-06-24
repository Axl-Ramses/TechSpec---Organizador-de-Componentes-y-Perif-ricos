import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { navigationRef } from "./src/navigation/NavigationService";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { store } from "./src/store";

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer ref={navigationRef}>
            <StackNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}