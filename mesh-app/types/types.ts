export interface ContentType {
  alias: string;
  name: string;
}
export type ContentTypeMap = {
  [key: string]: ContentType | undefined;
};

export type CanvasItemSelectorConfigValue =
  | {
      allowedContentTypes?: ContentTypeMap;
      source?: LinkedSource['id'];
      allowMultiselect?: boolean;
      required?: boolean;
    }
  | undefined;

export interface ConfigValue {
  [key: string]: string | undefined | null;
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
  /** Uniform project id */
  projectId: string;
}

export interface CanvasItemSelectorEditorValue {
  source: string | undefined;
  ids: string[];
}

export interface CanvasItemSelectorEditorMetadataValue {
  parameterConfiguration: CanvasItemSelectorConfigValue;
  settings: SettingsValue;
  /** Uniform project id */
  projectId: string;
  parameterDefinition: {
    name: string;
  };
}

export interface SettingsValue {
  linkedSources: LinkedSource[] | undefined;
}

export interface LinkedSource {
  id: string;
  project: ProjectSettings;
}
export interface ContentItem {
  contentTypeAlias: string;
  createDate: string;
  id: string;
  name: string;
  updateDate: string;
  currentVersionState: string;
}
