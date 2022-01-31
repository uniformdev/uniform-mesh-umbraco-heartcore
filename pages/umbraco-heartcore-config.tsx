import React from 'react';
import { Callout, LoadingIndicator, useUniformMeshLocation, Icons } from '@uniformdev/mesh-sdk-react';
import { useAsync } from 'react-use';
import {
  CanvasItemSelectorConfigValue,
  CanvasItemSelectorConfigMetadataValue,
  ProjectSettings,
  LinkedSource,
  ContentTypeMap,
} from '../types/types';
import { LinkedSourceSelect } from '../components/LinkedSourceSelect';
import { getContentManagementClient } from '../lib/getContentManagementClient';
import { ContentTypeBase, ContentTypeBaseGroup } from '@umbraco/headless-client';

export default function HeartcoreConfig() {
  const {
    value: config,
    setValue: setConfig,
    metadata,
  } = useUniformMeshLocation<CanvasItemSelectorConfigValue, CanvasItemSelectorConfigMetadataValue>();

  const handleAllowedContentTypesSetValue = (allowedContentTypes: ContentTypeMap | undefined) => {
    setConfig({ ...config, allowedContentTypes });
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
        <ContentTypeSelector
          projectSettings={projectSettings}
          setValue={handleAllowedContentTypesSetValue}
          value={config.allowedContentTypes}
        />
      ) : null}
    </>
  );
}

interface ContentTypeSelectorProps {
  setValue: (value: ContentTypeMap) => void;
  value: ContentTypeMap | undefined;
  projectSettings: ProjectSettings;
}

function ContentTypeSelector({ projectSettings, value, setValue }: ContentTypeSelectorProps) {
  const {
    loading,
    error,
    value: contentTypes,
  } = useAsync(async () => {
    if (!projectSettings) {
      return;
    }

    //eslint-disable-next-line
    const client = getContentManagementClient(projectSettings);

    const result = await client.management.contentType.all();

    return result as (ContentTypeBase & ContentTypeBaseGroup)[];
  }, [projectSettings]);

  const handleMenuItemClick = (contentType: ContentTypeBase & ContentTypeBaseGroup) => {
    // If the clicked content type id already exists in the provided state value,
    // set the content type id value to 'undefined' in the stored object.
    // This makes updating the state value less complex.
    // note: we can't mutate `value` directly as it is read-only/frozen, so spread the existing
    // value into a new object if it exists.
    const allowedContentTypes = {
      ...(value || {}),
    };
    allowedContentTypes[contentType.alias] = allowedContentTypes[contentType.alias]
      ? undefined
      : { alias: contentType.alias, name: contentType.name };

    setValue(allowedContentTypes);
  };

  return (
    <div className="relative">
      <label className="uniform-input-label">Allowed ContentTypes</label>
      {loading ? <LoadingIndicator /> : null}
      {Array.isArray(contentTypes) ? (
        <div
          className="overflow-y-auto p-2 bg-gray-100 border-t border-b border-gray-300 space-y-2 max-h-96"
          data-test-id="content-type-selector"
        >
          {contentTypes.length === 0 ? (
            <Callout type="caution">
              No content types were found for project {projectSettings?.projectAlias}
            </Callout>
          ) : (
            contentTypes.map((contentType, index) => {
              const active = Boolean(value ? value[contentType.alias] : false);
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 bg-white border-2 rounded-md shadow-md ${
                    active ? 'border-green-500' : 'border-gray-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleMenuItemClick(contentType)}
                    className="flex items-center justify-between w-full outline-none focus:outline-none"
                  >
                    <span>{contentType.name}</span>
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
