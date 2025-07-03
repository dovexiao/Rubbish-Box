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
        pageNoRef.current += 1;
      }
      getCategoryGameList({
        page: pageNoRef.current,
      });
    },
    [getCategoryGameList],
  );

  // 当筛选条件变化时，刷新数据
  useEffect(() => {
    pageNoRef.current = 1;
    fetchData(true);
    // 重置标志，避免第一次就跳过
    onEndReachedCalledDuringMomentum.current = false;
  }, [fetchData, pageTagIndex, pageSubTagId, onEndReachedCalledDuringMomentum]);

  const refreshList = useCallback(() => {
    if (pageNoRef.current === 1) return;
    onEndReachedCalledDuringMomentum.current = false;
    useHomeStore.setState({isRefresh: true});
    fetchData(true);
  }, [fetchData, onEndReachedCalledDuringMomentum]);

  const loadMore = () => {
    if (hasMoreData && !onEndReachedCalledDuringMomentum.current) {
      onEndReachedCalledDuringMomentum.current = true;
      fetchData();
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
