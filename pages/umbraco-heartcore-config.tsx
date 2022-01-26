import React from 'react';
import { Callout, LoadingIndicator, useUniformMeshLocation, Icons } from '@uniformdev/mesh-sdk-react';
import { useAsync } from 'react-use';
import {
  CanvasItemSelectorConfigValue,
  CanvasItemSelectorConfigMetadataValue,
  ProjectSettings,
  LinkedSource,
  TemplateMap,
} from '../types/types';
import { LinkedSourceSelect } from '../components/LinkedSourceSelect';
import { useContentManagementClient } from '../hooks/useContentManagementClient';
import { ContentTypeBase } from '@umbraco/headless-client';

export default function HeartcoreConfig() {
  const {
    value: config,
    setValue: setConfig,
    metadata,
  } = useUniformMeshLocation<CanvasItemSelectorConfigValue, CanvasItemSelectorConfigMetadataValue>();

  const handleAllowedTemplatesSetValue = (allowedTemplates: TemplateMap | undefined) => {
    setConfig({ ...config, allowedTemplates });
  };

  const handleLinkedSourceSelect = (value: LinkedSource) => {
    setConfig({
      ...config,
      source: value.id,
    });
  };

  const selectedLinkedSource = metadata.settings.linkedSources?.find((ls) => ls.id === config?.source);
  const projectSettings = selectedLinkedSource?.project;

  return (
    <>
      {!metadata.settings.linkedSources ? (
        <Callout type="error">
          It appears the Heartcore integration is not configured. Please visit the &quot;Settings &gt;
          Heartcore&quot; page to provide information for connecting to Heartcore.
        </Callout>
      ) : (
        <LinkedSourceSelect
          selectedLinkId={config?.source}
          onLinkSelect={handleLinkedSourceSelect}
          linkedSources={metadata.settings.linkedSources}
        />
      )}

      {config?.source && projectSettings ? (
        <TemplateSelector
          projectSettings={projectSettings}
          setValue={handleAllowedTemplatesSetValue}
          value={config.allowedTemplates}
        />
      ) : null}
    </>
  );
}

interface TemplateSelectorProps {
  setValue: (value: TemplateMap) => void;
  value: TemplateMap | undefined;
  projectSettings: ProjectSettings;
}

function TemplateSelector({ projectSettings, value, setValue }: TemplateSelectorProps) {
  const {
    loading,
    error,
    value: templates,
  } = useAsync(async () => {
    if (!projectSettings) {
      return;
    }

    const client = useContentManagementClient(projectSettings);

    const result = await client.management.contentType.all();

    return result;
  }, [projectSettings]);

  const handleMenuItemClick = (template: ContentTypeBase) => {
    setValue({
      ...value,
      id: template.alias,
    });
  };

  return (
    <div className="relative">
      <label className="uniform-input-label">Allowed Templates</label>
      {loading ? <LoadingIndicator /> : null}
      {Array.isArray(templates) ? (
        <div
          className="overflow-y-auto p-2 bg-gray-100 border-t border-b border-gray-300 space-y-2 max-h-96"
          data-test-id="content-type-selector"
        >
          {templates.length === 0 ? (
            <Callout type="caution">
              No templates were found for project {projectSettings?.projectAlias}
            </Callout>
          ) : (
            templates.map((template, index) => {
              const active = Boolean(value ?? false);
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 bg-white border-2 rounded-md shadow-md ${
                    active ? 'border-green-500' : 'border-gray-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleMenuItemClick(template)}
                    className="flex items-center justify-between w-full outline-none focus:outline-none"
                  >
                    <span>{template.alias}</span>
                    {active ? <Icons.Checkmark className="block h-6 w-6 text-green-500" /> : null}
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : null}
      {error ? <Callout type="error">{error.message}</Callout> : null}
    </div>
  );
}
