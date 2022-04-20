/* eslint-disable no-console */
import { ComponentParameterEnhancer, LimitPolicy, createLimitPolicy } from '@uniformdev/canvas';

import { isParameterValueDefined, parameterIsEntry } from './entryParameter';
import { EditorValue } from './entryParameter';
import { Client, Content } from '@umbraco/headless-client';

export type CreateHeartcoreEnhancerOptions = {
  clients: Client;
  limitPolicy?: LimitPolicy;
};

export const CANVAS_Heartcore_PARAMETER_TYPES = Object.freeze(['HeartcoreEntry']);

export function createHeartcoreEnhancer({
  clients,
  limitPolicy,
}: CreateHeartcoreEnhancerOptions): ComponentParameterEnhancer<EditorValue, Content[] | undefined> {
  if (!clients) {
    throw new Error(
      'No Heartcore clients were provided to the enhancer. You must provide at least one client via the HeartcorefulClientList.'
    );
  }

  const finalLimitPolicy =
    limitPolicy ||
    createLimitPolicy({
      // per https://docs.Heartcore.ai/reference/delivery-api#section/Rate-limitation:
      // there is a rate limit of 100/second and 2000/minute for uncached data.
      // 2000 / 60 = 33.3333
      throttle: {
        limit: 33,
        interval: 1000,
      },
    });

  return {
    enhanceOne: async function HeartcoreEnhancer({ parameter }) {
      if (parameterIsEntry(parameter)) {
        if (!isParameterValueDefined(parameter.value)) {
          return undefined;
        }

        const client = clients as Client;
        const promises = parameter.value!.ids.map((id) => client.delivery.content.byId(id));

        const entries = await Promise.all(promises);

        return entries.filter((entry) => Boolean(entry)) as Content[];
      }
    },
    limitPolicy: finalLimitPolicy,
  };
}
