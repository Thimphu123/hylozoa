import { Model, Annotation } from "./chapter-data";

/**
 * Configuration for 3D models used in the website
 * Models should be in GLB or GLTF format and placed in /public/models/
 */

export interface ModelConfig {
  id: string;
  name: string;
  path: string;
  description: string;
  annotations?: Annotation[];
  defaultCamera?: {
    position: [number, number, number];
    target: [number, number, number];
  };
}

/**
 * Model library - maps model IDs to their configurations
 * This will be populated as we analyze the PDF and identify required models
 */
export const modelLibrary: Record<string, ModelConfig> = {};

/**
 * Get model configuration by ID
 */
export function getModelConfig(id: string): ModelConfig | null {
  return modelLibrary[id] || null;
}

/**
 * Get all available models
 */
export function getAllModels(): ModelConfig[] {
  return Object.values(modelLibrary);
}

/**
 * Get models for a specific chapter
 */
export function getModelsForChapter(chapterSlug: string): ModelConfig[] {
  // This will be implemented based on chapter-to-model mapping
  return [];
}

