import theme from '@/style';
import React, {useState, useMemo} from 'react';
import Tabs from '@/components/basic/tab';
import Tier from './tier';
import {useInnerStyle} from '../../proxy.hooks';
type propsData = {
  handleTabIndex: (index: string) => void;
};
const ProxyCommissionDetail = (props: propsData) => {
  const {tierTabsStyle} = useInnerStyle();
  const [tier, setTier] = useState(1);
  const tabOptions = useMemo(() => {
    return [
      {
        label: <Tier size="large" level={1} />,
        value: '1',
      },
      {
        label: <Tier size="large" level={2} />,
        value: '2',
      },
      {
        label: <Tier size="large" level={3} />,
        value: '3',
      },
      {
        label: <Tier size="large" level={4} />,
        value: '4',
      },
    ];
  }, []);
  return (
    <Tabs
      tabOptions={tabOptions}
      layout="between"
      indicatorWidth={20}
      indicatorHeight={3}
      indicatorBottom={0}
      value={tier + ''}
      onChange={val => {
        setTier(tier);
        props.handleTabIndex(val);
      }}
      style={[tierTabsStyle.container, theme.fill.fillW]}
      labelContainerStyle={[theme.flex.start]}
    />
  );
};

export default ProxyCommissionDetail;
