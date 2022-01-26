import { Client, ClientOptions } from '@umbraco/headless-client';
import { ProjectSettings } from '../types/types';

export const useContentManagementClient = (settings: ProjectSettings) => {
  return new Client({
    projectAlias: settings.projectAlias,
    apiKey: settings.apiKey
  } as ClientOptions);
};