import React, { useCallback, useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Carousel } from '@ant-design/react-native';
import { PageContainer, Flex, Popup, Stepper } from '@/components';
import GradientButton from '@/components/GradientButton';
import { getGoodsDetail } from '@/services/mall';
import { getMiniToken } from '@/services/common';
import { wechatOpenMiniProgram } from '@/utils/wechat';
import styles from './styles';
import { showToast } from '@/utils';
import { px } from '@/utils/ui';

type GoodsDetailDTO = {
  id: number;
  productName: string;
  mainImage: string[];
  currentPrice: number;
  originalPrice: number;
  stock: number;
  saleNum: number;
  detailImage: string[];
};

export default function GoodsDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const productId = route.params?.id ? String(route.params.id) : '';

  const [goodsDetail, setGoodsDetail] = useState<GoodsDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [productNum, setProductNum] = useState(1);
  // 详情长图宽高比，用于自适应高度
  const [detailRatios, setDetailRatios] = useState<number[]>([]);

  const loadDetail = useCallback(async () => {
    if (!productId) {
      showToast({ title: '商品ID不存在', icon: 'info' });
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      const res = await getGoodsDetail({ productId });
      if (res.code === 200 && res.success) {
        setGoodsDetail(res.data as GoodsDetailDTO);
      } else {
        showToast({
          title: res.msg || res.message || '获取商品详情失败',
          icon: 'info',
        });
        navigation.goBack();
      }
    } catch (e) {
      showToast({ title: '获取商品详情失败', icon: 'info' });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [productId, navigation]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleBuy = useCallback(() => {
    if (!goodsDetail) return;
    setProductNum(1); // 重置数量为1
    setPopupVisible(true);
  }, [goodsDetail]);

  const handleConfirmBuy = useCallback(async () => {
    if (!goodsDetail) return;

    try {
      // 获取小程序 token
      const tokenRes = await getMiniToken({});
      if (!tokenRes.success || !tokenRes.data?.token) {
        showToast({ title: '获取小程序token失败', icon: 'info' });
        return;
      }

      // 构建跳转参数
      const params: any = {
        productId: goodsDetail.id,
        orderAmount: goodsDetail.currentPrice,
        addressId: -1,
        productNum,
        productDetail: JSON.stringify(goodsDetail), // 必须转为 JSON 字符串传递
        token: tokenRes.data.token,
      };
      // 打开小程序购买页面
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
        .join('&');

      const result = await wechatOpenMiniProgram(
        `pages/mall/buyResult/index?${queryString}`,
      );

      if (result.result) {
        setPopupVisible(false);
      } else {
        showToast({ title: result.message || '打开小程序失败', icon: 'info' });
      }
    } catch (error: any) {
      showToast({ title: error?.message || '购买失败，请重试', icon: 'info' });
    }
  }, [goodsDetail, productNum]);

  const footer = (
    <View style={styles.footer}>
      <GradientButton
        style={styles.buyButton}
        width={px(191)}
        height={px(48)}
        colors={['#020101ff', '#282828']}
        onPress={handleBuy}
      >
        <Text style={styles.buyButtonText}>立即购买</Text>
      </GradientButton>
    </View>
  );

  return (
    <PageContainer
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={true}
      pageNavProps={{
        text: '商品详情',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={loading}
      footer={footer}
    >
      {goodsDetail && (
        <>
          <Flex direction={'column'}>
            <Carousel
              autoplay
              autoplayInterval={3000}
              dots
              style={styles.swiper}
            >
              {goodsDetail.mainImage && goodsDetail.mainImage.length > 0
                ? goodsDetail.mainImage.map((mainImage, index) => (
                    <View
                      key={mainImage}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <Image
                        source={{ uri: mainImage }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                      />
                    </View>
                  ))
                : null}
            </Carousel>
          </Flex>
          <Flex style={styles.detailInfo} direction={'column'}>
            <Flex justify={'between'} align={'end'}>
              <Flex align={'center'}>
                <Text style={styles.detailPrice}>
                  ¥{goodsDetail.currentPrice}
                </Text>
                <Text style={styles.detailOriginalPrice}>
                  ¥{goodsDetail.originalPrice}
                </Text>
              </Flex>
              <Text style={styles.detailSaleNum}>
                月售：{goodsDetail.saleNum}
              </Text>
            </Flex>
            <Text style={styles.detailName}>{goodsDetail.productName}</Text>
            <Text style={styles.detailStock}>库存：{goodsDetail.stock}</Text>
          </Flex>

          <Flex style={styles.detailTitle} align={'center'} justify={'center'}>
            <View style={styles.line}></View>
            <Text style={styles.detailTitleText}>商品详情</Text>
            <View style={styles.line}></View>
          </Flex>

          <Flex
            direction="column"
            justify="center"
            align="center"
            style={styles.detail}
          >
            {goodsDetail?.detailImage && goodsDetail.detailImage.length > 0
              ? goodsDetail.detailImage.map((detailImage, index) => (
                  <Image
                    key={index}
                    source={{ uri: detailImage }}
                    style={{
                      width: '100%',
                      // 给个初始占位比例1，等图片 onLoad 返回真实宽高比时重新撑开高度
                      aspectRatio: detailRatios[index] || 1,
                    }}
                    resizeMode="contain"
                    onLoad={e => {
                      const { width, height } = e.nativeEvent.source;
                      if (width > 0 && height > 0) {
                        setDetailRatios(prev => {
                          const newRatios = [...prev];
                          newRatios[index] = width / height;
                          return newRatios;
                        });
                      }
                    }}
                  />
                ))
              : null}
          </Flex>
        </>
      )}

      {/* 购买弹窗 */}
      <Popup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        title=""
      >
        {goodsDetail && (
          <View style={styles.popupContent}>
            <Flex style={styles.popupBody}>
              {goodsDetail.detailImage && goodsDetail.detailImage[0] ? (
                <Image
                  source={{ uri: goodsDetail.detailImage[0] }}
                  style={styles.popupImage}
                  resizeMode="contain"
                />
              ) : null}

              <Flex
                direction="column"
                style={styles.popupInfo}
                justify="between"
              >
                <Text style={styles.popupTitle} numberOfLines={2}>
                  {goodsDetail.productName}
                </Text>
                <Text style={styles.popupPrice}>
                  ¥{goodsDetail.currentPrice}
                </Text>

                <Flex align="center">
                  <Stepper
                    initValue={productNum}
                    min={1}
                    size={px(12)}
                    max={goodsDetail.stock}
                    onChange={value => {
                      setProductNum(Number(value));
                    }}
                  />
                  <Text style={styles.popupStock}>
                    库存：{goodsDetail.stock}
                  </Text>
                </Flex>
              </Flex>
            </Flex>

            <Flex justify="center" style={styles.popupFooter}>
              <GradientButton
                style={styles.goodsPopupBuyBtn}
                width={px(156)}
                height={px(48)}
                colors={['#333333', '#333333']}
                onPress={handleConfirmBuy}
              >
                <Text style={styles.popupBuyText}>购买</Text>
              </GradientButton>
            </Flex>
          </View>
        )}
      </Popup>
    </PageContainer>
  );
}
