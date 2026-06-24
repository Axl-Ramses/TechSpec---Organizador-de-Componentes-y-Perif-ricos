import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { COMPONENTS as INITIAL, HardwareComponent } from "../../assets/data";

interface ComponentsState {
  items: HardwareComponent[];
}

const initialState: ComponentsState = {
  items: INITIAL,
};

export type NewComponentInput = Omit<HardwareComponent, "id" | "createdAt" | "updatedAt">;

const componentsSlice = createSlice({
  name: "components",
  initialState,
  reducers: {
    addComponent: {
      prepare(data: NewComponentInput) {
        const now = new Date().toISOString().split("T")[0];
        const newComponent: HardwareComponent = {
          ...data,
          id: Date.now().toString(),
          createdAt: now,
          updatedAt: now,
        };
        return { payload: newComponent };
      },
      reducer(state, action: PayloadAction<HardwareComponent>) {
        state.items.unshift(action.payload);
      },
    },

    updateComponent(state, action: PayloadAction<HardwareComponent>) {
      const index = state.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString().split("T")[0],
        };
      }
    },

    deleteComponent(state, action: PayloadAction<string>) {
      state.items = state.items.filter(c => c.id !== action.payload);
    },
  },
});

export const { addComponent, updateComponent, deleteComponent } = componentsSlice.actions;
export default componentsSlice.reducer;