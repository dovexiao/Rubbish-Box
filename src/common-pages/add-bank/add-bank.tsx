import {InputField} from '@/components/basic/input-field';
import Spin from '@/components/basic/spin';
import DetailNavTitle from '@/components/business/detail-nav-title';
import AddButton from '@/components/business/recharge-button';
import theme from '@/style';
import {goBack} from '@/utils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, ScrollView, StyleSheet} from 'react-native';
import {BankInfo, delBank, onAddBank, updateBank} from './add-bank-service';
import {useRoute} from '@react-navigation/native';
import {BasicObject} from '@/types';
import Button from '@/components/basic/button';
import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useConfirm} from '@/components/basic/modal';
import {LazyImageLGBackground} from '@basicComponents/image';
const AddBank = () => {
  const {i18n} = useTranslation();
  const {isFirst, cardInfo} = useRoute().params as BasicObject;
  const [cardName, setCardName] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [ifsCode, setIfsCode] = React.useState('');
  const [cardNumberCopy, setCardNumberCopy] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [upiId, setUpiId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [checkStatus, setCheckStatus] = React.useState<BasicObject>({});
  const {renderModal: renderConfirmModal, show: confirmShow} = useConfirm(
    i18n.t('label.del'),
  );
  const onSubmit = async () => {
    try {
      setLoading(true);
      // if (!testIfsc(ifsCode)) {
      //   return globalStore.globalWaringTotal(
      //     i18n.t('bank-page.error.check-ifsc'),
      //   );
      // }
      const checkRes = checkIsValidate();
      if (Object.keys(checkRes).length > 0) {
        return;
      }
      const params = {
        cardName,
        cardNumber: cardNumber,
        ifsCode,
        email,
        upiId,
      } as BankInfo;
      if (cardInfo) {
        params.id = cardInfo.id;
        await updateBank(params);
      } else {
        await onAddBank(params);
      }
      goBack();
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (cardInfo) {
      setCardName(cardInfo.accountName);
      setCardNumber(cardInfo.accountNumber);
      setIfsCode(cardInfo.ifscCode || '');
      setCardNumberCopy(cardInfo.accountNumber || '');
      setEmail(cardInfo.userEmail || '');
      setUpiId(cardInfo.upiId || '');
    }
  }, [cardInfo]);

  const checkIsValidate = () => {
    const resObj = {} as BasicObject;

    if (cardName) {
      const res = testName(cardName);
      if (!res) {
        resObj.accountName = 'error';
      }
    }
    if (ifsCode) {
      const res = testIfsc(ifsCode);
      if (!res) {
        resObj.code = 'error';
      }
    }
    if (cardNumber) {
      const res = testCardNumber(cardNumber);
      if (!res) {
        resObj.cardNumber = 'error';
      }
    }
    setCheckStatus(resObj);
    return resObj;
  };

  const testName = (name: string) => {
    const reg = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
    return reg.test(name);
  };

  const testIfsc = (code: string) => {
    const reg = /^[a-zA-Z]{4}0.*/;
    return reg.test(code);
  };

  const testCardNumber = (cardN: string) => {
    const reg = /^[0-9]{9,17}$/;
    return reg.test(cardN);
  };

  const disabled = React.useMemo(() => {
    const isFirstAdd = Boolean(parseInt(isFirst, 10));
    if (isFirstAdd) {
      return !(
        cardName &&
        cardNumber &&
        cardNumber === cardNumberCopy &&
        ifsCode
      );
    } else {
      return !(
        cardName &&
        cardNumber &&
        cardNumber === cardNumberCopy &&
        ifsCode
      );
    }
  }, [isFirst, cardName, cardNumber, ifsCode, cardNumberCopy]);

  const onDeleteCard = async () => {
    confirmShow(
      i18n.t('bank-page.del.confirmTitle'),
      i18n.t('bank-page.del.confirmText'),
      async () => {
        try {
          setLoading(true);
          await delBank({id: cardInfo.id});
          goBack();
        } finally {
          setLoading(false);
        }
      },
    );
  };

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        hideServer
        onBack={goBack}
        hideAmount
        title={cardInfo ? i18n.t('label.updateBank') : i18n.t('label.addBank')}
      />
      <Spin loading={loading} style={[theme.flex.flex1, theme.flex.col]}>
        <View style={[theme.flex.flex1, theme.flex.basis0]}>
          <ScrollView>
            <View
              style={[
                styles.container,
                theme.border.main,
                theme.margin.lrl,
                theme.borderRadius.l,
                theme.background.transparentP30,
              ]}>
              <InputField
                name="accountName"
                status={checkStatus.accountName}
                value={cardName}
                onChangeText={setCardName}
                label={i18n.t('bank-page.label.accountName')}
                required
                placeholder={i18n.t('bank-page.placeholder.accountName')}
              />
              <InputField
                name="code"
                status={checkStatus.code}
                value={ifsCode}
                onChangeText={setIfsCode}
                label={i18n.t('bank-page.label.IFSC')}
                required
                placeholder={i18n.t('bank-page.placeholder.IFSC')}
              />
              <InputField
                name="cardNumber"
                status={checkStatus.cardNumber}
                value={cardNumber}
                onChangeText={setCardNumber}
                label={i18n.t('bank-page.label.accountNum')}
                required
                keyboardType="numeric"
                placeholder={i18n.t('bank-page.placeholder.accountNum')}
              />
              <InputField
                status={checkStatus.cardNumber}
                name="cardNumberCheck"
                value={cardNumberCopy}
                onChangeText={setCardNumberCopy}
                label={i18n.t('bank-page.label.accountNumAgain')}
                required
                keyboardType="numeric"
                placeholder={i18n.t('bank-page.placeholder.accountNum')}
              />
              <InputField
                positionTranslation={true}
                name="upId"
                value={upiId}
                onChangeText={setUpiId}
                label={i18n.t('bank-page.label.UPI')}
                placeholder={i18n.t('bank-page.placeholder.UPI')}
              />
              <InputField
                positionTranslation={true}
                name="email"
                value={email}
                onChangeText={setEmail}
                label={i18n.t('label.email')}
                placeholder={i18n.t('bank-page.placeholder.email')}
              />
            </View>
          </ScrollView>
        </View>

        {cardInfo ? (
          <UpdateGroup
            disabled={disabled}
            onDel={onDeleteCard}
            onSubmit={onSubmit}
          />
        ) : (
          <AddButton
            disabled={disabled}
            onRecharge={onSubmit}
            type="linear-primary"
            text={i18n.t('label.confirm')}
          />
        )}
      </Spin>
      {renderConfirmModal}
    </LazyImageLGBackground>
  );
};

const UpdateGroup = (props: {
  disabled?: boolean;
  onDel?: () => void;
  onSubmit?: () => void;
}) => {
  const {i18n} = useTranslation();
  const {disabled, onDel, onSubmit} = props;
  return (
    <View
      style={[
        theme.flex.row,
        theme.flex.centerByCol,
        theme.padding.l,
        theme.background.transparentMedium1,
      ]}>
      <NativeTouchableOpacity onPress={onDel} style={styles.button}>
        <Text fontSize={theme.fontSize.m} blod color={theme.basicColor.primary}>
          {i18n.t('label.del')}
        </Text>
      </NativeTouchableOpacity>
      <View style={[theme.flex.flex1]}>
        <Button
          size="large"
          type="linear-primary"
          disabled={disabled}
          onPress={onSubmit}>
          <Text fontSize={theme.fontSize.m} blod color={theme.basicColor.white}>
            {i18n.t('label.save')}
          </Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  button: {
    height: 40,
    width: 120,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderColor: theme.basicColor.primary,
  },
});

export default AddBank;
