import { GraphQLClient } from 'graphql-request';
import { EditorMetadataValue } from '../types/types';

export const useGraphQLClient = (metadata: EditorMetadataValue) => {
  const client = new GraphQLClient('https://graphql.umbraco.io');
  client.setHeaders({
    'Umb-Project-Alias': metadata.settings.projectAlias,
    'Api-Key': metadata.settings.apiKey,
  });
  return client;
};