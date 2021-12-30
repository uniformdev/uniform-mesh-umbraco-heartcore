import * as React from 'react';
import { SVGProps } from 'react';

const Checkmark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 40 40"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 39.2A19.2 19.2 0 1 0 20 .8a19.2 19.2 0 0 0 0 38.4Zm8.897-22.303a2.4 2.4 0 0 0-3.394-3.394L17.6 21.407l-3.103-3.104a2.4 2.4 0 0 0-3.394 3.394l4.8 4.8a2.4 2.4 0 0 0 3.394 0l9.6-9.6Z"
    />
  </svg>
);

export default Checkmark;
