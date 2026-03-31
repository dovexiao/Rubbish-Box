import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import Flex from '@/components/Flex';
import AppIcon from '@/components/AppIcon';
import { DAY_OF_WEEK, INVITE_STATUS } from '@/constants';
import AnimationPop, { type AnimationPopRef } from '@/components/AnimationPop';
import type { DetailsProp } from '../type';
import { Popup } from '@/components';

/**
 * @description 贵宾码弹层（底部弹出）。
 * @remarks
 * - 展示贵宾码、使用时间、使用次数等信息
 *
 * - 支持“发送给贵宾”的分享动作（由外部传入 onShare）
 * - 满足条件时展示“更多”菜单（编辑/作废），由外部传入 onEdit/onInvalidate
 * - 通过 ref.open()/ref.close() 命令式控制显示与关闭（基于 AnimationPop）
 * @example
 * ```tsx
 * const ref = useRef<InviteCodePopRef>(null);
 *
 * <InviteCodePop
 *   ref={ref}
 *   details={details}
 *   shareDetail={details}
 *   styles={styles}
 *   onShare={() => onShare(details)}
 * />
 *
 * ref.current?.open();
 * ```
 */
export interface InviteCodePopRef {
  /**
   * @description 打开弹层。
   */
  open: () => void;
  /**
   * @description 关闭弹层，并重置内部“更多”菜单状态。
   */
  close: () => void;
}

/**
 * @description InviteCodePop 组件入参。
 * @property details 弹层展示的详情数据（用于渲染文案/状态/时间等）
 * @property shareDetail 是否允许点击“发送给贵宾”（为空则按钮禁用）
 * @property styles 样式对象（来自页面 styles；依赖固定 key：num/popTitleText/timeBox/dateText 等）
 * @property maxHeight 弹层最大高度（透传给 AnimationPop）
 * @property onEdit 点击“编辑”回调
 * @property onInvalidate 点击“作废”回调
 * @property onShare 点击“发送给贵宾”回调
 */
interface InviteCodePopProps {
  details?: DetailsProp;
  shareDetail?: DetailsProp;
  styles: any;
  maxHeight?: number;
  onEdit?: () => void;
  onInvalidate?: () => void;
  onShare?: () => void;
}

const InviteCodePop = forwardRef<InviteCodePopRef, InviteCodePopProps>(
  (
    {
      details,
      shareDetail,
      styles,
      maxHeight = 550,
      onEdit,
      onInvalidate,
      onShare,
    },
    ref,
  ) => {
    /**
     * @description “更多”菜单是否展开（编辑/作废）。
     */
    const [isOption, setIsOption] = useState(false);
    const [visible, setVisible] = useState(false);
    const canShowMore = useMemo(() => {
      /**
       * @description 是否展示“更多”操作入口。
       * @remarks
       * - 无详情：不展示
       * - leftTime=0：约定为不可操作（仅展示）
       * - 状态为过期/作废/已使用：不展示
       */
      if (!details) return false;
      if (details.leftTime === 0) return false;
      return (
        details.status !== 10 && details.status !== 20 && details.status !== 5
      );
    }, [details]);

    const close = () => {
      /**
       * @description 关闭弹层。
       * @remarks 关闭时一并收起更多菜单，避免下次打开残留。
       */
      setIsOption(false);
      setVisible(false);
    };

    useImperativeHandle(ref, () => ({
      open: () => {
        /**
         * @description 打开弹层。
         * @remarks 打开前确保更多菜单处于收起状态。
         */
        setIsOption(false);
        setVisible(true);
      },
      close,
    }));

    return (
      <Popup
        visible={visible}
        /**
         * @description 用户手势关闭弹层时，同步重置更多菜单状态。
         */
        onClose={() => {
          setIsOption(false);
          setVisible(false);
        }}
        showClose={false}
        bodyStyle={{
          height: maxHeight,
          flex: 1,
          justifyContent: 'flex-start',
          paddingVertical: 0,
          ...styles,
        }}
      >
        <Flex
          style={styles.num}
          direction="row"
          justify="between"
          align="center"
        >
          {canShowMore ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setIsOption(v => !v);
              }}
            >
              <AppIcon name="more" size={24} color="#333333" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
          <View>
            <Text style={styles.popTitleText}>贵宾码</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={close}>
            <AppIcon name="close" size={24} color="#333333" />
          </TouchableOpacity>
        </Flex>

        {isOption && (
          <View style={styles.fixBox}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.fixBtn}
              onPress={() => {
                /**
                 * @description 点击“编辑”。
                 * @remarks 先关闭弹层，再由外部承接编辑逻辑。
                 */
                setIsOption(false);
                close();
                onEdit?.();
              }}
            >
              <Text style={styles.color333}>编辑</Text>
            </TouchableOpacity>
            <View style={styles.fixBoxLine} />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.fixBtn}
              onPress={() => {
                /**
                 * @description 点击“作废”。
                 * @remarks 先关闭弹层，再由外部承接作废逻辑。
                 */
                setIsOption(false);
                close();
                onInvalidate?.();
              }}
            >
              <Text style={styles.redColor}>作废</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contentBox}>
          <Flex
            direction="row"
            justify="between"
            style={{ width: '100%', paddingLeft: 16, paddingRight: 16 }}
          >
            <Text style={styles.rowText1}>尊敬的贵宾</Text>
            <Text
              style={[
                styles.tagBox,
                details?.status === 1 && styles.color1,
                (details?.status === 2 || details?.status === 5) &&
                  styles.color2,
                details?.status === 10 && styles.color10,
                details?.status === 20 && styles.color20,
              ]}
            >
              {INVITE_STATUS[details?.status as keyof typeof INVITE_STATUS]}
            </Text>
          </Flex>
          <Text style={styles.inviteCode}>{details?.code}</Text>
          <Text style={styles.popTime}>使用时间:</Text>
          <Flex
            direction="row"
            justify="between"
            align="center"
            style={styles.timeBox}
          >
            <Flex
              direction="column"
              justify="between"
              style={{ marginLeft: 10 }}
            >
              <Flex direction="row" align="center">
                <Text style={[styles.dateText, styles.mr12, styles.mb8]}>
                  {`${dayjs(details?.startTime).format('MM')}月${dayjs(
                    details?.startTime,
                  ).format('DD')}日`}
                </Text>
                <Text style={[styles.dateText, styles.mb8]}>
                  {
                    DAY_OF_WEEK[
                      dayjs(
                        details?.startTime,
                      ).day() as keyof typeof DAY_OF_WEEK
                    ]
                  }
                </Text>
              </Flex>
              <Text style={styles.dateTime}>
                {`${dayjs(details?.startTime).format('HH')}：${dayjs(
                  details?.startTime,
                ).format('mm')}`}
              </Text>
            </Flex>
            <AppIcon name="arrows1" size={20} color="#333333" />
            <Flex
              direction="column"
              justify="between"
              style={{ marginLeft: 10 }}
            >
              <Flex direction="row" align="center">
                <Text style={[styles.dateText, styles.mr12, styles.mb8]}>
                  {`${dayjs(details?.endTime).format('MM')}月${dayjs(
                    details?.endTime,
                  ).format('DD')}日`}
                </Text>
                <Text style={[styles.dateText, styles.mb8]}>
                  {
                    DAY_OF_WEEK[
                      dayjs(details?.endTime).day() as keyof typeof DAY_OF_WEEK
                    ]
                  }
                </Text>
              </Flex>
              <Text style={styles.dateTime}>
                {`${dayjs(details?.endTime).format('HH')}：${dayjs(
                  details?.endTime,
                ).format('mm')}`}
              </Text>
            </Flex>
          </Flex>
          <Flex direction="row" justify="center" align="center">
            <Text style={styles.dateText}>使用次数：</Text>
            <Text style={styles.dateText}>
              {details?.noLimit ? '不限' : details?.leftTime}
            </Text>
          </Flex>
        </View>
        {details?.status === 1 && (
          <View style={styles.popup}>
            <Flex
              style={{ width: '100%', marginTop: 31, marginBottom: 16 }}
              direction="row"
              justify="center"
              align="center"
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.cancalBtn}
                onPress={close}
              >
                <Text>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.confirmBtn, styles.bgColor333]}
                onPress={() => {
                  // 统一先关闭弹层，避免跳转到微信后返回时弹层遮罩残留导致页面卡住
                  close();
                  onShare?.();
                }}
                disabled={!shareDetail}
              >
                <Text style={{ color: '#ffffff' }}>发送给贵宾</Text>
              </TouchableOpacity>
            </Flex>
          </View>
        )}
      </Popup>
    );
  },
);

export default InviteCodePop;
