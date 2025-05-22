import globalStore from '@/services/global.state';
import React from 'react';

const useInfiniteScroll = (id: string) => {
  const onEndReachedCalledDuringMomentum = React.useRef(true);

  React.useEffect(() => {
    const handleScroll = () => {
      onEndReachedCalledDuringMomentum.current = false;
    };

    if (globalStore.isWeb) {
      const scrollbox = document.getElementById(id);
      scrollbox?.addEventListener('scroll', handleScroll);

      return () => {
        scrollbox?.removeEventListener('scroll', handleScroll);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    onEndReachedCalledDuringMomentum,
  };
};

export default useInfiniteScroll;
