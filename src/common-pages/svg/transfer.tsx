import theme from '@/style';
import React from 'react';
import {View} from 'react-native';

export default () => (
  <View style={[theme.icon.xl]}>
    <svg
      width="30"
      height="31"
      viewBox="0 0 30 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_b_7402_28800)">
        <circle cx="19" cy="11" r="11" fill="#00B41D" />
        <circle
          cx="19"
          cy="11"
          r="10.5484"
          stroke="white"
          strokeOpacity="0.1"
          strokeWidth="0.903226"
        />
      </g>
      <g filter="url(#filter1_bd_7402_28800)">
        <circle
          cx="13"
          cy="17"
          r="11"
          fill="white"
          fillOpacity="0.3"
          shapeRendering="crispEdges"
        />
        <circle
          cx="13"
          cy="17"
          r="10.5484"
          stroke="white"
          strokeOpacity="0.1"
          strokeWidth="0.903226"
          shapeRendering="crispEdges"
        />
      </g>
      <g opacity="0.7" filter="url(#filter2_d_7402_28800)">
        <path
          d="M24.4844 11L13.6457 11L16.3553 8.29032"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          floodOpacity="round"
        />
      </g>
      <g opacity="0.7" filter="url(#filter3_d_7402_28800)">
        <path
          d="M7.41992 18.7097H18.2586L15.549 16"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          floodOpacity="round"
        />
      </g>
      <defs>
        <filter
          id="filter0_b_7402_28800"
          x="0.774193"
          y="-7.22581"
          width="36.4516"
          height="36.4516"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="3.6129" />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_7402_28800"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_backgroundBlur_7402_28800"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_bd_7402_28800"
          x="-5.22581"
          y="-1.22581"
          width="36.4516"
          height="36.4516"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="3.6129" />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_7402_28800"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="2" dy="-1" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_backgroundBlur_7402_28800"
            result="effect2_dropShadow_7402_28800"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_7402_28800"
            result="shape"
          />
        </filter>
        <filter
          id="filter2_d_7402_28800"
          x="11.7423"
          y="7.29053"
          width="14.6453"
          height="6.51592"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.903226" />
          <feGaussianBlur stdDeviation="0.451613" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_7402_28800"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_7402_28800"
            result="shape"
          />
        </filter>
        <filter
          id="filter3_d_7402_28800"
          x="5.5167"
          y="15"
          width="14.6453"
          height="6.51592"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.903226" />
          <feGaussianBlur stdDeviation="0.451613" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_7402_28800"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_7402_28800"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  </View>
);
