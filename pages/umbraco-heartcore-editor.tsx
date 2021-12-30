import React, { useState, useEffect } from 'react';
import { useUniformMeshLocation } from '@uniformdev/mesh-sdk-react';
import { EditorValue, EditorMetadataValue } from '../types/types';
import { useGraphQLClient } from '../hooks/useGraphQLClient';
import { useContentManagementClient } from '../hooks/useContentManagementClient';
import { LoadingOverlay } from '../components/LoadingOverlay';
import Checkmark from 'icons/Checkmark';
import { gql } from 'graphql-request';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import { ContentManagementContent } from '@umbraco/headless-client';

interface TreeNode {
  key: string;
  title: string;
  isLeaf: boolean;
  disabled: boolean;
  children: TreeNode[];
  parent: TreeNode | undefined;
}

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

export default function VideoEditor() {
  const [loading, setLoading] = useState<boolean>(true);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);
  const { value, setValue, metadata } = useUniformMeshLocation<EditorValue, EditorMetadataValue>();
  const gqclient = useGraphQLClient(metadata);
  const client = useContentManagementClient(metadata);

  const handleMenuItemClick = (val: string) => {
    const newValue: EditorValue = { ...(value || { id: [] }) };
    if (!newValue.id.includes(val)) {
      newValue.id.push(val);
    } else {
      newValue.id = newValue.id.filter((id) => id !== val);
    }
    setValue(newValue);
  };

  useEffect(() => {
    (async () => {
      const result = await gqclient.request(query);
      setContentItems(result.allContent.items);

      const initTreeData = await client.management.content.root();
      setTreeData(initTreeData.map((item) => FormatData(undefined, item)));
      setLoading(false);
    })();
  }, []);

  function FormatData(parent: TreeNode | undefined, item: ContentManagementContent): TreeNode {
    const obj = {
      key: item._id,
      title: item.name.$invariant,
      isLeaf: !item._hasChildren,
      disabled: false,
      children: [],
      parent: parent,
    };

    if (metadata.parameterConfiguration) {
      obj.disabled = Object.keys(metadata.parameterConfiguration).includes(item.contentTypeAlias);
    }

    if (value?.id.some((id) => id == item._id)) {
      obj.disabled = true;
    }

    return obj as TreeNode;
  }

  async function LoadData(node: TreeNode): Promise<void> {
    if (node.isLeaf) return;

    const children = await client.management.content.children(node.key);
    if (children) {
      node.children = children?.items.map((item) => FormatData(undefined, item));
      const tree = [...treeData];
      UpdateTree(tree, node);
      setTreeData(tree);
    }
  }

  function UpdateTree(tree: TreeNode[], updateNode: TreeNode) {
    for (const treeNode of tree) {
      if (treeNode.key == updateNode.key) {
        treeNode.children = updateNode.children;
      } else {
        UpdateTree(treeNode.children, updateNode);
      }
    }
  }

  async function LoadDataWrapper(node: any): Promise<void> {
    await LoadData(node);
  }

  function onSelect(selected: any[]) {
    const newValue: EditorValue = { ...(value || { id: [] }) };
    newValue.id = selected;
    setValue(newValue);
  }

  return (
    <>
      <Tree className="my-4" showLine treeData={treeData} loadData={LoadDataWrapper} onSelect={onSelect} />
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
                const active = Boolean(value ? value.id.includes(item.id) : false);
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
