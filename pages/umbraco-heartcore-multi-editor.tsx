import React, { useState, useEffect } from 'react';
import { useUniformMeshLocation } from '@uniformdev/mesh-sdk-react';
import { MultiEditorValue, EditorMetadataValue } from '../types/types';
import { useGraphQLClient } from '../hooks/useGraphQLClient';
import { LoadingOverlay } from '../components/LoadingOverlay';
import Checkmark from 'icons/Checkmark';
import { gql } from 'graphql-request';
import 'rc-tree/assets/index.css';

const query = gql`
  {
    allContent(preview: true) {
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

export default function HeartcoreMultiEditor() {
  const [loading, setLoading] = useState<boolean>(true);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const { value, setValue, metadata } = useUniformMeshLocation<MultiEditorValue, EditorMetadataValue>();
  const gqclient = useGraphQLClient(metadata);

  const handleMenuItemClick = (val: string) => {
    const newValue: MultiEditorValue = { ...(value || { ids: [] }) };
    if (!newValue.ids.includes(val)) {
      newValue.ids.push(val);
    } else {
      newValue.ids = newValue.ids.filter((id) => id !== val);
    }
    setValue(newValue);
  };

  useEffect(() => {
    (async () => {
      const result = await gqclient.request(query);
      setContentItems(result.allContent.items);
      setLoading(false);
    })();
  }, []);  

  return (
    <>
      <div className="relative">
        <label className="uniform-input-label">Content Items List</label>
        <LoadingOverlay isActive={loading} />
        {Array.isArray(contentItems) ? (
          <div
            className="overflow-y-auto p-2 bg-gray-100 border-t border-b border-gray-300 space-y-2 max-h-96"
            data-test-id="content-type-selector"
          >
            {contentItems.length === 0 ? (
              <h3 className="text-sm font-medium mb-2">No content items were found.</h3>
            ) : (
              contentItems.map((item, index) => {
                const active = Boolean(value ? value.ids.includes(item.id) : false);
                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-3 bg-white border-2 rounded-md shadow-md ${
                      active ? 'border-green-500' : 'border-gray-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleMenuItemClick(item.id)}
                      className="flex items-center justify-between w-full outline-none focus:outline-none"
                    >
                      <span>{item.name}</span>
                      {active ? <Checkmark className="block h-6 w-6 text-green-500" /> : null}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
