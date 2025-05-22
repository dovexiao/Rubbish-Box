import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

export interface PagerResult<T> {
  todayCommissionRecharge?: SetStateAction<any>;
  todayCommissionInvite?: SetStateAction<any>;
  todayCommissionBet?: SetStateAction<any>;
  todayCommissionDetail?: never[];
  length?: any;
  totalPages?: number;
  totalSize?: number;
  content?: T[];
}

/**
 * 与分页请求相关hooks
 * @param requestFn 分页请求
 * @param options pageSize 一页多少个，默认10
 * @returns
 *  @param init 初始化列表（第一页）
 *  @param refreshNextPage 刷新下一页列表（主动触发）
 *  @param onScroll 为ScrollView触发事件，进行分页（不绑定就不会依据该函数触发）
 *  @param resultList 结果列表
 *  @param isEnd 是否为最后一页
 */
export function usePaging<T>(
  requestFn: (pageNo: number, pageSize: number) => Promise<PagerResult<T>>,
  options: {
    pageNo?: number;
    pageSize?: number;
    userPhone?: string;
    level?: number;
  } = {pageSize: 10},
) {
  const {pageSize: initPageSize = 10} = options;
  const pageNo = useRef(1);
  const pageSize = useRef(initPageSize);
  const [totalPage, setTotalPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [totalSize, setTotalSize] = useState(10);
  const [resultPageNo, setResultPageNo] = useState(1);
  const [todayCommissionBet, setTodayCommissionBet] = useState(0);
  const [todayCommissionInvite, setTodayCommissionInvite] = useState(0);
  const [todayCommissionRecharge, setTodayCommissionRecharge] = useState(0);
  const loading = useRef(false);
  const isEnd = useMemo(() => {
    return pageNo.current >= totalPage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
  const [resultList, setResultList] = useState<T[]>([]);
  useEffect(() => {
    pageSize.current = initPageSize;
  }, [initPageSize]);
  const refreshList = useCallback(() => {
    if (pageNo.current > totalPage && pageNo.current > 1) {
      return Promise.resolve();
    }
    loading.current = true;
    const promise = requestFn(pageNo.current, pageSize.current).then(result => {
      let list = result?.todayCommissionDetail || [];
      // totalPage.current = result?.length ? pageNo.current + 1 : pageNo;
      let total = list?.length ? pageNo?.current + 1 : pageNo?.current || 0;
      setTotalPage(total);
      setTotalSize(pageSize.current);
      setVersion(version + 1);
      setResultPageNo(pageNo.current);
      setTodayCommissionBet(result?.todayCommissionBet);
      setTodayCommissionInvite(result?.todayCommissionInvite);
      setTodayCommissionRecharge(result?.todayCommissionRecharge);

      if (pageNo.current > 1) {
        setResultList([...resultList, ...(list as any)]);
      } else {
        setResultList(list as any);
      }
    });
    promise.finally(() => (loading.current = false));
    return promise;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultList, requestFn]);

  const init = () => {
    pageNo.current = 1;
    return refreshList();
  };

  const refreshNextPage = () => {
    if (totalPage === 1) {
      return Promise.resolve();
    }
    pageNo.current++;
    setVersion(version + 1);
    if (pageNo.current > totalPage) {
      return Promise.resolve();
    }
    return refreshList();
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const h = event.nativeEvent.contentSize.height;
    const wrapH = event.nativeEvent.layoutMeasurement.height;
    if (y >= h - wrapH - 200 && !loading.current) {
      return refreshNextPage();
    }
    return Promise.resolve();
  };

  const reset = () => {
    pageNo.current = 1;
    setTotalPage(1);
    setResultList([]);
  };

  return {
    init,
    refreshNextPage,
    onScroll,
    reset,
    resultList,
    isEnd,
    totalSize,
    resultPageNo,
    todayCommissionBet,
    todayCommissionInvite,
    todayCommissionRecharge,
  };
}
