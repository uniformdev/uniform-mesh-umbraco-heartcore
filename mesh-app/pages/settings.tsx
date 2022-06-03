import React, { useEffect, useState } from 'react';
import {
  useUniformMeshLocation,
  Input,
  Button,
  Callout,
  LoadingOverlay,
  Heading,
} from '@uniformdev/mesh-sdk-react';
import { ProjectSettings, SettingsValue } from '../types/types';

export default function Settings() {
  const { value, setValue } = useUniformMeshLocation<SettingsValue>();

  const handleSettingsChange = async (settings: ProjectSettings) => {
    const valid = await validateApiConnection({
      apiKey: settings.apiKey,
      projectAlias: settings.projectAlias,
    });

    if (!valid.contentManagementValid) {
      throw new Error(
        'It appears that the provided settings are not able to access the Umbraco Heartcore Content Management API. Please check the settings and try again.'
      );
    } else if (!valid.graphQLValid) {
      throw new Error(
        'It appears that the provided settings are not able to access the Umbraco Heartcore GraphQL API. Please ensure that the project you are trying to connect to has GraphQL API access included or check the settings and try again.'
      );
    } else {
      await setValue({
        linkedSources: [
          {
            id: 'default',
            project: settings,
          },
        ],
      });
    }
  };

  return (
    <>
      <Heading level={2}>Umbraco Heartcore settings</Heading>
      <SettingsInner settings={value?.linkedSources?.[0].project} onSettingsChange={handleSettingsChange} />
    </>
  );
}

type FormState = Partial<ProjectSettings> & { isSubmitting: boolean; saveSuccess: boolean };

const SettingsInner = ({
  settings,
  onSettingsChange,
}: {
  settings: ProjectSettings | undefined;
  onSettingsChange: (settings: ProjectSettings) => Promise<void>;
}) => {
  const [formState, setFormState] = useState<FormState>({
    apiKey: '',
    projectAlias: '',
    server: '',
    isSubmitting: false,
    saveSuccess: false,
  });
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    setFormState((prev) => {
      return {
        ...prev,
        apiKey: settings?.apiKey || '',
        projectAlias: settings?.projectAlias || '',
        server: settings?.server || '',
      };
    });
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(undefined);
    setFormState((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
        saveSuccess: false,
      };
    });
  };

  const handleSubmit = async () => {
    if (!formState.apiKey || !formState.projectAlias) {
      setError(new Error('Be sure to provide a Project Id, Project URL, API Username, and API Key'));
      return;
    }

    setError(undefined);
    setFormState((prev) => ({
      ...prev,
      isSubmitting: true,
      saveSuccess: false,
    }));

    try {
      await onSettingsChange({
        apiKey: formState.apiKey!,
        projectAlias: formState.projectAlias!,
        server: formState.server,
      });

      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        saveSuccess: true,
      }));
    } catch (err) {
      setError(err);
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        saveSuccess: false,
      }));
    }
  };

  return (
    <div className="space-y-4 relative">
      <LoadingOverlay isActive={formState.isSubmitting} />
      {error ? <Callout type="error">{error.message}</Callout> : null}
      {formState.saveSuccess ? <Callout type="success">Settings were saved successfully</Callout> : null}
      <div>
        <Input
          name="projectAlias"
          label="Project Alias"
          onChange={handleInputChange}
          value={formState.projectAlias}
        />
      </div>
      <div>
        <Input name="apiKey" label="API Key" onChange={handleInputChange} value={formState.apiKey} />
      </div>
      <div>
        <Input name="server" label="Server" onChange={handleInputChange} value={formState.server} />
        <small>
          Optional, is used for building edit link, example: euwest01
        </small>
      </div>
      <Button type="submit" buttonType="secondary" disabled={formState.isSubmitting} onClick={handleSubmit}>
        Save
      </Button>
    </div>
  );
};

async function validateApiConnection({ apiKey, projectAlias }: { apiKey: string; projectAlias: string }) {
  const [contentManagementResponse, graphQLResponse] = await Promise.all([
    fetch('https://api.umbraco.io', {
      headers: { 'Api-Key': apiKey, 'Umb-Project-Alias': projectAlias },
      method: 'GET',
    }),

    // We don't need a GraphQL client to make a test request to the GraphQL endpoint,
    // a simple POST will suffice.
    fetch('https://graphql.umbraco.io', {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
        'Umb-Project-Alias': projectAlias,
      },
      method: 'POST',
    }),
  ]);

  const result = {
    contentManagementValid: true,
    graphQLValid: true,
  };

  if (!contentManagementResponse.ok) {
    result.contentManagementValid = false;
  }

  if (graphQLResponse.ok) {
    const json = await graphQLResponse.json();
    if (Array.isArray(json['errors'])) {
      json['errors'].forEach((err) => {
        const message = err.message?.toLowerCase();
        if (message?.includes('does not have graphql') || message?.includes('permission denied')) {
          result.graphQLValid = false;
        }
      });
    }
  } else {
    result.graphQLValid = false;
  }

  return result;
}
