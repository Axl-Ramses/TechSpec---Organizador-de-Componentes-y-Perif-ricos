/**
 * TechSpec - Servicio de Almacenamiento en la Nube (Supabase Storage)
 * 
 * Permite seleccionar y subir imágenes de componentes al bucket de Supabase,
 * codificando a base64 y decodificando a ArrayBuffer para una subida binaria confiable.
 * Basado en la arquitectura de ActividadAlmacenamientoNube.
 */

import { decode } from "base64-arraybuffer";
import { File } from "expo-file-system";
import { supabase } from "./supabase";

export const storageConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://sfnoxetsvhsnuiricrkp.supabase.co",
  apiKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  bucket: process.env.EXPO_PUBLIC_SUPABASE_BUCKET || "uploads",
};

export type UploadInput = {
  uri: string;
  name: string;
  mimeType?: string;
  base64?: string | null;
};

export type UploadResult = {
  path: string;
  publicUrl: string;
};

/**
 * Genera un nombre de archivo único conservando la extensión original.
 */
export function buildUniqueName(originalName: string, prefix = "component"): string {
  const dot = originalName.lastIndexOf(".");
  const ext = dot > -1 ? originalName.slice(dot) : ".jpg";
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${random}${ext}`;
}

/**
 * Sube una imagen al bucket de Supabase Storage.
 * Convierte el archivo a base64 y luego a ArrayBuffer con base64-arraybuffer.
 */
export async function uploadToStorage(
  input: UploadInput,
  destinationPath?: string
): Promise<UploadResult> {
  if (!storageConfig.url || !storageConfig.apiKey || !storageConfig.bucket) {
    throw new Error(
      "Faltan credenciales de Supabase Storage. Revisa las variables EXPO_PUBLIC_SUPABASE_* en tu archivo .env."
    );
  }

  // Obtenemos el base64 directamente o leyendo el archivo del sistema de archivos local
  let base64String = input.base64;
  if (!base64String) {
    base64String = await new File(input.uri).base64();
  }

  const path = destinationPath ?? buildUniqueName(input.name);

  const { error } = await supabase.storage
    .from(storageConfig.bucket)
    .upload(path, decode(base64String), {
      contentType: input.mimeType ?? "image/jpeg",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(storageConfig.bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

/**
 * Elimina un archivo de Supabase Storage por su path relativo en el bucket.
 */
export async function deleteFromStorage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(storageConfig.bucket).remove([path]);
  if (error) {
    console.warn("No se pudo eliminar el archivo en Storage:", error.message);
  }
}

/**
 * Obtiene la URL pública de la imagen de un componente en Supabase Storage,
 * o null si no posee imagen.
 */
export function getComponentImageUrl(component: { id: string; hasImage?: boolean; imageUrl?: string | null }): string | null {
  if (component.imageUrl) {
    return component.imageUrl;
  }
  if (component.hasImage) {
    // Si fue subido con la convención components/<id>.jpg
    const { data } = supabase.storage
      .from(storageConfig.bucket)
      .getPublicUrl(`components/${component.id}.jpg`);
    return data.publicUrl;
  }
  return null;
}
