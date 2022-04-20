import { CanvasClient } from '@uniformdev/canvas';
import getConfig from 'next/config';

const {
  serverRuntimeConfig: { UNIFORM_API_KEY, UNIFORM_CANVAS_API_HOST, UNIFORM_PROJECT_ID },
} = getConfig();

export const canvasClient = new CanvasClient({
  apiKey: UNIFORM_API_KEY,
  apiHost: UNIFORM_CANVAS_API_HOST,
  projectId: UNIFORM_PROJECT_ID,
});
