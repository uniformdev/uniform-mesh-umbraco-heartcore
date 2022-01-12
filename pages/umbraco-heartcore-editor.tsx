import React, { useState, useEffect } from 'react';
import { useUniformMeshLocation } from '@uniformdev/mesh-sdk-react';
import { EditorValue, EditorMetadataValue } from '../types/types';
import { useContentManagementClient } from '../hooks/useContentManagementClient';
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

export default function HeartcoreEditor() {
  const [treeData, setTreeData] = useState<any[]>([]);
  const { value, setValue, metadata } = useUniformMeshLocation<EditorValue, EditorMetadataValue>();
  const client = useContentManagementClient(metadata);

  useEffect(() => {
    (async () => {
      const initTreeData = await client.management.content.root();
      setTreeData(initTreeData.map((item) => FormatData(undefined, item)));
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
    setValue({ ...value, id: selected[0] });
  }

  return (
    <>
      <label className="uniform-input-label">Content Items Tree</label>
      <Tree className="my-4" showLine treeData={treeData} loadData={LoadDataWrapper} onSelect={onSelect} />
    </>
  );
}
