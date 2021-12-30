import React from 'react';

export interface LoadingOverlayProps {
  isActive: boolean;
  statusMessage?: string | JSX.Element;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isActive, statusMessage }) => {
  // NOTE: the container/parent element for the LoadingOverlay must have `position:relative` assigned
  // in order for the overlay to display properly.
  return (
    <div
      className={`${
        isActive ? 'flex' : 'hidden'
      } absolute bottom-0 left-0 right-0 top-0 items-center justify-center overflow-hidden z-50`}
      style={{ zIndex: 9999 }}
    >
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-white bg-opacity-50"></div>
      <div className="relative">
        <div className="flex flex-col items-center">
          <LoadingIcon height={128} width={128} />
          {statusMessage ? <div className="mt-4 text-gray-500">{statusMessage}</div> : null}
        </div>
      </div>
    </div>
  );
};

export interface LoadingIconProps {
  width?: number;
  height?: number;
}

export const LoadingIcon: React.FC<LoadingIconProps> = ({ height, width }) => {
  return (
    <svg
      data-testid="svg"
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? 40}
      height={height ?? 40}
      className="stroke-current"
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="2">
          <circle strokeOpacity=".25" cx="18" cy="18" r="18"></circle>
          <path d="M36 18c0-9.94-8.06-18-18-18" transform="rotate(166.645 18 18)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="0.8s"
              repeatCount="indefinite"
            ></animateTransform>
          </path>
        </g>
      </g>
    </svg>
  );
};
