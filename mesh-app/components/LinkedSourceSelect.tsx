// import React, { ChangeEvent, useState } from 'react';
import React from 'react';
import { useEffect } from 'react';
import { LinkedSource } from '../types/types';

export interface LinkedSourceSelectProps {
  onLinkSelect: (link: LinkedSource) => void;
  selectedLinkId?: string;
  linkedSources: LinkedSource[] | undefined;
}

// temporary: sets the selected linked source to the first source in the array
export function LinkedSourceSelect({ linkedSources, onLinkSelect }: LinkedSourceSelectProps) {
  useEffect(
    () => {
      const selectedLink = linkedSources?.[0];
      if (selectedLink) {
        onLinkSelect(selectedLink);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return <></>;
}

// todo: use this version of LinkedSourceSelect once the integration can handle multiple linked sources (dependent on dialog API)
// export function LinkedSourceSelect({ linkedSources, onLinkSelect, selectedLinkId }: LinkedSourceSelectProps) {
//   const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
//     const selectedLink = linkedSources?.find((link) => {
//       return link.id === e.target.value;
//     });

//     if (selectedLink) {
//       onLinkSelect(selectedLink);
//     }
//   };

//   const selectedLinkIsPresentInLinksList =
//     selectedLinkId && linkedSources?.some((link) => link.id === selectedLinkId);

//   return (
//     <div>
//       <label htmlFor="selectLinkedSource" className="uniform-input-label">
//         Select Linked Source
//       </label>

//       <div className="flex items-center">
//         <select
//           className="uniform-input uniform-input-select mr-1"
//           name="selectLinkedSource"
//           value={selectedLinkId || ''}
//           onChange={handleChange}
//         >
//           {/*
//           Ensure the selected link is in the links list. If not, then show the "initial" empty text.
//           This scenario can occur if an integration is configured to use a source but the source is later
//           deleted within the CMS. In that scenario, we need to allow the user to choose a source so that
//           the "onChange" event occurs.
//           */}
//           {!selectedLinkIsPresentInLinksList ? (
//             <option value="">Please choose a linked content source</option>
//           ) : null}
//           {linkedSources?.map((link) => {
//             return (
//               <option key={link.id} value={link.id}>
//                 {link.id} ({link.project.projectId})
//               </option>
//             );
//           })}
//         </select>
//       </div>
//     </div>
//   );
// }
