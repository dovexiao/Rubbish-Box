import {useCallback, useMemo, useRef, useState} from 'react';
import useInfiniteScroll from '@/common-pages/hooks/load-more.hooks';

interface PagerResult<T> {
  totalPages: number;
  totalSize: number;
  content: T[];
}

interface Options {
  listId: string;
  pageSize?: number;
}

const useListPaging = <T>(
  requestFn: (pageNo: number, pageSize: number) => Promise<PagerResult<T>>,
  options: Options,
) => {
  const {pageSize = 30, listId} = options;
  const [isRefresh, setIsRefresh] = useState(false);
  const [resultList, setResultList] = useState<T[]>([]);

  const pageNoRef = useRef(1);
  const totalPageRef = useRef(0);
  const totalSizeRef = useRef(0);

  const {onEndReachedCalledDuringMomentum} = useInfiniteScroll(
    listId as string,
  );

  const hasMoreData = useMemo(() => {
    if (resultList?.length === totalSizeRef.current) {
      return false;
    }
    return true;
  }, [resultList]);

  const fetchData = useCallback(() => {
    if (pageNoRef.current > totalPageRef.current && pageNoRef.current > 1) {
      return Promise.resolve();
    }
    setIsRefresh(true);
    const promise = requestFn(pageNoRef.current, pageSize).then(result => {
      totalPageRef.current = result?.totalPages || 0;
      totalSizeRef.current = result?.totalSize || 0;
      if (pageNoRef.current > 1) {
        setResultList([...resultList, ...result?.content]);
      } else {
        setResultList(result?.content);
      }
    });
    promise.finally(() => setIsRefresh(false));
    return promise;
  }, [pageSize, requestFn, resultList]);

  const refreshList = useCallback(() => {
    pageNoRef.current = 1;
    fetchData();
  }, [fetchData]);

  const loadMore = () => {
    if (hasMoreData && !onEndReachedCalledDuringMomentum.current) {
      pageNoRef.current += 1;
      fetchData();
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  return {
    isRefresh,
    resultList,
    refreshList,
    hasMoreData,
    loadMore,
    onEndReachedCalledDuringMomentum,
  };
};

export default useListPaging;
