import React, {useState} from 'react';
import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';

import {LazyImageLGBackground} from '@/components/basic/image';
import {goBack, goTo} from '@/utils';
import {useTranslation} from 'react-i18next';
import {View, Image, TextInput} from 'react-native';
import Text from '@/components/basic/text';
import ImagePickerView from './image-picker';
import Button from '@/components/basic/button';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useUserActions} from '@/store/useUserStore';
import globalStore from '@/services/global.state';
import {useGetModal} from '../luckyspin/getmodal.hooks';
import {submitFeedBackService} from './feedback.service';
import {useToast} from '@/components/basic/modal';
import LazyImage from '@/components/basic/image/lazy-image';
import LinearGradient from '@/components/basic/linear-gradient';

const FeedBack = () => {
  const {i18n} = useTranslation();
  const [text, setText] = useState('');
  const [imageList, setImageList] = useState<string[]>([]);

  const {getUserInfo} = useUserActions();

  const refreshAmount = () => {
    getUserInfo();
    globalStore.updateAmount.next();
  };

  const {renderModal: renderGetModal, show: getModalShow} =
    useGetModal(refreshAmount);
  const {renderModal: renderToastModal, show: showToast} = useToast();

  const onPressSubmit = async () => {
    try {
      if (text) {
        const res = await submitFeedBackService({
          messageContent: text,
          messageImgs: imageList?.join(','),
        });
        if (res) {
          getModalShow(res);
        } else {
          showToast({type: 'success', message: 'FeedBack Success'});
        }
        setText('');
      } else {
        showToast({
          type: 'warning',
          message: i18n.t('other.enterQuestions'),
        });
      }
    } catch (error) {}
  };

  const onPressToRecord = () => {
    goTo('FeedBackRecordPage');
  };

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideServer
        hideAmount
        title={i18n.t('feedback.title')}
      />
      <LinearGradient
        colors={['#4612BAFF', '#4F8AF4FF']}
        style={[
          theme.flex.row,
          theme.background.mainDark,
          theme.border.primary50,
          theme.borderRadius.s,
          theme.margin.lrl,
          theme.padding.l,
          theme.flex.centerByCol,
        ]}>
        <View style={[theme.flex.flex1, theme.gap.xs]}>
          <Text white fontSize={14} blod>
            {i18n.t('other.feedbackQuestions')}
          </Text>
          <Text color={theme.fontColor.white80} fontSize={10}>
            {i18n.t('other.communicate1')}
            {i18n.t('other.communicate2')}
            {i18n.t('other.communicate3')}
            {i18n.t('other.communicate4')}
          </Text>
        </View>
        <Image
          source={require('@components/assets/icons/me-list-item/coupon.webp')}
          style={[{height: 80, width: 80}]}
        />
      </LinearGradient>
      <View
        style={[
          theme.margin.topl,
          theme.background.mainDark,
          theme.border.primary50,
          theme.borderRadius.s,
          theme.margin.lrl,
          theme.padding.l,
          theme.gap.m,
        ]}>
        <Text white fontSize={16} blod>
          {i18n.t('other.communicate5')}
        </Text>
        <TextInput
          style={[
            theme.padding.l,
            theme.border.primary50,
            theme.borderRadius.xs,
            {
              color: theme.fontColor.white,
              height: 120,
            },
          ]}
          placeholder={
            i18n.t('other.communicate14') +
            i18n.t('other.communicate15') +
            i18n.t('other.communicate16')
          }
          placeholderTextColor={'#FFFFFF'}
          value={text}
          multiline
          onChangeText={setText}
        />
        <Text white fontSize={16} blod>
          {i18n.t('other.communicate6')}
        </Text>
        <ImagePickerView callback={setImageList} />
        <Text color={theme.fontColor.white60} fontSize={12} blod>
          {i18n.t('other.communicate7')}
          {i18n.t('other.communicate8')}
          {i18n.t('other.communicate9')}
          {i18n.t('other.communicate10')}
          {i18n.t('other.communicate11')}
          {i18n.t('other.communicate12')}
          {i18n.t('other.communicate13')}
        </Text>
        <Button
          style={[theme.margin.lrl]}
          title={i18n.t('other.submitFeedBack')}
          radius={20}
          onPress={onPressSubmit}
        />
        <NativeTouchableOpacity
          style={[
            theme.flex.center,
            theme.flex.row,
            theme.flex.centerByCol,
            theme.margin.topm,
          ]}
          onPress={onPressToRecord}>
          <Text color={theme.fontColor.white}>
            {i18n.t('other.feedBackRecord')}
          </Text>
          <LazyImage
            imageUrl={require('@assets/icons/right-white.webp')}
            width={15}
            height={15}
          />
        </NativeTouchableOpacity>
      </View>
      {renderGetModal}
      {renderToastModal}
    </LazyImageLGBackground>
  );
};

export default FeedBack;
