import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PickerView } from '@ant-design/react-native';
import { PageContainer, Popup } from '@/components';
import AppIcon from '@/components/AppIcon';
import { saveOrUpdate, getDetail } from '@/services/setting';
import { regionData, getPickerResultByValues } from '@/utils/regionData';
import styles from './styles';
import GradientButton from '@/components/GradientButton';
import { hideLoading, showLoading, showToast } from '@/utils';

interface AddressDetail {
  id?: number | string;
  name?: string;
  phone?: string;
  province?: string;
  provinceCode?: string;
  city?: string;
  cityCode?: string;
  county?: string;
  countyCode?: string;
  detailAddress?: string;
}

export default function AddressCreate() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as number | string | undefined;

  const [loading, setLoading] = useState<boolean>(!!id);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [city, setCity] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [county, setCounty] = useState('');
  const [countyCode, setCountyCode] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const [regionPopupVisible, setRegionPopupVisible] = useState(false);
  const [pickerValue, setPickerValue] = useState<(string | number)[]>([]);

  const navTitle = id ? '编辑地址' : '创建新地址';

  const loadDetail = useCallback(async () => {
    if (!id) return;
    try {
      const res: any = await getDetail({ id });
      const d: AddressDetail = res?.data ?? res ?? {};
      setName(d.name || '');
      setPhone(d.phone || '');
      setProvince(d.province || '');
      setProvinceCode(d.provinceCode || '');
      setCity(d.city || '');
      setCityCode(d.cityCode || '');
      setCounty(d.county || '');
      setCountyCode(d.countyCode || '');
      setDetailAddress(d.detailAddress || '');
      // 若有 code，可尝试推回 pickerValue（可选）
    } catch (e) {
      showToast('获取地址详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      void loadDetail();
    }
  }, [id, loadDetail]);

  const openRegionPopup = () => {
    setRegionPopupVisible(true);
  };

  const confirmRegion = () => {
    if (!pickerValue || pickerValue.length < 3) {
      showToast('请选择省市区');
      return;
    }
    const data = getPickerResultByValues(regionData, pickerValue);
    if (data.length < 3) {
      showToast('请选择省市区');
      return;
    }
    const p = data[0];
    const c = data[1];
    const a = data[2];
    const provinceLabel = p?.label || '';
    const cityLabel = c?.label === '市辖区' ? provinceLabel : c?.label || '';
    const countyLabel = a?.label || '';

    setProvince(provinceLabel);
    setProvinceCode(p?.value || '');
    setCity(cityLabel);
    setCityCode(c?.value || '');
    setCounty(countyLabel);
    setCountyCode(a?.value || '');
    setRegionPopupVisible(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('请输入姓名');
      return;
    }
    if (!phone.trim() || !/(1[3-9]\d{9})/.test(phone.trim())) {
      showToast('请输入正确的手机号');
      return;
    }
    if (!province || !city || !county) {
      showToast('请选择地区');
      return;
    }
    if (!detailAddress.trim()) {
      showToast('请输入详细地址');
      return;
    }

    if (saving) return;
    setSaving(true);
    const fullAddress = `${province}${city}${county}${detailAddress}`.trim();
    const title = id ? '编辑' : '新增';
    showLoading({ title: '提交中...' });

    try {
      const payload: any = {
        id,
        name: name.trim(),
        phone: phone.trim(),
        province,
        provinceCode,
        city,
        cityCode,
        county,
        countyCode,
        detailAddress: detailAddress.trim(),
        fullAddress,
      };
      const res: any = await saveOrUpdate(payload);
      hideLoading();
      if (res === true || Number(res?.code) === 200) {
        showToast(`${title}成功`);
        navigation.goBack();
      } else {
        const msg = (res && (res.message || res.msg)) || `${title}失败`;
        showToast(msg);
      }
    } catch (e) {
      hideLoading();
      showToast('提交失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const regionText =
    province && city && county ? `${province}${city}${county}` : '请选择';

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: navTitle,
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={loading}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.card}>
            {/* 联系人 */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>联系人</Text>
              <View style={styles.fieldValueWrap}>
                <TextInput
                  style={styles.textInput}
                  placeholder="请输入姓名"
                  placeholderTextColor="#CCCCCC"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* 手机号码 */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>手机号码</Text>
              <View style={styles.fieldValueWrap}>
                <TextInput
                  style={styles.textInput}
                  placeholder="请输入手机号"
                  placeholderTextColor="#CCCCCC"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="number-pad"
                  maxLength={11}
                />
              </View>
            </View>

            {/* 选择地区 */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={openRegionPopup}
              style={styles.fieldRow}
            >
              <Text style={styles.fieldLabel}>选择地区</Text>
              <View style={styles.fieldValueWrap}>
                <Text
                  style={
                    regionText === '请选择'
                      ? styles.placeholderText
                      : styles.regionText
                  }
                  numberOfLines={1}
                >
                  {regionText}
                </Text>
                <View style={styles.arrowIconWrap}>
                  <AppIcon name="a-headfor-20" size={16} color="#333333" />
                </View>
              </View>
            </TouchableOpacity>

            {/* 详细地址 */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>详细地址</Text>
              <View style={styles.fieldValueWrap}>
                <TextInput
                  style={styles.textInput}
                  placeholder="请输入街道门牌信息"
                  placeholderTextColor="#CCCCCC"
                  value={detailAddress}
                  onChangeText={setDetailAddress}
                  multiline={false}
                />
              </View>
            </View>
          </View>
          <View style={styles.footerBtnWrap}>
            <GradientButton
              colors={['#4A4A4A', '#282828']}
              width={196}
              height={48}
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>保存地址</Text>
            </GradientButton>
          </View>
          {/* 地区选择弹窗 */}
          <Popup
            visible={regionPopupVisible}
            onClose={() => setRegionPopupVisible(false)}
            title="请选择省市区"
            minHeight={320}
            footer={
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={confirmRegion}
                style={styles.popupBtn}
              >
                <Text style={styles.popupBtnText}>确定</Text>
              </TouchableOpacity>
            }
          >
            <PickerView
              data={regionData as any}
              cascade
              value={pickerValue}
              onChange={v => setPickerValue(v || [])}
              style={{ height: 280 }}
              itemHeight={50}
              itemStyle={{ padding: 0 }}
            />
          </Popup>
        </View>
      </TouchableWithoutFeedback>
    </PageContainer>
  );
}
