import { Client, ClientOptions } from '@umbraco/headless-client';
import { EditorMetadataValue } from '../types/types';

export const useContentManagementClient = (metadata: EditorMetadataValue) => {
  return new Client({
    projectAlias: metadata.settings.projectAlias,
    apiKey: metadata.settings.apiKey
  } as ClientOptions);
};