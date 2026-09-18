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
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

const fromRow = (row: ComponentRow): HardwareComponent => {
  let imageUrl = row.image_url ?? undefined;
  if (!imageUrl && row.has_image) {
    const bucket = process.env.EXPO_PUBLIC_SUPABASE_BUCKET || "uploads";
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(`components/${row.id}.jpg`);
    imageUrl = data.publicUrl;
  }

  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    model: row.model,
    notes: row.notes,
    tags: row.tags ?? [],
    specs: row.specs ?? [],
    hasImage: row.has_image,
    imageUrl,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

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

    const insertPayload: Record<string, unknown> = {
      category_id: input.categoryId,
      name:        input.name,
      model:       input.model,
      notes:       input.notes,
      tags:        input.tags,
      specs:       input.specs,
      has_image:   input.hasImage,
      user_id:     userData.user?.id,
    };
    if (input.imageUrl) {
      insertPayload.image_url = input.imageUrl;
    }

    let { data, error } = await supabase
      .from("components")
      .insert(insertPayload)
      .select()
      .single();

    // Si la columna image_url no existe en la BD, reintentamos sin ella
    if (error && error.message?.includes("image_url")) {
      delete insertPayload.image_url;
      const retry = await supabase
        .from("components")
        .insert(insertPayload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    const comp = fromRow(data as ComponentRow);
    if (input.imageUrl) comp.imageUrl = input.imageUrl;
    return comp;
  }
);

export type UpdateComponentInput = Partial<NewComponentInput> & { id: string };

export const updateComponent = createAsyncThunk(
  "components/update",
  async (input: UpdateComponentInput) => {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.categoryId !== undefined) patch.category_id = input.categoryId;
    if (input.name       !== undefined) patch.name        = input.name;
    if (input.model      !== undefined) patch.model       = input.model;
    if (input.notes      !== undefined) patch.notes       = input.notes;
    if (input.tags       !== undefined) patch.tags        = input.tags;
    if (input.specs      !== undefined) patch.specs       = input.specs;
    if (input.hasImage   !== undefined) patch.has_image   = input.hasImage;
    if (input.imageUrl   !== undefined) patch.image_url   = input.imageUrl;

    let { data, error } = await supabase
      .from("components")
      .update(patch)
      .eq("id", input.id)
      .select();

    // Si la columna image_url no existe en la tabla de Supabase, reintentamos sin ella
    if (error && error.message?.includes("image_url")) {
      delete patch.image_url;
      const retry = await supabase
        .from("components")
        .update(patch)
        .eq("id", input.id)
        .select();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    if (!data || data.length === 0) {
      // Sin filas devueltas = RLS bloqueó el UPDATE (falta la política de update)
      throw new Error(
        "No se pudo actualizar la ficha: la base de datos rechazó el cambio (permisos RLS)."
      );
    }
    const comp = fromRow(data[0] as ComponentRow);
    if (input.imageUrl) comp.imageUrl = input.imageUrl;
    return comp;
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
      .addCase(updateComponent.fulfilled, (state, action) => {
        const idx = state.items.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteComponent.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
      });
  },
});

export default componentsSlice.reducer;