import React from 'react'
import { LoginModal } from './LoginModal'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { useLoginModal } from '../hooks/useLoginModal'
import { setLoginModalRef } from '../utils/loginUtils'
import { useLockScreenStore } from '../stores/lockScreenStore'
import { useNetworkStore } from '../stores/networkStore'
import { useUserStore } from '../stores/userStore'

/**
 * 全局登录管理器组件
 * 在App根组件中使用，提供全局登录弹窗功能
 */
export const GlobalLoginManager = React.memo(function GlobalLoginManager() {
  const {
    // 登录弹窗
    isVisible,
    showLoginModal,
    hideLoginModal,
    handleLoginSuccess,
    handleLoginCancel,
    // 忘记密码弹窗
    forgotPasswordVisible,
    showForgotPasswordModal,
    hideForgotPasswordModal,
    handleForgotPasswordSuccess,
    handleForgotPasswordCancel,
    handleForgotPasswordBack,
  } = useLoginModal()

  const locked = useLockScreenStore((state) => state.locked)
  const showNetworkModal = useNetworkStore((state) => state.showNetworkModal)
  const token = useUserStore((state) => state.token)
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)

  // 🔴 关键：监听 token 状态，如果 token 恢复且弹窗正在显示，自动关闭弹窗
  React.useEffect(() => {
    if (token && isLoggedIn && isVisible) {
      console.log("🔐 Token已恢复，自动关闭登录弹窗")
      hideLoginModal()
    }
  }, [token, isLoggedIn, isVisible, hideLoginModal])

  // 将实例设置到全局，供其他地方调用
  React.useEffect(() => {
    setLoginModalRef({
      showLoginModal,
      hideLoginModal,
    })
  }, [showLoginModal, hideLoginModal])

  return (
    <>
      {/* 登录弹窗 */}
      <LoginModal
        visible={isVisible && !locked && !showNetworkModal}
        onSuccess={handleLoginSuccess}
        onCancel={handleLoginCancel}
        onShowForgotPassword={() => showForgotPasswordModal()}
      />
      
      {/* 忘记密码弹窗 */}
      <ForgotPasswordModal
        visible={forgotPasswordVisible && !locked && !showNetworkModal}
        onSuccess={handleForgotPasswordSuccess}
        onCancel={handleForgotPasswordCancel}
        onBack={handleForgotPasswordBack}
      />
    </>
  )
})

export default GlobalLoginManager
