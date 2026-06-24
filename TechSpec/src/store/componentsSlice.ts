import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabase";
import { HardwareComponent } from "../../assets/data";

interface ComponentsState {
  items: HardwareComponent[];
  loading: boolean;
  error: string | null;
}

const initialState: ComponentsState = {
  items: [],
  loading: false,
  error: null,
};

interface ComponentRow {
  id: string;
  category_id: string;
  name: string;
  model: string;
  notes: string;
  tags: string[];
  specs: { key: string; value: string }[];
  has_image: boolean;
  created_at: string;
  updated_at: string;
}

const fromRow = (row: ComponentRow): HardwareComponent => ({
  id: row.id,
  categoryId: row.category_id,
  name: row.name,
  model: row.model,
  notes: row.notes,
  tags: row.tags ?? [],
  specs: row.specs ?? [],
  hasImage: row.has_image,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export type NewComponentInput = Omit<HardwareComponent, "id" | "createdAt" | "updatedAt">;

export const fetchComponents = createAsyncThunk(
  "components/fetch",
  async () => {
    const { data, error } = await supabase
      .from("components")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ComponentRow[]).map(fromRow);
  }
);

export const addComponent = createAsyncThunk(
  "components/add",
  async (input: NewComponentInput) => {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("components")
      .insert({
        category_id: input.categoryId,
        name:        input.name,
        model:       input.model,
        notes:       input.notes,
        tags:        input.tags,
        specs:       input.specs,
        has_image:   input.hasImage,
        user_id:     userData.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return fromRow(data as ComponentRow);
  }
);

export const deleteComponent = createAsyncThunk(
  "components/delete",
  async (id: string) => {
    const { error } = await supabase.from("components").delete().eq("id", id);
    if (error) throw error;
    return id;
  }
);

const componentsSlice = createSlice({
  name: "components",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComponents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComponents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al cargar componentes";
      })
      .addCase(addComponent.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteComponent.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
      });
  },
});

export default componentsSlice.reducer;