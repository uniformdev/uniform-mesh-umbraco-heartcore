import React, { useState, useEffect } from 'react';
import { useUniformMeshLocation } from '@uniformdev/mesh-sdk-react';
import { ConfigValue, EditorMetadataValue } from '../types/types';
import { useContentManagementClient } from '../hooks/useContentManagementClient';
import { LoadingOverlay } from '../components/LoadingOverlay';
import Checkmark from 'icons/Checkmark';

export default function HeartcoreConfig() {
  const [loading, setLoading] = useState<boolean>(true);
  const [contentTypes, setContentTypes] = useState<any[]>([]);
  const { value, setValue, metadata } = useUniformMeshLocation<ConfigValue, EditorMetadataValue>();
  const client = useContentManagementClient(metadata);

  const handleMenuItemClick = (contentType: string) => {
    const newValue: ConfigValue = { ...(value || {}) };
    newValue[contentType] = newValue[contentType] ? undefined : contentType;

    setValue(newValue);
  };

  useEffect(() => {
    (async () => {
      const result = await client.management.contentType.all();
      setContentTypes(result);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="relative">
      <label className="uniform-input-label">Allowed Content Types</label>
      <LoadingOverlay isActive={loading} />
      {Array.isArray(contentTypes) ? (
        <div
          className="overflow-y-auto p-2 bg-gray-100 border-t border-b border-gray-300 space-y-2 max-h-96"
          data-test-id="content-type-selector"
        >
          {contentTypes.length === 0 ? (
            <h3 className="text-sm font-medium mb-2">No content types were found.</h3>
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
                    onClick={() => handleMenuItemClick(contentType.alias)}
                    className="flex items-center justify-between w-full outline-none focus:outline-none"
                  >
                    <span>{contentType.name}</span>
                    {active ? <Checkmark className="block h-6 w-6 text-green-500" /> : null}
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
