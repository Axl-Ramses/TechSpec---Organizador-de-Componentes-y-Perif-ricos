import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import { ComponentsProvider } from './src/context/ComponentsContext';
import TabsNavigator from './src/navigation/TabsNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <ComponentsProvider>
        <NavigationContainer>
          <TabsNavigator />
        </NavigationContainer>
      </ComponentsProvider>
    </ThemeProvider>
  );
}''