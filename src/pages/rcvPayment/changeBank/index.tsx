import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import {
  Alert,
  FlatList,
  InteractionManager,
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
import { PickerView } from '@ant-design/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PageContainer, Flex, Popup } from '@/components';
import AppIcon from '@/components/AppIcon';
import { useCountDown } from '@/hooks/useCountDown';
import {
  cacheGet,
  hideLoading,
  showLoading,
  showToast,
  tencentUpload,
} from '@/utils';
import { checkPhotoPermission } from '@/utils/permissions';
import { px } from '@/utils/ui';
import { openSettings } from 'react-native-permissions';
import styles from './styles';
import {
  changeWithdrawalBankCard,
  echoWithdrawalBankCard,
  getCityArea,
  getHuiFuInterBank,
  getHuiFuTotalBank,
  sendChangeWithdrawalBankSms,
} from '@/services/user';
import { BANK_INFO } from '@/pages/balanceWallet/constants';
import SimpleLoading from '@/components/SimpleLoading/index';

type BankItem = {
  id: string;
  bankName: string;
  bankCode: string;
  icon: string;
};

type BranchItem = {
  id: string;
  bankName: string;
  bankCode: string;
};

type AreaNode = {
  label: string;
  value: string;
  children?: AreaNode[];
};

export default function RcvPaymentChangeBank() {
  const route = useRoute<any>();
  const cardType = route.params?.cardType;
  const regName = route.params?.regName;
  const changeBankStatus =
    route.params?.changeBankStatus ?? route.params?.['#sym:changeBankStatus'];
  const failReason =
    route.params?.failReason ?? route.params?.['#sym:failReason'];
  const numericChangeBankStatus = Number(changeBankStatus);

  const navigation = useNavigation<any>();
  const [currentCardType, setCurrentCardType] = useState<any>(cardType);
  const [currentRegName, setCurrentRegName] = useState(String(regName || ''));
  const [cardFrontUri, setCardFrontUri] = useState('');
  const [cardBackUri, setCardBackUri] = useState('');
  const [hasGetCode, setHasGetCode] = useState(false);

  const [cardNo, setCardNo] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [openAddress, setOpenAddress] = useState('');
  const [openBranch, setOpenBranch] = useState('');
  const [selectedBranchCode, setSelectedBranchCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [cityAreaTree, setCityAreaTree] = useState<AreaNode[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [addressPickerValues, setAddressPickerValues] = useState<
    Array<string | number>
  >([]);

  const [bankPopupVisible, setBankPopupVisible] = useState(false);
  const [bankPopupContentReady, setBankPopupContentReady] = useState(false);
  const [addressPopupVisible, setAddressPopupVisible] = useState(false);
  const [branchPopupVisible, setBranchPopupVisible] = useState(false);
  const [bankKeyword, setBankKeyword] = useState('');
  const [branchKeyword, setBranchKeyword] = useState('');
  const [bankOptions, setBankOptions] = useState<BankItem[]>([]);
  const [branchOptions, setBranchOptions] = useState<BranchItem[]>([]);
  const [loadingBankList, setLoadingBankList] = useState(true);
  const [loadingBranchList, setLoadingBranchList] = useState(false);
  const [loadingAddressList, setLoadingAddressList] = useState(true);
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusValue, setStatusValue] = useState(numericChangeBankStatus);
  const [statusReason, setStatusReason] = useState(String(failReason || ''));
  const [echoingForm, setEchoingForm] = useState(false);
  const pickerBusyRef = useRef(false);
  const bankListLoadedRef = useRef(false);
  const bankListLoadingRef = useRef(false);
  const addressListLoadingRef = useRef(false);

  const isReviewing = statusValue === 1;
  const isReviewFailed = statusValue === 3;
  const showStatusView = isReviewing || isReviewFailed;

  const { count, isCounting, start } = useCountDown(60);

  const selectedBank = useMemo(
    () => bankOptions.find(item => item.id === selectedBankId),
    [bankOptions, selectedBankId],
  );

  const bankList = useMemo(() => {
    const keyword = bankKeyword.trim();
    if (!keyword) return bankOptions;
    return bankOptions.filter(item => item.bankName.includes(keyword));
  }, [bankKeyword, bankOptions]);

  const getBankIcon = useCallback((bankName?: string) => {
    if (!bankName) return BANK_INFO['通用银行'];
    if (BANK_INFO[bankName]) return BANK_INFO[bankName];

    const matched = Object.entries(BANK_INFO).find(
      ([key]) => bankName.includes(key) || key.includes(bankName),
    );
    return matched?.[1] || BANK_INFO['通用银行'];
  }, []);

  const getDefaultAddressPickerValues = useCallback((list: AreaNode[]) => {
    if (!list.length) return [];

    const province = list[0];
    const city = province?.children?.[0];
    const district = city?.children?.[0];

    return [province?.value, city?.value, district?.value].filter(
      (value): value is string => Boolean(value),
    );
  }, []);

  const fetchHuiFuBanks = useCallback(async () => {
    if (bankListLoadedRef.current || bankListLoadingRef.current) {
      return;
    }

    bankListLoadingRef.current = true;
    setLoadingBankList(true);
    try {
      const res: any = await getHuiFuTotalBank({
        bankName: '',
        branchName: '',
      });

      if (!res?.success) {
        showToast({
          title: res?.msg || res?.message || '加载银行列表失败',
          icon: 'info',
        });
        setBankOptions([]);
        return;
      }

      const list = Array.isArray(res?.data) ? res.data : [];
      const next = list
        .filter((item: any) => item?.bankName)
        .map((item: any) => ({
          id: String(item?.bankCode || item?.bankName),
          bankName: item.bankName,
          bankCode: String(item?.bankCode || ''),
          icon: getBankIcon(item.bankName),
        }));
      setBankOptions(next);
      bankListLoadedRef.current = true;
    } catch {
      showToast({ title: '加载银行列表失败', icon: 'info' });
      setBankOptions([]);
      bankListLoadedRef.current = false;
    } finally {
      bankListLoadingRef.current = false;
      setLoadingBankList(false);
    }
  }, [getBankIcon]);

  useEffect(() => {
    void fetchHuiFuBanks();
  }, [fetchHuiFuBanks]);

  useEffect(() => {
    if (!bankPopupVisible) {
      setBankPopupContentReady(false);
      return;
    }

    setBankPopupContentReady(false);
    const task = InteractionManager.runAfterInteractions(() => {
      setBankPopupContentReady(true);
    });

    return () => {
      task.cancel();
    };
  }, [bankPopupVisible]);

  const fetchHuiFuBranchBanks = useCallback(
    async (keyword?: string, withLoading = false) => {
      if (!selectedBank?.bankName) {
        setBranchOptions([]);
        return;
      }

      if (withLoading) {
        setLoadingBranchList(true);
      }

      try {
        const res: any = await getHuiFuInterBank({
          bankName: selectedBank.bankName,
          branchName: keyword || '',
        });

        if (!res?.success) {
          showToast({
            title: res?.msg || res?.message || '加载开户行失败',
            icon: 'info',
          });
          setBranchOptions([]);
          return;
        }

        const list = Array.isArray(res?.data) ? res.data : [];
        const next = list
          .filter((item: any) => item?.bankName)
          .map((item: any) => ({
            id: String(item?.bankCode || item?.bankName),
            bankName: item.bankName,
            bankCode: String(item?.bankCode || ''),
          }));
        setBranchOptions(next);
      } catch {
        showToast({ title: '加载开户行失败', icon: 'info' });
        setBranchOptions([]);
      } finally {
        if (withLoading) {
          setLoadingBranchList(false);
        }
      }
    },
    [selectedBank?.bankName],
  );

  const getDefaultAreaValues = useCallback(
    (list: AreaNode[]) => {
      if (!selectedProvinceCode || !selectedCityCode || !selectedDistrictCode) {
        return [];
      }

      const province = list.find(
        item => String(item.value) === String(selectedProvinceCode),
      );
      const city = province?.children?.find(
        item => String(item.value) === String(selectedCityCode),
      );
      const district = city?.children?.find(
        item => String(item.value) === String(selectedDistrictCode),
      );

      return [
        province?.value || '',
        city?.value || '',
        district?.value || '',
      ].filter(Boolean);
    },
    [selectedProvinceCode, selectedCityCode, selectedDistrictCode],
  );

  const fetchCityAreaTree = useCallback(async () => {
    if (addressListLoadingRef.current) {
      return;
    }

    addressListLoadingRef.current = true;
    setLoadingAddressList(true);
    try {
      const res: any = await getCityArea({});
      const list: AreaNode[] = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      setCityAreaTree(list);
    } catch {
      showToast({ title: '加载开户地址失败', icon: 'info' });
    } finally {
      addressListLoadingRef.current = false;
      setLoadingAddressList(false);
    }
  }, []);

  const buildAddressText = useCallback(
    (provinceCode: string, cityCode: string, districtCode: string) => {
      const province = cityAreaTree.find(
        item => String(item.value) === String(provinceCode),
      );
      const city = (province?.children || []).find(
        item => String(item.value) === String(cityCode),
      );
      const district = (city?.children || []).find(
        item => String(item.value) === String(districtCode),
      );

      const fullName = `${province?.label || ''}${city?.label || ''}${
        district?.label || ''
      }`;
      if (fullName) return fullName;
      return `${provinceCode || ''}${cityCode || ''}${districtCode || ''}`;
    },
    [cityAreaTree],
  );

  useEffect(() => {
    void fetchCityAreaTree();
  }, [fetchCityAreaTree]);

  useEffect(() => {
    if (!cityAreaTree.length) return;
    if (!selectedProvinceCode || !selectedCityCode || !selectedDistrictCode)
      return;
    setOpenAddress(
      buildAddressText(
        selectedProvinceCode,
        selectedCityCode,
        selectedDistrictCode,
      ),
    );
  }, [
    cityAreaTree,
    selectedProvinceCode,
    selectedCityCode,
    selectedDistrictCode,
    buildAddressText,
  ]);

  useEffect(() => {
    if (addressPickerValues.length) return;
    if (!cityAreaTree.length) return;

    const defaultValues = getDefaultAddressPickerValues(cityAreaTree);
    if (defaultValues.length) {
      setAddressPickerValues(defaultValues);
    }
  }, [addressPickerValues.length, cityAreaTree, getDefaultAddressPickerValues]);

  useEffect(() => {
    if (!branchPopupVisible) return;
    if (!branchKeyword.trim()) return;
    void fetchHuiFuBranchBanks(branchKeyword.trim());
  }, [branchPopupVisible, branchKeyword, fetchHuiFuBranchBanks]);

  const codeButtonText = isCounting
    ? `${count}s`
    : hasGetCode
    ? '重新获取'
    : '获取验证码';

  const submitDisabled =
    !cardFrontUri ||
    !cardBackUri ||
    !String(currentRegName || '').trim() ||
    !cardNo.trim() ||
    !selectedBank ||
    !openAddress ||
    !openBranch ||
    !selectedBranchCode ||
    !selectedProvinceCode ||
    !selectedCityCode ||
    !selectedDistrictCode ||
    !mobile.trim() ||
    verifyCode.trim().length !== 6;

  const sendSmsCode = useCallback(async () => {
    if (isCounting || sendingCode) return;

    const mobileText = mobile.trim();
    if (!mobileText || mobileText.length !== 11) {
      showToast({ title: '请输入正确手机号', icon: 'info' });
      return;
    }

    setSendingCode(true);
    showLoading({ title: '发送中...' });
    try {
      const userIdRaw = await cacheGet({ key: 'userId' });
      const userId = Number(userIdRaw);
      const res: any = await sendChangeWithdrawalBankSms({
        userId: Number.isNaN(userId) ? undefined : userId,
        mobile: mobileText,
      });

      if (res?.success && res?.data === true) {
        start();
        showToast({ title: '验证码已发送', icon: 'success' });
        setHasGetCode(true);
        return;
      }

      showToast({
        title: res?.msg || res?.message || '验证码发送失败',
        icon: 'info',
      });
    } catch {
      showToast({ title: '验证码发送失败', icon: 'info' });
    } finally {
      hideLoading();
      setSendingCode(false);
    }
  }, [isCounting, mobile, sendingCode, start]);

  const submitChangeBank = useCallback(async () => {
    if (submitDisabled || submitting) return;

    const verifyCodeText = verifyCode.trim();
    if (verifyCodeText.length !== 6) {
      showToast({ title: '请输入6位验证码', icon: 'info' });
      return;
    }
    const backImageUrl = cardBackUri;
    if (!backImageUrl) {
      showToast({ title: '请上传银行卡背面照片', icon: 'info' });
      return;
    }

    const cardImageUrl = cardFrontUri;
    if (!cardImageUrl) {
      showToast({ title: '请上传银行卡卡号面照片', icon: 'info' });
      return;
    }

    setSubmitting(true);
    showLoading({ title: '提交中...' });
    try {
      const cardName = String(currentRegName || '').trim();

      const res: any = await changeWithdrawalBankCard({
        cardType: String(currentCardType ?? ''),
        cardImageUrl,
        backImageUrl,
        cardName,
        cardNo: cardNo.trim(),
        bankCode: selectedBank?.bankCode || '',
        bankName: selectedBank?.bankName || '',
        branchName: openBranch.trim(),
        branchCode: selectedBranchCode,
        province: selectedProvinceCode,
        city: selectedCityCode,
        district: selectedDistrictCode,
        mobile: mobile.trim(),
        smsCode: verifyCodeText,
      });

      if (res?.success) {
        showToast({ title: '换绑申请已提交', icon: 'success' });
        navigation.goBack();
        return;
      }

      showToast({
        title: res?.msg || res?.message || '提交失败',
        icon: 'info',
      });
    } catch {
      showToast({ title: '提交失败', icon: 'info' });
    } finally {
      hideLoading();
      setSubmitting(false);
    }
  }, [
    submitDisabled,
    submitting,
    verifyCode,
    route.params?.loginType,
    cardFrontUri,
    cardBackUri,
    currentCardType,
    currentRegName,
    cardNo,
    selectedBank?.bankCode,
    selectedBank?.bankName,
    openBranch,
    selectedBranchCode,
    selectedProvinceCode,
    selectedCityCode,
    selectedDistrictCode,
    mobile,
    navigation,
  ]);

  const onPressRetryEdit = useCallback(async () => {
    if (echoingForm) return;

    setEchoingForm(true);
    showLoading({ title: '加载中...' });
    try {
      const res: any = await echoWithdrawalBankCard({});
      const detail = res?.data;
      console.log('echoWithdrawalBankCard res', detail);
      if (!res?.success || !detail) {
        showToast({
          title: res?.msg || res?.message || '回显失败',
          icon: 'info',
        });
        return;
      }

      const nextCardFrontUri = String(detail?.cardImageUrl || '').trim();
      const nextCardBackUri = String(detail?.backImageUrl || '').trim();
      const nextCardNo = String(detail?.cardNo || '').trim();
      const nextCardType = detail?.cardType;
      const nextCardName = String(detail?.cardName || '').trim();
      const nextBankCode = String(detail?.bankCode || '').trim();
      const nextBankName = String(detail?.bankName || '').trim();
      const nextBranchName = String(detail?.branchName || '').trim();
      const nextBranchCode = String(detail?.branchCode || '').trim();
      const nextProvince = String(detail?.province || '').trim();
      const nextCity = String(detail?.city || '').trim();
      const nextDistrict = String(detail?.district || '').trim();
      const nextMobile = String(detail?.mobile || '').trim();

      setCardFrontUri(nextCardFrontUri);
      setCardBackUri(nextCardBackUri);
      setCardNo(nextCardNo);
      if (
        nextCardType !== undefined &&
        nextCardType !== null &&
        `${nextCardType}` !== ''
      ) {
        setCurrentCardType(nextCardType);
      }
      if (nextCardName) {
        setCurrentRegName(nextCardName);
      }
      setOpenBranch(nextBranchName);
      setSelectedBranchCode(nextBranchCode);
      setSelectedProvinceCode(nextProvince);
      setSelectedCityCode(nextCity);
      setSelectedDistrictCode(nextDistrict);
      setOpenAddress(buildAddressText(nextProvince, nextCity, nextDistrict));
      setMobile(nextMobile);
      setVerifyCode('');

      if (nextBankCode || nextBankName) {
        const nextBankId = nextBankCode || nextBankName;
        setSelectedBankId(nextBankId);
        setBankOptions(prev => {
          const existed = prev.find(item => item.id === nextBankId);
          if (existed) return prev;
          return [
            ...prev,
            {
              id: nextBankId,
              bankName: nextBankName || nextBankCode,
              bankCode: nextBankCode,
              icon: getBankIcon(nextBankName),
            },
          ];
        });
      }

      setStatusReason(String(detail?.rejectReason || statusReason || ''));
      setStatusValue(0);
    } catch {
      showToast({ title: '回显失败', icon: 'info' });
    } finally {
      hideLoading();
      setEchoingForm(false);
    }
  }, [buildAddressText, echoingForm, getBankIcon, statusReason]);

  const handleConfirmAddressPicker = () => {
    const [provinceCode, cityCode, districtCode] = addressPickerValues;
    if (!provinceCode || !cityCode || !districtCode) {
      showToast({ title: '请选择完整开户地址', icon: 'info' });
      return;
    }

    const province = cityAreaTree.find(
      item => String(item.value) === String(provinceCode),
    );
    const city = (province?.children || []).find(
      item => String(item.value) === String(cityCode),
    );
    const district = (city?.children || []).find(
      item => String(item.value) === String(districtCode),
    );

    setSelectedProvinceCode(String(provinceCode));
    setSelectedCityCode(String(cityCode));
    setSelectedDistrictCode(String(districtCode));
    setOpenAddress(
      `${province?.label || ''}${city?.label || ''}${district?.label || ''}`,
    );
    setAddressPopupVisible(false);
  };

  const setPickedCardUri = useCallback(
    (type: 'front' | 'back', uri: string) => {
      if (!uri) return;
      if (type === 'front') setCardFrontUri(uri);
      if (type === 'back') setCardBackUri(uri);
    },
    [],
  );

  const uploadPickedCardImage = useCallback(
    async (type: 'front' | 'back', asset: any) => {
      if (!asset?.uri) return;

      showLoading({ title: '上传中...' });
      try {
        const uploadRes: any = await tencentUpload({
          file: asset.uri,
          filename: asset.fileName || `bank_card_${type}.jpg`,
          index: asset.fileSize || 0,
        });

        const location = uploadRes?.data?.Location;
        if (!uploadRes?.success || !location) {
          showToast({ title: '银行卡图片上传失败', icon: 'info' });
          return;
        }

        setPickedCardUri(type, `https://${location}`);
      } catch {
        showToast({ title: '银行卡图片上传失败', icon: 'info' });
      } finally {
        hideLoading();
      }
    },
    [setPickedCardUri],
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

          const asset = response.assets?.[0];
          if (!asset?.uri) {
            showToast({ title: '未获取到图片', icon: 'info' });
            return;
          }

          void uploadPickedCardImage(type, asset);
        },
      );
    },
    [ensureCameraPermission, uploadPickedCardImage],
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

          const asset = response.assets?.[0];
          if (!asset?.uri) {
            showToast({ title: '未获取到图片', icon: 'info' });
            return;
          }

          void uploadPickedCardImage(type, asset);
        },
      );
    },
    [uploadPickedCardImage],
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
        activeOpacity={1}
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

  const statusIconUri = isReviewing
    ? 'https://g.18qjz.cn/img/boklock/wallet/img_wait.png'
    : 'https://g.18qjz.cn/img/boklock/wallet/img_wrong.png';

  const statusTitle = isReviewing ? '审核中' : '审核失败';

  return (
    <PageContainer
      backgroundColor="#f3f4f7"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: isReviewing
          ? '审核中'
          : isReviewFailed
          ? '审核失败'
          : '换绑银行卡',
        showBack: true,
        background: '#FFFFFF',
      }}
      footer={
        showStatusView ? null : (
          <View style={styles.footerWrap}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.submitBtn,
                submitDisabled || submitting ? styles.submitBtnDisabled : null,
              ]}
              onPress={() => {
                void submitChangeBank();
              }}
            >
              <Text style={styles.submitBtnText}>换绑</Text>
            </TouchableOpacity>
          </View>
        )
      }
    >
      {showStatusView ? (
        <View style={styles.statusWrap}>
          <View style={styles.statusHeaderRow}>
            <Image source={{ uri: statusIconUri }} style={styles.statusIcon} />
            <Text style={styles.statusTitle}>{statusTitle}</Text>
          </View>
          {isReviewFailed ? (
            <Text style={styles.statusReasonText}>
              审核失败原因：{String(statusReason || '--')}
            </Text>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.statusActionBtn}
            onPress={() => {
              if (isReviewing) {
                navigation.goBack();
                return;
              }
              void onPressRetryEdit();
            }}
          >
            <Text style={styles.statusActionBtnText}>
              {isReviewing ? '返回' : '重新更改'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.sectionTitle}>到账类型</Text>
            <View style={styles.cardBox}>
              <View style={styles.radioRow}>
                <Radio
                  label={
                    currentCardType == 0
                      ? '对公到账'
                      : currentCardType == 1
                      ? '对私法人入账'
                      : '对私非法人入账'
                  }
                  active={true}
                  onPress={() => {}}
                />
              </View>
            </View>

            <Text style={styles.uploadTitle}>
              请上传<Text style={styles.userName}>{currentRegName}</Text>
              名下银行卡
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
                onPress={() => {
                  if (!cityAreaTree.length && !loadingAddressList) {
                    void fetchCityAreaTree();
                  }
                  const areaValues = getDefaultAreaValues(cityAreaTree);
                  const defaultValues =
                    areaValues.length > 0
                      ? areaValues
                      : getDefaultAddressPickerValues(cityAreaTree);
                  setAddressPickerValues(defaultValues);
                  setAddressPopupVisible(true);
                }}
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
                onPress={() => {
                  if (!selectedBank?.bankName) {
                    showToast({ title: '请先选择银行名称', icon: 'info' });
                    return;
                  }
                  setBranchKeyword('');
                  setBranchPopupVisible(true);
                  void fetchHuiFuBranchBanks('', true);
                }}
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
                      isCounting || sendingCode ? styles.codeBtnDisabled : null,
                    ]}
                    onPress={() => {
                      void sendSmsCode();
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

              <View style={styles.popupListWrap}>
                {loadingBankList || !bankPopupContentReady ? (
                  <SimpleLoading />
                ) : (
                  <FlatList
                    data={bankList}
                    style={styles.popupList}
                    keyExtractor={item => item.id}
                    initialNumToRender={12}
                    maxToRenderPerBatch={12}
                    windowSize={5}
                    removeClippedSubviews
                    keyboardShouldPersistTaps="handled"
                    extraData={selectedBankId}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.popupItem}
                        onPress={() => {
                          setBankPopupVisible(false);
                          InteractionManager.runAfterInteractions(() => {
                            setSelectedBankId(item.id);
                            setOpenBranch('');
                            setSelectedBranchCode('');
                            setBankKeyword('');
                          });
                        }}
                      >
                        <Flex align="center" gap={px(10)}>
                          <Image
                            source={{ uri: item.icon }}
                            style={styles.bankIcon}
                          />
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
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptyWrap}>
                        <Text style={styles.emptyText}>未搜索到相关银行</Text>
                      </View>
                    }
                  />
                )}
              </View>
            </View>
          </Popup>

          <Popup
            visible={addressPopupVisible}
            onClose={() => setAddressPopupVisible(false)}
            title="请选择"
            showClose={false}
          >
            <View style={styles.addressPickerHeader}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={{ width: px(60) }}
                onPress={() => setAddressPopupVisible(false)}
              >
                <Text style={styles.addressPickerCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ width: px(60) }}
                activeOpacity={0.85}
                onPress={handleConfirmAddressPicker}
              >
                <Text style={styles.addressPickerConfirmText}>完成</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.addressPickerBody}>
              {loadingAddressList ? (
                <SimpleLoading />
              ) : (
                <PickerView
                  data={cityAreaTree}
                  cols={3}
                  cascade
                  value={addressPickerValues}
                  itemHeight={px(52)}
                  numberOfLines={1}
                  style={{ height: px(220) }}
                  indicatorStyle={styles.addressPickerIndicator}
                  itemStyle={styles.addressPickerItemText}
                  onChange={(values: Array<string | number>) => {
                    setAddressPickerValues(values || []);
                  }}
                />
              )}
            </View>
          </Popup>

          <Popup
            visible={branchPopupVisible}
            onClose={() => setBranchPopupVisible(false)}
            title="请选择开户行"
            showClose
          >
            <View style={styles.popupWrap}>
              <View style={styles.searchWrap}>
                <AppIcon name="search" size={px(16)} color="#B5B5B5" />
                <TextInput
                  value={branchKeyword}
                  onChangeText={setBranchKeyword}
                  placeholder="请输入开户行名称"
                  placeholderTextColor="#CCCCCC"
                  style={styles.searchInput}
                />
              </View>

              <View style={styles.popupListWrap}>
                {loadingBranchList ? (
                  <SimpleLoading />
                ) : (
                  <FlatList
                    data={branchOptions}
                    style={styles.popupList}
                    keyExtractor={item => item.id}
                    initialNumToRender={12}
                    maxToRenderPerBatch={12}
                    windowSize={5}
                    removeClippedSubviews
                    keyboardShouldPersistTaps="handled"
                    extraData={selectedBranchCode}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.popupItem}
                        onPress={() => {
                          setBranchPopupVisible(false);
                          setOpenBranch(item.bankName);
                          setSelectedBranchCode(item.bankCode);
                        }}
                      >
                        <Text style={styles.bankName}>{item.bankName}</Text>
                        {selectedBranchCode === item.bankCode ? (
                          <Image
                            style={{ width: px(16), height: px(16) }}
                            source={{
                              uri: 'https://g.18qjz.cn/img/boklock/wallet/img_checked.png',
                            }}
                          />
                        ) : null}
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptyWrap}>
                        <Text style={styles.emptyText}>未搜索到相关开户行</Text>
                      </View>
                    }
                  />
                )}
              </View>
            </View>
          </Popup>
        </>
      )}
    </PageContainer>
  );
}
