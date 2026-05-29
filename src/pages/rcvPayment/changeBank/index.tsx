import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActionSheet } from '@ant-design/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PageContainer, Flex, Popup } from '@/components';
import AppIcon from '@/components/AppIcon';
import { useCountDown } from '@/hooks/useCountDown';
import { showToast } from '@/utils';
import { checkPhotoPermission } from '@/utils/permissions';
import { px } from '@/utils/ui';
import { openSettings } from 'react-native-permissions';
import styles from './styles';

type AccountType = 'private' | 'public';
type UserType = 'legal' | 'nonlegal';

type BankItem = {
  id: string;
  bankName: string;
  bankShortName: string;
  icon: string;
};

const BANK_IMAGE_MAP = {
  0: {
    bankName: '中国工商银行',
    bankShortName: '工商银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-gongshang.png',
  },
  1: {
    bankName: '中国建设银行',
    bankShortName: '建设银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-jianshe.png',
  },
  2: {
    bankName: '交通银行',
    bankShortName: '交通银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-jiaotong.png',
  },
  3: {
    bankName: '中国民生银行',
    bankShortName: '民生银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-minsheng.png',
  },
  4: {
    bankName: '中国农业银行',
    bankShortName: '农业银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-nongye.png',
  },
  5: {
    bankName: '上海浦东发展银行',
    bankShortName: '浦发银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-pufa.png',
  },
  6: {
    bankName: '通用银行',
    bankShortName: '通用银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-tongyong.png',
  },
  7: {
    bankName: '兴业银行',
    bankShortName: '兴业银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-xingye.png',
  },
  8: {
    bankName: '中国邮政储蓄银行',
    bankShortName: '邮政银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-youzheng.png',
  },
  9: {
    bankName: '招商银行',
    bankShortName: '招商银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-zhaoshang.png',
  },
  10: {
    bankName: '中国银行',
    bankShortName: '中国银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-zhongguo.png',
  },
  11: {
    bankName: '中信银行',
    bankShortName: '中信银行',
    icon: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-zhongxin.png',
  },
} as const;

const BANK_LIST: BankItem[] = Object.keys(BANK_IMAGE_MAP).map(key => {
  const item = BANK_IMAGE_MAP[Number(key) as keyof typeof BANK_IMAGE_MAP];
  return {
    id: key,
    bankName: item.bankName,
    bankShortName: item.bankShortName,
    icon: item.icon,
  };
});

const ADDRESS_OPTIONS = [
  '浙江省杭州市余杭区',
  '浙江省杭州市西湖区',
  '江苏省南京市鼓楼区',
];
const BRANCH_OPTIONS = ['仓前分行', '未来科技城支行', '文一西路支行'];

export default function RcvPaymentChangeBank() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const hasMockData = Boolean(route.params?.mockFilled);
  const [accountType, setAccountType] = useState<AccountType>(
    hasMockData ? 'private' : 'private',
  );
  const [userType, setUserType] = useState<UserType>(
    hasMockData ? 'legal' : 'legal',
  );
  const [cardFrontUri, setCardFrontUri] = useState(
    hasMockData
      ? 'https://g.18qjz.cn/img/boklock/wallet/img_bank_card_front.png'
      : '',
  );
  const [cardBackUri, setCardBackUri] = useState(
    hasMockData
      ? 'https://g.18qjz.cn/img/boklock/wallet/img_bank_card_back.png'
      : '',
  );

  const [cardNo, setCardNo] = useState(hasMockData ? '66236648172991024' : '');
  const [selectedBankId, setSelectedBankId] = useState(hasMockData ? '8' : '');
  const [openAddress, setOpenAddress] = useState(
    hasMockData ? '浙江省杭州市余杭区' : '',
  );
  const [openBranch, setOpenBranch] = useState(hasMockData ? '仓前分行' : '');
  const [mobile, setMobile] = useState(hasMockData ? '17899027898' : '');
  const [verifyCode, setVerifyCode] = useState(hasMockData ? '126642' : '');

  const [bankPopupVisible, setBankPopupVisible] = useState(false);
  const [addressPopupVisible, setAddressPopupVisible] = useState(false);
  const [branchPopupVisible, setBranchPopupVisible] = useState(false);
  const [bankKeyword, setBankKeyword] = useState('');
  const pickerBusyRef = useRef(false);

  const { count, isCounting, start } = useCountDown(60);

  const selectedBank = useMemo(
    () => BANK_LIST.find(item => item.id === selectedBankId),
    [selectedBankId],
  );

  const bankList = useMemo(() => {
    const keyword = bankKeyword.trim();
    if (!keyword) return BANK_LIST;
    return BANK_LIST.filter(
      item =>
        item.bankName.includes(keyword) || item.bankShortName.includes(keyword),
    );
  }, [bankKeyword]);

  const codeButtonText = isCounting
    ? `${count}s`
    : verifyCode
    ? '重新获取'
    : '获取验证码';

  const submitDisabled =
    !cardFrontUri ||
    !cardBackUri ||
    !cardNo.trim() ||
    !selectedBank ||
    !openAddress ||
    !openBranch ||
    !mobile.trim() ||
    !verifyCode.trim();

  const setPickedCardUri = useCallback(
    (type: 'front' | 'back', uri: string) => {
      if (!uri) return;
      if (type === 'front') setCardFrontUri(uri);
      if (type === 'back') setCardBackUri(uri);
    },
    [],
  );

  const ensureCameraPermission = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: '需要相机权限',
          message: '用于拍摄银行卡照片',
          buttonPositive: '允许',
          buttonNegative: '拒绝',
          buttonNeutral: '稍后',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }, []);

  const pickFromCamera = useCallback(
    async (type: 'front' | 'back') => {
      const ok = await ensureCameraPermission();
      if (!ok) {
        showToast({ title: '未获得相机权限', icon: 'info' });
        return;
      }

      launchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: false,
        },
        response => {
          if (response.didCancel) return;
          if (response.errorCode || response.errorMessage) {
            showToast({
              title: response.errorMessage || '拍照失败',
              icon: 'info',
            });
            return;
          }

          const uri = response.assets?.[0]?.uri;
          if (!uri) {
            showToast({ title: '未获取到图片', icon: 'info' });
            return;
          }

          setPickedCardUri(type, uri);
        },
      );
    },
    [ensureCameraPermission, setPickedCardUri],
  );

  const pickFromAlbum = useCallback(
    async (type: 'front' | 'back') => {
      const photoPermission = await checkPhotoPermission();
      if (!photoPermission.granted) {
        if (photoPermission.canOpenSettings) {
          Alert.alert(
            '需要相册权限',
            photoPermission.message || '相册权限已被永久拒绝，请前往设置开启',
            [
              { text: '取消', style: 'cancel' },
              {
                text: '去设置',
                onPress: () => {
                  openSettings().catch(() => {
                    showToast({ title: '无法打开设置', icon: 'info' });
                  });
                },
              },
            ],
          );
        } else {
          showToast({
            title: photoPermission.message || '相册权限被拒绝',
            icon: 'info',
          });
        }
        return;
      }

      launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit: 1,
          quality: 0.8,
        },
        response => {
          if (response.didCancel) return;
          if (response.errorCode || response.errorMessage) {
            showToast({
              title: response.errorMessage || '选择失败',
              icon: 'info',
            });
            return;
          }

          const uri = response.assets?.[0]?.uri;
          if (!uri) {
            showToast({ title: '未获取到图片', icon: 'info' });
            return;
          }

          setPickedCardUri(type, uri);
        },
      );
    },
    [setPickedCardUri],
  );

  const onPickImage = useCallback(
    (type: 'front' | 'back') => {
      if (pickerBusyRef.current) return;
      pickerBusyRef.current = true;

      ActionSheet.showActionSheetWithOptions(
        {
          options: ['拍照', '从相册选择', '取消'],
          cancelButtonIndex: 2,
        },
        async index => {
          try {
            if (index === undefined || index === 2) return;
            if (index === 0) {
              await pickFromCamera(type);
              return;
            }
            if (index === 1) {
              await pickFromAlbum(type);
            }
          } finally {
            pickerBusyRef.current = false;
          }
        },
      );
    },
    [pickFromAlbum, pickFromCamera],
  );

  const Radio = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.radioItem}
        onPress={onPress}
      >
        <View
          style={[
            styles.radioIconWrap,
            active ? styles.radioIconWrapActive : null,
          ]}
        >
          {active ? (
            <AppIcon name="tick-white" color="#FFFFFF" size={px(16)} />
          ) : null}
        </View>
        <Text style={styles.radioText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <PageContainer
      backgroundColor="#f3f4f7"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: '换绑银行卡',
        showBack: true,
        background: '#FFFFFF',
      }}
      footer={
        <View style={styles.footerWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.submitBtn,
              submitDisabled ? styles.submitBtnDisabled : null,
            ]}
            onPress={() => {
              if (submitDisabled) return;
              showToast({ title: '换绑申请已提交', icon: 'success' });
              navigation.goBack();
            }}
          >
            <Text style={styles.submitBtnText}>换绑</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>选择到账类型</Text>
        <View style={styles.cardBox}>
          <View style={styles.radioRow}>
            <Radio label="对私到账" active={true} onPress={() => {}} />
            <Radio label="对公到账" active={false} onPress={() => {}} />
          </View>

          <View style={styles.innerDivider} />

          <View style={styles.radioRow}>
            <Radio label="法人入账" active={true} onPress={() => {}} />
            <Radio label="非法人入账" active={false} onPress={() => {}} />
          </View>
        </View>

        <Text style={styles.uploadTitle}>
          请上传<Text style={styles.userName}>李敏</Text>名下银行卡
        </Text>
        <View style={[styles.cardBox, styles.uploadBox]}>
          <TouchableOpacity
            style={styles.uploadItem}
            activeOpacity={0.85}
            onPress={() => onPickImage('front')}
          >
            <Text style={styles.uploadLabel}>银行卡卡号面</Text>
            {cardFrontUri ? (
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: cardFrontUri }}
                  style={styles.bankCardImage}
                />
                <TouchableOpacity
                  style={styles.imageClose}
                  onPress={() => setCardFrontUri('')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.imageCloseText}>x</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <AppIcon name="camera" size={px(20)} color="#C4C4C4" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.uploadDivider} />

          <TouchableOpacity
            style={styles.uploadItem}
            activeOpacity={0.85}
            onPress={() => onPickImage('back')}
          >
            <Text style={styles.uploadLabel}>银行卡反面</Text>
            {cardBackUri ? (
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: cardBackUri }}
                  style={styles.bankCardImage}
                />
                <TouchableOpacity
                  style={styles.imageClose}
                  onPress={() => setCardBackUri('')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.imageCloseText}>x</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <AppIcon name="camera" size={px(20)} color="#C4C4C4" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>银行卡信息</Text>
        <View style={styles.cardBox2}>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>
              <Text style={styles.required}>*</Text>银行卡号
            </Text>
            <TextInput
              value={cardNo}
              onChangeText={text => setCardNo(text.replace(/[^\d]/g, ''))}
              placeholder="请输入银行卡号"
              placeholderTextColor="#CCCCCC"
              style={styles.formInput}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity
            style={styles.formRow}
            activeOpacity={0.85}
            onPress={() => {
              setBankKeyword('');
              setBankPopupVisible(true);
            }}
          >
            <Text style={styles.formLabel}>
              <Text style={styles.required}>*</Text>银行名称
            </Text>
            <Flex align="center" style={{ flex: 1 }} justify="between">
              <Text
                style={[
                  styles.formValue,
                  !selectedBank ? styles.placeholderText : null,
                ]}
              >
                {selectedBank?.bankName || '请选择银行名称'}
              </Text>
              <AppIcon name="a-headfor-20" size={px(18)} color="#333333" />
            </Flex>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.formRow}
            activeOpacity={0.85}
            onPress={() => setAddressPopupVisible(true)}
          >
            <Text style={styles.formLabel}>
              <Text style={styles.required}>*</Text>银行开户地址
            </Text>
            <Flex align="center" style={{ flex: 1 }} justify="between">
              <Text
                style={[
                  styles.formValue,
                  !openAddress ? styles.placeholderText : null,
                ]}
              >
                {openAddress || '请选择开户地址'}
              </Text>
              <AppIcon name="a-headfor-20" size={px(18)} color="#333333" />
            </Flex>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.formRow}
            activeOpacity={0.85}
            onPress={() => setBranchPopupVisible(true)}
          >
            <Text style={styles.formLabel}>
              <Text style={styles.required}>*</Text>银行开户行
            </Text>
            <Flex align="center" style={{ flex: 1 }} justify="between">
              <Text
                style={[
                  styles.formValue,
                  !openBranch ? styles.placeholderText : null,
                ]}
              >
                {openBranch || '请选择开户行'}
              </Text>
              <AppIcon name="a-headfor-20" size={px(18)} color="#333333" />
            </Flex>
          </TouchableOpacity>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>
              <Text style={styles.required}>*</Text>银行预留手机号
            </Text>
            <TextInput
              value={mobile}
              onChangeText={text =>
                setMobile(text.replace(/[^\d]/g, '').slice(0, 11))
              }
              placeholder="请输入手机号"
              placeholderTextColor="#CCCCCC"
              style={styles.formInput}
              keyboardType="number-pad"
              maxLength={11}
            />
          </View>

          <View style={[styles.formRow, styles.formRowLast]}>
            <Text style={styles.formLabel}>
              <Text style={styles.required}>*</Text>验证码
            </Text>
            <View style={styles.codeWrap}>
              <TextInput
                value={verifyCode}
                onChangeText={text =>
                  setVerifyCode(text.replace(/[^\d]/g, '').slice(0, 6))
                }
                placeholder="请输入验证码"
                placeholderTextColor="#CCCCCC"
                style={styles.codeInput}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.codeBtn,
                  isCounting ? styles.codeBtnDisabled : null,
                ]}
                onPress={() => {
                  if (isCounting) return;
                  start();
                  showToast({ title: '验证码已发送', icon: 'success' });
                }}
              >
                <Text style={styles.codeBtnText}>{codeButtonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <Popup
        visible={bankPopupVisible}
        onClose={() => setBankPopupVisible(false)}
        title="请选择银行"
        showClose
      >
        <View style={styles.popupWrap}>
          <View style={styles.searchWrap}>
            <AppIcon name="search" size={px(16)} color="#B5B5B5" />
            <TextInput
              value={bankKeyword}
              onChangeText={setBankKeyword}
              placeholder="请输入银行名称"
              placeholderTextColor="#CCCCCC"
              style={styles.searchInput}
            />
          </View>

          <ScrollView
            style={styles.popupList}
            showsVerticalScrollIndicator={false}
          >
            {bankList.map(item => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={styles.popupItem}
                onPress={() => {
                  setSelectedBankId(item.id);
                  setBankPopupVisible(false);
                }}
              >
                <Flex align="center" gap={px(10)}>
                  <Image source={{ uri: item.icon }} style={styles.bankIcon} />
                  <Text style={styles.bankName}>{item.bankName}</Text>
                </Flex>
                {selectedBankId === item.id ? (
                  <Image
                    style={{ width: px(16), height: px(16) }}
                    source={{
                      uri: 'https://g.18qjz.cn/img/boklock/wallet/img_checked.png',
                    }}
                  />
                ) : null}
              </TouchableOpacity>
            ))}

            {bankList.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>未搜索到相关银行</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Popup>

      <Popup
        visible={addressPopupVisible}
        onClose={() => setAddressPopupVisible(false)}
        title="请选择开户地址"
        showClose
      >
        <View style={styles.popupWrap}>
          <Text style={styles.tempHint}>
            该弹窗后续补充完整数据，先使用临时选项。
          </Text>
          {ADDRESS_OPTIONS.map(item => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              style={styles.simpleOption}
              onPress={() => {
                setOpenAddress(item);
                setAddressPopupVisible(false);
              }}
            >
              <Text style={styles.simpleOptionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Popup>

      <Popup
        visible={branchPopupVisible}
        onClose={() => setBranchPopupVisible(false)}
        title="请选择开户行"
        showClose
      >
        <View style={styles.popupWrap}>
          <Text style={styles.tempHint}>
            该弹窗后续补充完整数据，先使用临时选项。
          </Text>
          {BRANCH_OPTIONS.map(item => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              style={styles.simpleOption}
              onPress={() => {
                setOpenBranch(item);
                setBranchPopupVisible(false);
              }}
            >
              <Text style={styles.simpleOptionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Popup>
    </PageContainer>
  );
}
