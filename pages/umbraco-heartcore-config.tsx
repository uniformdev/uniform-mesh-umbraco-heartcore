import React from 'react';
import {
  Callout,
  LoadingIndicator,
  useUniformMeshLocation,
  Icons,
  ScrollableList,
  ScrollableListItem,
} from '@uniformdev/mesh-sdk-react';
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

  const handleContentTypeSelect = async (contentType:ContentTypeBase & ContentTypeBaseGroup) => {
    const allowedContentTypes = {
      ...(value || {}),
    };
    allowedContentTypes[contentType.alias] = allowedContentTypes[contentType.alias]
      ? undefined
      : { alias: contentType.alias, name: contentType.name };

    await setValue(allowedContentTypes);
  };

  return (
    <div>
      {loading ? <LoadingIndicator /> : null}
      {Array.isArray(contentTypes) ? (
        <div data-test-id="content-type-selector">
          {contentTypes.length === 0 ? (
            <Callout type="caution">No content types were found for project {projectSettings.projectAlias}</Callout>
          ) : (
            <ScrollableList label="Allowed Content Types">
              {contentTypes.map((item) => {
                const isActive = Boolean(value ? value[item.alias] : false);

                return (
                  <div key={item.alias} className="mb-2">
                    <ScrollableListItem
                      buttonText={item.name}
                      active={isActive}
                      onClick={() => handleContentTypeSelect(item)}
                    />
                  </div>
                );
              })}
            </ScrollableList>
          )}
        </div>
      ) : null}
      {error ? <Callout type="error">{error.message}</Callout> : null}
    </div>
  );
};
