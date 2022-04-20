import { EnhancerBuilder } from '@uniformdev/canvas';
import getConfig from 'next/config';

import { heartcoreEnhancer } from './heartcore/enhancer';
import { HEARTCORE_CANVAS_PARAMETER_TYPES } from './heartcore/entryParameter';

const { serverRuntimeConfig } = getConfig();
const { UMBRACO_HEARTCORE_PROJECT_ALIAS, UMBRACO_HEARTCORE_API_KEY } = serverRuntimeConfig;

const configured = Boolean(UMBRACO_HEARTCORE_PROJECT_ALIAS && UMBRACO_HEARTCORE_API_KEY);

// eslint-disable-next-line no-console
console.warn(
  configured
    ? '✅  Heartcore enhancer is configured and enabled.'
    : "⚠️  Heartcore enhancer is not configured and therefore disabled. If that's unexpected, please check your env vars."
);

export const nullEnhancer = () => {
  return undefined;
};

export const enhancers = new EnhancerBuilder().parameterType(
  HEARTCORE_CANVAS_PARAMETER_TYPES,
  configured ? heartcoreEnhancer() : nullEnhancer
);
