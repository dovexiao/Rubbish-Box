import theme from '@/style';

export const bankPageTemplate = `
<html>
  <style>
    @keyframes scaleAnimation {
      0% {
        background: ${theme.backgroundColor.lightGrey};
      }
      50% {
        background: ${theme.backgroundColor.grey};
      }
      100% {
        background: ${theme.backgroundColor.lightGrey};
      }
    }

    html {
      height: 100%;
      width: 100%;
      background: ${theme.backgroundColor.lightGrey};
      animation-name: scaleAnimation;
      animation-duration: 2s;
      animation-iteration-count: infinite;
      animation-timing-function: cubic-bezier(1, 0.7, 0.3, 0.7);
    }
  </style>
</html>

`;
