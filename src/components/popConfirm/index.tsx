import { ForwardedRef, ReactElement, ReactNode, useImperativeHandle, useState } from "react"
import {
  Modal,
  Text,
  View,
} from '@ant-design/react-native'
import { ViewStyle, TextStyle } from 'react-native'
import Flex from "../Flex"
import popupStyle from "./styles"
import GradientButton from "../GradientButton"

interface PopConfirmProps {
  title: string | ReactNode
  showClose?: boolean
  ref: ForwardedRef<any>
  confirmText?: string
  cancelText?: string
  onConfirm?: () => any //Promise<boolean>
  onCancel?: () => any
  confirmColors?: [string, string] // 自定义确认按钮背景渐变颜色
  confirmTextColor?: string // 自定义确认按钮字体颜色
  textWeight?: TextStyle['fontWeight'] // 按钮字体加粗
  marginTop32?: boolean
  submitBtn?: ReactElement
  children?: ReactElement
  btnWrapStyle?: ViewStyle
  confirmBtnStyle?: ViewStyle
}



const PopConfirm = ({
  showClose = true,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  confirmColors = ['#333333', '#333333'], // 默认背景颜色
  confirmTextColor = '#FFFFFF', // 默认字体颜色
  textWeight = 'normal',
  marginTop32 = false,
  children,
  btnWrapStyle = {},
  confirmBtnStyle,
  ref,
  ...props
}: PopConfirmProps) => {
  const [visible, setVisible] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }));

  return (
    <Modal
      title={props.title}
      transparent
      modalType={'portal'}
      onClose={() => setVisible(false)}
      maskClosable
      visible={visible}
      closable
    >
      <Flex direction={'column'} style={popupStyle.popupContainer}>
        {children}
        <Flex
          style={[btnWrapStyle, ...(marginTop32 ? [popupStyle.btnMarginTop] : [popupStyle.btnContainerWrapper]),]}
          justify={'center'}>
          {showClose && (
            <GradientButton
              startColor="transparent"
              endColor="transparent"
              width={124}
              height={42}
              onPress={async () => {
                onCancel ? await onCancel() : setVisible(false)
              }}
              contentStyle={[popupStyle.btnContainer, popupStyle.btnContainerClose]}
            >
              <Text style={popupStyle.btnContainerCloseText}>{cancelText}</Text>
            </GradientButton>
          )}

          {props?.submitBtn ? (
            props.submitBtn
          ) : (
            <GradientButton
              startColor={confirmColors[0]}
              endColor={confirmColors[1]}
              width={showClose ? 124 : 160}
              height={42}
              onPress={async () => {
                const result = await onConfirm?.()
                // 如果 onConfirm 返回 false，则不关闭 popup；其他情况（true/undefined）都关闭
                if (result !== false) {
                  setVisible(false)
                }
              }}
              contentStyle={[popupStyle.btnContainer, {
                ...(showClose ? { marginLeft: 15 } : {}),
              }]}>
              <Text
                style={[popupStyle.btnContainerConfirmText, { color: confirmTextColor, fontWeight: textWeight, ...confirmBtnStyle }]}>
                {confirmText}
              </Text>
            </GradientButton>
          )}
        </Flex>
      </Flex>

    </Modal>
  )
}

export default PopConfirm;