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
      showToast('商品ID不存在');
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      const res = await getGoodsDetail({ productId });
      if (res.code === 200 && res.success) {
        setGoodsDetail(res.data as GoodsDetailDTO);
      } else {
        showToast(res.msg || res.message || '获取商品详情失败');
        navigation.goBack();
      }
    } catch (e) {
      showToast('获取商品详情失败');
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
        showToast('获取小程序token失败');
        return;
      }

      // 构建跳转参数
      const params: Record<string, string | number> = {
        productId: goodsDetail.id,
        productNum,
        currentPrice: goodsDetail.currentPrice,
        productName: goodsDetail.productName,
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
        showToast(result.message || '打开小程序失败');
      }
    } catch (error: any) {
      showToast(error?.message || '购买失败，请重试');
    }
  }, [goodsDetail, productNum]);

  const footer = (
    <View style={styles.footer}>
      <GradientButton
        style={styles.buyButton}
        width={191}
        height={48}
        colors={['#020101ff', '#282828']}
        onPress={handleBuy}
      >
        <Text style={styles.buyButtonText}>立即购买</Text>
      </GradientButton>
    </View>
  );

  // 计算详情长图的宽高比，保证在当前屏幕宽度下等比显示
  useEffect(() => {
    if (!goodsDetail?.detailImage || goodsDetail.detailImage.length === 0) {
      setDetailRatios([]);
      return;
    }

    const urls = goodsDetail.detailImage;
    const tasks = urls.map(
      url =>
        new Promise<number>(resolve => {
          Image.getSize(
            url,
            (w, h) => {
              if (w > 0 && h > 0) {
                resolve(w / h);
              } else {
                resolve(0.75); // 默认比例，防止为 0
              }
            },
            () => resolve(0.75),
          );
        }),
    );

    void Promise.all(tasks).then(ratios => {
      setDetailRatios(ratios);
    });
  }, [goodsDetail?.detailImage]);

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
                      aspectRatio: detailRatios[index] || 0.75,
                    }}
                    resizeMode="cover"
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
                  resizeMode="cover"
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
                    size={24}
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
                width={156}
                height={48}
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
