import React from 'react';
import {
  Callout,
  LoadingIndicator,
  useUniformMeshLocation,
  ScrollableList,
  ScrollableListItem,
  InputToggle,
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

  const handleContentTypeSelectorSetValue = async ({
    allowMultiselect,
    allowedContentTypes,
  }: {
    allowedContentTypes: ContentTypeMap | undefined;
    allowMultiselect: boolean | undefined;
  }) => {
    await setConfig({
      ...config,
      allowedContentTypes,
      allowMultiselect,
    });
  };

  const handleLinkedSourceSelect = async (value: LinkedSource) => {
    await setConfig({
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

      {config?.source && projectSettings?.apiKey ? (
        <>
          <ContentTypeSelector
            projectSettings={projectSettings}
            setValue={handleContentTypeSelectorSetValue}
            value={{
              allowedContentTypes: config?.allowedContentTypes,
              allowMultiselect: config?.allowMultiselect,
            }}
          />
        </>
      ) : (
        <Callout type="error">
          It appears the Heartcore integration is not configured. Please visit the &quot;Settings &gt;
          Heartcore&quot; page to provide information for connecting to Heartcore.
        </Callout>
      )}
    </>
  );
}

interface ContentTypeSelectorProps {
  setValue: (value: {
    allowedContentTypes: ContentTypeMap | undefined;
    allowMultiselect: boolean | undefined;
  }) => Promise<void>;
  value: { allowedContentTypes: ContentTypeMap | undefined; allowMultiselect: boolean | undefined };
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
    // If no content types have been created in the project, the api response will
    // be an object with an irrelevant `_links` property, not an empty array like
    // the client typings would suggest.
    if (!Array.isArray(result)) {
      return [];
    }

    return result as (ContentTypeBase & ContentTypeBaseGroup)[];
  }, [projectSettings]);

  const handleContentTypeSelect = async (contentType: ContentTypeBase & ContentTypeBaseGroup) => {
    const allowedContentTypes = {
      ...(value.allowedContentTypes || {}),
    };
    allowedContentTypes[contentType.alias] = allowedContentTypes[contentType.alias]
      ? undefined
      : { alias: contentType.alias, name: contentType.name };

    await setValue({ allowedContentTypes, allowMultiselect: value.allowMultiselect });
  };

  const toggleAllowMultiselect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await setValue({ allowMultiselect: e.target.checked, allowedContentTypes: value.allowedContentTypes });
  };

  return (
    <div>
      {loading ? <LoadingIndicator /> : null}
      {Array.isArray(contentTypes) ? (
        <div data-test-id="content-type-selector">
          {contentTypes.length === 0 ? (
            <Callout type="caution">
              No content types were found for project {projectSettings.projectAlias}
            </Callout>
          ) : (
            <div className="space-y-2">
              <ScrollableList label="Allowed Content Types">
                {contentTypes.map((item) => {
                  const isActive = Boolean(
                    value.allowedContentTypes ? value.allowedContentTypes[item.alias] : false
                  );

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
              <InputToggle
                label="Allow multi-selection"
                name="allowMultiSelection"
                type="checkbox"
                onChange={toggleAllowMultiselect}
                checked={value.allowMultiselect}
              />
            </div>
          )}
        </div>
      ) : null}
      {error ? <Callout type="error">{error.message}</Callout> : null}
    </div>
  );
}
