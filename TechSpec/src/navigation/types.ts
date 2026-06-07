import { Category, HardwareComponent } from "../../assets/data";

// Stack raíz: Auth vs. Main
export type RootStackParamList = {
  Login:    undefined;
  Register: undefined;
  MainTabs: undefined;
};

// Tabs principales
export type MainTabParamList = {
  HomeTab:    undefined;
  MySpecsTab: undefined;
  AddTab:     undefined;
  ProfileTab: undefined;
};

// Stack dentro del tab Inicio
export type HomeStackParamList = {
  Home:            undefined;
  CategoryList:    { category: Category };
  ComponentDetail: { component: HardwareComponent };
  AddComponent:    { categoryId?: string };
};
