import React, { useEffect } from 'react';
import {
  Callout,
  LoadingIndicator,
  useUniformMeshLocation,
  ScrollableList,
  ScrollableListItem,
  InputToggle,
  ValidationResult,
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

function validate(config: CanvasItemSelectorConfigValue): ValidationResult {
  if (
    !config ||
    !config.source ||
    !config.allowedContentTypes ||
    Object.values(config.allowedContentTypes).every((val) => typeof val === 'undefined')
  ) {
    return {
      isValid: false,
      validationMessage: 'At least one content type must be selected.',
    };
  }
  return {
    isValid: true,
  };
}

export default function HeartcoreConfig() {
  const {
    value: config,
    setValue: setConfig,
    metadata,
    setValidationResult,
  } = useUniformMeshLocation<CanvasItemSelectorConfigValue, CanvasItemSelectorConfigMetadataValue>();

  useEffect(
    () => {
      const runEffect = async () => {
        await setValidationResult(validate(config));
      };
      runEffect();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleContentTypeSelectorSetValue = async (allowedContentTypes: ContentTypeMap | undefined) => {
    const newConfig = {
      ...config,
      allowedContentTypes,
    };
    await setConfig(newConfig, validate(newConfig));
  };

  const handleLinkedSourceSelect = async (value: LinkedSource) => {
    await setConfig(
      {
        ...config,
        source: value.id,
      },
      { isValid: true }
    );
  };

  const toggleAllowMultiselect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfig = { ...config, allowMultiselect: e.target.checked };
    await setConfig(newConfig, validate(newConfig));
  };

  const handleRequiredToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfig = { ...config, required: e.target.checked };
    await setConfig(newConfig, validate(newConfig));
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
        <div className="space-y-4">
          <ContentTypeSelector
            projectSettings={projectSettings}
            setValue={handleContentTypeSelectorSetValue}
            value={config?.allowedContentTypes}
          />
          <InputToggle
            label="Allow multi-selection"
            name="allowMultiSelection"
            type="checkbox"
            onChange={toggleAllowMultiselect}
            checked={config?.allowMultiselect}
          />
          <InputToggle
            label="Required"
            name="required"
            type="checkbox"
            caption="Requires users to select at least one item from the Umbraco Heartcore item selector"
            checked={Boolean(config?.required)}
            onChange={handleRequiredToggle}
          />
        </div>
      ) : null}
    </>
  );
}

interface ContentTypeSelectorProps {
  setValue: (value: ContentTypeMap) => Promise<void>;
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
            <Callout type="caution">
              No content types were found for project {projectSettings.projectAlias}
            </Callout>
          ) : (
            <div className="space-y-2">
              <ScrollableList label="Allowed Content Types">
                {contentTypes.map((item) => {
                  const isActive = Boolean(value ? value[item.alias] : false);

                  return (
                    <ScrollableListItem
                      buttonText={item.name}
                      active={isActive}
                      onClick={() => handleContentTypeSelect(item)}
                      key={item.alias}
                    />
                  );
                })}
              </ScrollableList>
            </div>
          )}
        </div>
      ) : null}
      {error ? <Callout type="error">{error.message}</Callout> : null}
    </div>
  );
}
