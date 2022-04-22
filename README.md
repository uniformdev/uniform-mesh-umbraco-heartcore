# Umbraco Heartcore + Uniform Mesh

Umbraco Heartcore app built with Uniform Mesh SDK.

## Mesh App (`/mesh-app`)

### Development

In development the app can be served from `localhost` via:

```
cd mesh-app
npm i
npm run dev
```

### Location config

Use the following location configuration to create a private integration:

```
{
  "baseLocationUrl": "http://localhost:4030",
  "locations": {
    "canvas": {
      "parameterTypes": [
        {
          "type": "heartcore",
          "displayName": "Umbraco Heartcore",
          "configureUrl": "/umbraco-heartcore-config",
          "editorUrl": "/umbraco-heartcore-editor"
        }
      ]
    },
    "install": {
      "description": [
        "Integrating Uniform with Umbraco Heartcore allows business users to have complete control over presentation layer compositions - assembled from existing items in Umbraco Heartcore - without losing the freedom and flexibility of a headless architecture.",
        "Uniform allows business users to personalize and A/B test content sourced from Umbraco Heartcore without developer effort."
      ]
    },
    "settings": {
      "url": "/settings"
    }
  }
}
```

## Sample App (`/sample-app`)

### Development

A sample Uniform Canvas app with a Umbraco Heartcore enhancer can be found in `sample-app/`.

Copy `.env.example` to `.env` and set env variables to hold details of your Uniform and Umbraco Heartcore projects.

To run the app:

```
cd sample-app
npm i
npm run dev
```

### Enhancer

`lib/enhancers.ts` exports a Umbraco Heartcore enhancer.

