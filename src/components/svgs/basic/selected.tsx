import {SVGProps} from '@/types';
import React from 'react';

const SelectedSvg = ({color, width, height}: SVGProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 12 12"
    fill="none">
    <path
      d="M1.5 5.5L4.38889 8.61111L10 3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SelectedSvg;
