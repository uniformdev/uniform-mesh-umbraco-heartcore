This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Location configuration in Uniform

Add an external integration in the Uniform dashboard and use the following for the `Location Configuration` field:

```
{
  "baseLocationUrl": "http://localhost:4000",
  "locations": {
    "install": {
      "description": [
        "Umbraco Heartcore"
      ]
    },
    "settings": {
      "url": "/settings"
    },
    "canvas": {
      "parameterTypes": [
        {
          "type": "heartcore",
          "displayName": "Umbraco Heartcore",
          "configureUrl": "/umbraco-heartcore-config",
          "editorUrl": "/umbraco-heartcore-editor"
        }
      ]
    }
  }
}
```

# Location configuration notes

- `baseLocationUrl` is used to prefix URL paths for specific locations. For instance, the `settings.url` property in the JSON above is `/settings`. When that location loads, the resolved URL will be `http://localhost:4000/settings`

- `locations` contains configuration data for each location where the integration may appear.
  - `install` is the `Project Settings > Integrations` page in the Uniform dashboard. The `install.description` property can be used to provide descriptive text that will be rendered when a user adds an integration.
  - `settings` is the integration-specific settings page that is available after an integration has been added. Typically this is where an integration is configured by adding API keys and other information for connecting to the 3rd party API.
  - `canvas` contains Canvas parameter type definitions. `type` and `displayName` are used when identifying Canvas parameters in a component definition. `configureUrl` specifies the URL that will be rendered when adding a Canvas parameter to a component definition. `editorUrl` specifis the URL that will be rendered when editing a Canvas parameter within the Composition editor.

# Next.js app

> note: Next.js is _not_ required for creating a Mesh integration app, we're just using it as an example.

The idea behind a Mesh integration app is that it will serve up the UI for the locations defined in the integration configuration in Uniform dashboard.

The sample app does this by creating a page (route) corresponding to each integration location. In the `pages` folder you'll see:

- `settings.tsx`
- `umbraco-heartcore-config.tsx`
- `umbraco-heartcore-editor.tsx`

As mentioned, each page corresponds to an integration location. This works great for page-based app frameworks like Next/Nuxt. For non-page-based apps, you'll probably want to consider using a router or using querystring values to determine which integration location is being requested and which component(s) to render for a location.

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Once the app is running, you can adjust the integration configuration in Uniform dashboard to utilize your app URL for rendering locations.

# Mesh SDK

The Mesh SDK provides the mechanics for interacting with the Uniform dashboard for a given location.

## Initialization

The SDK needs to be initialized before you can access location data or save location data. The initialization process handles establishing a connection with the Uniform dashboard (via iframe / `postMessage` communication) and obtaining location-specific data from the dashboard. Once initialized, the SDK can be used to get and set location data.

Once initialized, the Mesh SDK can be accessed via the `window.UniformMeshSDK` property.

### VanillaJS

```
import { initializeUniformMeshSDK } from '@uniformdev/mesh-sdk';

if (typeof window !== 'undefined' && typeof window.UniformMeshSDK === 'undefined') {
  initializeUniformMeshSDK()
    .then((sdk) => {
      // do something with `sdk` if you want, otherwise just render your app/component
    })
    .catch((err) => {
      // there was an error during initialization
    });
}

```

### React

For React-based apps, use the `pages/_app.tsx` code as an example. We provide a React hook for straightforward initialization.

```
import type { AppProps } from 'next/app';
import { UniformMeshSdkContextProvider, useInitializeUniformMeshSdk } from '@uniformdev/mesh-sdk-react';

function App({ Component, pageProps }: AppProps) {
  const { initializing, error } = useInitializeUniformMeshSdk();

  if (error) {
    throw error;
  }

  // Some apps may want to show a splash screen while the SDK is initializing, but we render `null` for simplicity.
  return initializing ? null : (
    <UniformMeshSdkContextProvider>
      <Component {...pageProps} />
    </UniformMeshSdkContextProvider>
  );
}
```

The `UniformMeshSdkContextProvider` provides the initialized Mesh SDK instance to any Mesh SDK context consumers.

## Location data via Mesh SDK

Once initialized, you can use the Mesh SDK to get/set data for the current location. All locations currently have the same interface:

```
interface MeshLocation<TValue = unknown, TMetadata = unknown> {
  getValue: () => TValue;
  setValue: (value: TValue) => Promise<void>;
  getMetadata: () => TMetadata;
}
```

- `getValue` - returns the current location data. This is a synchronous method,
- `getMetadata` - returns the current location metadata. Metadata will contain arbitrary data for a location and may not be location-specific. For instance, metadata may contain integration configuration data from Uniform dashboard. Another example is the Canvas editor location - that location will receive Canvas parameter and component information in the `metadata` object. Also note that not all locations will have metadata. `getMetadata` is a synchronous method.
- `setValue` - sends a value for the current location to the Uniform dashboard for storage. This is an asynchronous method, so it is important to `await` the method before expecting the location value from `getValue` to be updated.

### VanillaJS

```
const location = window.UniformMeshSDK.getCurrentLocation();

// for typescript, you can provide types for the location value and location metadata:
// const location = window.UniformMeshSDK.getCurrentLocation<LocationData, LocationMetadata>();

// note: `value` and/or `metadata` may be undefined, be sure to conditionally access their properties,
// e.g. `value?.someProperty`
const locationValue = location.getValue();
const locationMetadata = location.getMetadata();

async function valueChanged(newValue) {
  await location.setValue(newValue);
  // subsequent calls to `location.getValue()` will now contain the updated value.
}

```

> IMPORTANT: if your code is going to run during server-side rendering (SSR) or static site generation (SSG), then be sure you're checking for `window` to be defined before attempting to reference the Mesh SDK. e.g.

```
if (typeof window !== 'undefined') {
  // it is safe to reference window.UniformMeshSDK here
}
```

### React

For React-based apps, use the `pages/settings.tsx`, `pages/umbraco-heartcore-config.tsx`, or `pages/umbraco-heartcore-editor.tsx` code as an example. We provide a React hook for straightforward access to the current location.

```
import { useUniformMeshLocation } from '@uniformdev/mesh-sdk-react';

export default function MyLocation() {
  // note: `value` and/or `metadata` may be undefined, be sure to conditionally access their properties,
  // e.g. `value?.someProperty`
  const { value, setValue, metadata } = useUniformMeshLocation();

  const handleChange = async (e) => {
    await setValue({ something: e.target.value });
  };

  return (
    <div>
      <input type="text" name="something" onChange={handleChange} value={value?.something || ''} />
    </div>
  );
}

```

> IMPORTANT: the `useUniformMeshLocation` hook expects to be used as a descendant of a `UniformMeshLocationContextProvider` context provider. This happens automatically for you if you use the `UniformMeshSdkContextProvider`.
