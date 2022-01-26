export type TemplateMap = {
  id: string
};

export type CanvasItemSelectorConfigValue =
  | {
      allowedTemplates?: TemplateMap;
      source?: LinkedSource['id'];
    }
  | undefined;

export interface ConfigValue {
  [key: string]: string | undefined | null;
}

export interface EditorValue {
  id: string
}

export interface EditorMetadataValue {
  parameterConfiguration: ConfigValue;
  settings: SettingsValue;
}

export interface ProjectSettings {
  projectAlias: string;
  apiKey: string;
}

export interface CanvasItemSelectorConfigMetadataValue {
  settings: SettingsValue;
  /** Uniform project id, not GatherContent project id */
  projectId: string;
}

export interface CanvasItemSelectorEditorValue {
  source: string | undefined;
  itemIds: number[] | undefined;
}

export interface CanvasItemSelectorEditorMetadataValue {
  parameterConfiguration: CanvasItemSelectorConfigValue;
  settings: SettingsValue;
  /** Uniform project id */
  projectId: string;
}

export interface SettingsValue {
  linkedSources: LinkedSource[] | undefined;
}

export interface LinkedSource {
  id: string;
  project: ProjectSettings;
}