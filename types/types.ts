export interface ConfigValue {
  [key: string]: string | undefined | null;
}

export interface EditorValue {
  id: string
}

export interface MultiEditorValue {
  ids: string[]
}

export interface EditorMetadataValue {
  parameterConfiguration: ConfigValue;
  settings: SettingsValue;
}

export interface SettingsValue {
  projectAlias: string;
  apiKey: string;
}