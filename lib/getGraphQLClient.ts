import { GraphQLClient } from 'graphql-request';
import { ProjectSettings } from '../types/types';

export const getGraphQLClient = (settings: ProjectSettings) => {
  const client = new GraphQLClient('https://graphql.umbraco.io');
  client.setHeaders({
    'Umb-Project-Alias': settings.projectAlias,
    'Api-Key': settings.apiKey,
  });
  return client;
};