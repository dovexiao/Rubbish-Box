import {SafeAny} from '@/types';
import React, {ReactNode, useCallback, useState} from 'react';
import Spin from '@/components/basic/spin';
import theme from '@/style';

export function useAsyncLoading() {
  const [pageLoading, setPageLoading] = useState(false);

  const doAsyncAction = useCallback(
    async (fn: () => Promise<SafeAny>, showLoading: boolean = true) => {
      showLoading && setPageLoading(true);
      const promiseResult = fn();
      promiseResult.finally(() => setPageLoading(false));
      return promiseResult;
    },
    [],
  );

  return {
    pageLoading,
    doAsyncAction,
  };
}

export function useAsyncPageSpin() {
  const {pageLoading, doAsyncAction} = useAsyncLoading();
  return {
    renderSpin: (children?: ReactNode) => (
      <Spin
        loading={pageLoading}
        style={[theme.fill.fill, theme.flex.col, theme.background.lightGrey]}>
        {children}
      </Spin>
    ),
    doAsyncAction,
    pageLoading,
  };
}
