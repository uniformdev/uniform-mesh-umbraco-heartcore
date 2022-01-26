import React, { useState, useEffect } from 'react';
import { useUniformMeshLocation } from '@uniformdev/mesh-sdk-react';
import { EditorValue, EditorMetadataValue } from '../types/types';
import { useContentManagementClient } from '../hooks/useContentManagementClient';
import { ContentManagementContent } from '@umbraco/headless-client';


export default function HeartcoreEditor() {
 
  return (
    <>
      <label className="uniform-input-label">Content Items Tree</label>
      
    </>
  );
}
