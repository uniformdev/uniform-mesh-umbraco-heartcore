import React from 'react';
import {
  CanvasItemSelectorEditorMetadataValue,
  CanvasItemSelectorEditorValue,
  LinkedSource,
  ProjectSettings,
  ContentTypeMap,
  ContentType,
  ContentItem,
} from '../types/types';
import {
  Callout,
  EntrySearch,
  EntrySearchContentType,
  EntrySearchResult,
  useUniformMeshLocation,
} from '@uniformdev/mesh-sdk-react';
import { useAsync, useAsyncFn, useMountedState } from 'react-use';
import { format as timeAgo } from 'timeago.js';
import LogoIcon from '../public/heartcore-badge.png';
import { getGraphQLClient } from '../lib/getGraphQLClient';
import { getContentManagementClient } from '../lib/getContentManagementClient';
import { gql } from 'graphql-request';
import { ContentManagementContent } from '@umbraco/headless-client';

const queryAllByType = gql`
  query allContent($where: ContentFilterInput) {
    allContent(preview: true, where: $where) {
      items {
        id
        name
        updateDate
        createDate
        url
        contentTypeAlias
      }
    }
  }
`;

export default function HeartcoreEditor() {
  const { value, setValue, metadata } = useUniformMeshLocation<
    CanvasItemSelectorEditorValue | undefined,
    CanvasItemSelectorEditorMetadataValue
  >();

  // Parameter value stores the linked source id within the parameter value.
  // But the parameter config may (or may not) also have a linked environment configured.
  // If the parameter value is defined, attempt to use the linked environment info from the value.
  // Else attempt to use the linked environment info from parameter config.
  // If neither are defined, we can't render the search component and show a message instead.
  const sourceId = value?.source || metadata.parameterConfiguration?.source || 'default';
  const resolvedLinkedSource = metadata.settings.linkedSources?.find((ls) => ls.id === sourceId);
  if (resolvedLinkedSource?.project?.apiKey) {
    return (
      <>
        <label className="flex items-center font-bold">{metadata.parameterDefinition.name}</label>
        <ItemSearch
          linkedSource={resolvedLinkedSource}
          allowedContentTypes={metadata.parameterConfiguration?.allowedContentTypes}
          value={value}
          setValue={setValue}
          multiselect={metadata.parameterConfiguration?.allowMultiselect}
        />
      </>
    );
  }

  return null;
}

function ItemSearch({
  linkedSource,
  allowedContentTypes,
  value,
  setValue,
  multiselect,
}: {
  linkedSource: LinkedSource;
  allowedContentTypes: ContentTypeMap | undefined;
  value: CanvasItemSelectorEditorValue | undefined;
  setValue: (value: CanvasItemSelectorEditorValue) => Promise<void>;
  multiselect?: boolean;
}) {
  const isMounted = useMountedState();

  const [searchState, handleSearch] = useSearchItems({
    allowedContentTypes,
    convertItemToSearchResult: convertItemToSearchResultFn,
    projectSettings: linkedSource.project,
  });

  const { error: selectedItemsError, selectedItems } = useSelectedItems({
    convertItemToSearchResult: convertItemToSearchResultFn,
    itemIds: value?.ids,
    projectSettings: linkedSource.project,
    allowedContentTypes,
  });

  // Don't continue if the component was unmounted for some reason while search query was running.
  if (!isMounted()) {
    return null;
  }

  // content type objects used by the component search.
  const contentTypeOptions = allowedContentTypes
    ? Object.values(allowedContentTypes)
        ?.filter((contentType) => Boolean(contentType))
        ?.map<EntrySearchContentType>((contentType) => ({
          id: contentType!.alias,
          name: contentType!.name,
        }))
    : undefined;

  const handleSelect = async (ids: string[]) => {
    await setValue({
      ids,
      source: linkedSource.id,
    });
  };

  if (searchState.error) {
    return <Callout type="error">{searchState.error.message}</Callout>;
  }

  if (selectedItemsError) {
    return <Callout type="error">{selectedItemsError.message}</Callout>;
  }

  return (
    <EntrySearch
      contentTypes={contentTypeOptions}
      search={handleSearch}
      results={searchState.value}
      logoIcon={LogoIcon.src}
      multiSelect={multiselect}
      selectedItems={selectedItems}
      select={handleSelect}
      requireContentType={true}
      onSort={handleSelect}
    />
  );
}

function convertItemToSearchResultFn({
  item,
  selectedContentType,
}: {
  item: ContentItem;
  selectedContentType: ContentType | undefined;
}): EntrySearchResult {
  return {
    id: item.id,
    title: item.name,
    metadata: {
      Type: selectedContentType?.alias || 'Unknown',
      Created: <span>{timeAgo(item.createDate)}</span>,
      Updated: <span>{timeAgo(item.updateDate)}</span>,
      State: item.currentVersionState,
    },
  };
}

function useSelectedItems({
  projectSettings,
  itemIds,
  convertItemToSearchResult,
  allowedContentTypes,
}: {
  projectSettings: ProjectSettings;
  itemIds: string[] | undefined;
  convertItemToSearchResult: typeof convertItemToSearchResultFn;
  allowedContentTypes: ContentTypeMap | undefined;
}) {
  const { loading, error, value } = useGetItemsById({ projectSettings, itemIds });

  const resolveSelectedItems = () => {
    if (!itemIds) {
      return;
    }

    if (!value && !loading) {
      return itemIds.map((itemId) => ({
        id: itemId,
        title: `Unresolvable (${JSON.stringify(itemId)})`,
      }));
    } else if (loading) {
      return itemIds.map((itemId) => ({
        id: itemId,
        title: `Loading...`,
      }));
    }

    const results = value?.map((obj: ContentManagementContent) => {
      const resolvedContentType = allowedContentTypes ? allowedContentTypes[obj.contentTypeAlias] : undefined;
      const item = {
        id: obj._id,
        name: obj.name.$invariant,
        createDate: obj._createDate,
        updateDate: (obj._updateDate as any).$invariant,
        contentTypeAlias: obj.contentTypeAlias,
        currentVersionState: obj._currentVersionState.$invariant,
      } as ContentItem;
      return convertItemToSearchResult({ item, selectedContentType: resolvedContentType });
    });

    return results;
  };

  const selectedItems = resolveSelectedItems();

  return { selectedItems, error };
}

function useGetItemsById({
  projectSettings,
  itemIds,
}: {
  projectSettings: ProjectSettings;
  itemIds: string[] | undefined;
}) {
  const sortedItemIds = [...(itemIds || [])].sort();

  const { loading, error, value } = useAsync(async () => {
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return;
    }

    const itemsPromises = [];
    const client = getContentManagementClient(projectSettings);
    for (const id of itemIds) {
      if (id) itemsPromises.push(await client.management.content.byId(id));
    }

    const items = await Promise.all(itemsPromises);
    return items as ContentManagementContent[];
  }, [
    projectSettings,
    // create a string value of the sortedItemIds so that the hook dependency check is accurate.
    // otherwise, the dependency check is referential only, so if the itemId array is "new" in between
    // calls the hook will always run (which we're trying to avoid).
    sortedItemIds?.join(','),
  ]);

  return { loading, error, value };
}

function useSearchItems({
  allowedContentTypes,
  projectSettings,
  convertItemToSearchResult,
}: {
  allowedContentTypes: ContentTypeMap | undefined;
  projectSettings: ProjectSettings;
  convertItemToSearchResult: typeof convertItemToSearchResultFn;
}) {
  // `useAsyncFn` instead of `useAsync` so that we can control when
  // the `search` function is invoked (and do something meaningful afterwards).
  return useAsyncFn(
    async (text: string, options?: { contentType?: string }) => {
      // We require a content type selection for searching otherwise the results list could be stupid long.
      if (!allowedContentTypes || !options?.contentType) {
        return;
      }

      const selectedContentType = Object.values(allowedContentTypes).find(
        (contentType) => contentType?.alias === options.contentType
      );

      // If the selected content type somehow doesn't map to an allowed content type we are in a bad state.
      if (!selectedContentType) {
        return;
      }

      let variables = {
        where: { contentTypeAlias: selectedContentType.alias },
      } as any;

      if (text.length > 0) {
        variables = {
          where: {
            AND: [{ contentTypeAlias: selectedContentType.alias }, { name_contains: text }],
          },
        };
      }

      const gqclient = getGraphQLClient(projectSettings);
      const result = await gqclient.request(queryAllByType, variables);
      const items = result.allContent.items;

      if (items) {
        const mappedResults = items.map((item: any) =>
          convertItemToSearchResult({
            item,
            selectedContentType,
          })
        );
        return mappedResults as EntrySearchResult[];
      }
      return undefined;
    },
    [allowedContentTypes, projectSettings, convertItemToSearchResult]
  );
}
