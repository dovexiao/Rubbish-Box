import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import {goBack} from '@/utils';
import React from 'react';
import TransactionTab from './transaction-tab';
import {TabType, getTabs} from './transaction-service';
import globalStore from '@/services/global.state';
import Spin from '@/components/basic/spin';
import {LazyImageLGBackground} from '@basicComponents/image';

const Transactions = () => {
  const [tabs, setTabs] = React.useState<TabType[]>([
    {type: '0', typeName: 'All'},
  ]);
  const [loading, setLoading] = React.useState(false);
  const [amount, setAmount] = React.useState(0);

  React.useEffect(() => {
    setLoading(true);
    const sub = globalStore.amountChanged.subscribe(res => {
      setAmount(res.current);
      setLoading(false);
    });
    onGetTabs().then();
    return () => {
      sub.unsubscribe();
    };
  }, []);

  const onGetTabs = async () => {
    try {
      setLoading(true);
      const res = await getTabs();
      setTabs(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideServer
        hideAmount
        title={'My Transactions'}
      />
      <Spin loading={loading} style={[theme.flex.flex1, theme.flex.col]}>
        <TransactionTab tabs={tabs} amount={amount} />
      </Spin>
    </LazyImageLGBackground>
  );
};

export default Transactions;
