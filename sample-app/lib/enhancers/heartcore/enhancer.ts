import getConfig from 'next/config';
import { Client, ClientOptions } from '@umbraco/headless-client';
import { createHeartcoreEnhancer } from './createEnhancer';

const { serverRuntimeConfig } = getConfig();
const { UMBRACO_HEARTCORE_PROJECT_ALIAS, UMBRACO_HEARTCORE_API_KEY } = serverRuntimeConfig;

export const heartcoreEnhancer = () => {
  if (!UMBRACO_HEARTCORE_PROJECT_ALIAS) {
    throw new Error('UMBRACO_HEARTCORE_PROJECT_ALIAS env not set.');
  }

  if (!UMBRACO_HEARTCORE_API_KEY) {
    throw new Error('UMBRACO_HEARTCORE_API_KEY env not set.');
  }

  const client = new Client({
    projectAlias: UMBRACO_HEARTCORE_PROJECT_ALIAS,
    apiKey: UMBRACO_HEARTCORE_API_KEY,
  } as ClientOptions);

  return createHeartcoreEnhancer({
    clients: client,
  });
};
