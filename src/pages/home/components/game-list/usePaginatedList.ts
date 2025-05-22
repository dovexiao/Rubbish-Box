import {useCallback, useEffect, useRef} from 'react';
import useHomeStore from '@/store/useHomeStore';
import useInfiniteScroll from '@/common-pages/hooks/load-more.hooks';
import {useShallow} from 'zustand/react/shallow';

const usePaginatedList = () => {
  const HOME_GAME_LIST_ID = 'home-game-list-id';

  const {
    isRefresh,
    list,
    pageTagIndex,
    pageSubTagId,
    hasMoreData,
    getCategoryGameList,
  } = useHomeStore(
    useShallow(state => ({
      oneCategoryPageIndex: state.oneCategoryPageIndex,
      pageTagIndex: state.pageTagIndex,
      pageSubTagId: state.pageSubTagId,
      isRefresh: state.isRefresh,
      hasMoreData: state.hasMoreData,
      list: state.categoryGameList,
      getCategoryGameList: state.getCategoryGameList,
    })),
  );

  const pageNoRef = useRef(1);
  const {onEndReachedCalledDuringMomentum} =
    useInfiniteScroll(HOME_GAME_LIST_ID);

  const fetchData = useCallback(
    (refresh = false) => {
      if (refresh) {
        pageNoRef.current = 1;
      } else {
        pageNoRef.current = pageNoRef.current + 1;
      }
      getCategoryGameList({
        page: pageNoRef.current,
      });
    },
    [getCategoryGameList],
  );

  useEffect(() => {
    fetchData(true);
  }, [fetchData, pageTagIndex, pageSubTagId]);

  const refreshList = useCallback(() => {
    if (pageNoRef.current === 1) {
      return;
    }
    useHomeStore.setState({isRefresh: true});
    fetchData(true);
  }, [fetchData]);

  const loadMore = () => {
    if (hasMoreData && !onEndReachedCalledDuringMomentum.current) {
      fetchData();
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  return {
    HOME_GAME_LIST_ID,
    isRefresh,
    gameList: list,
    refreshList,
    hasMoreData,
    loadMore,
    onEndReachedCalledDuringMomentum,
  };
};

export default usePaginatedList;
