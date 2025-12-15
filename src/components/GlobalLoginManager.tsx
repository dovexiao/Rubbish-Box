import React from 'react'
import { LoginModal } from './LoginModal'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { useLoginModal } from '../hooks/useLoginModal'
import { setLoginModalRef } from '../utils/loginUtils'

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
        visible={isVisible}
        onSuccess={handleLoginSuccess}
        onCancel={handleLoginCancel}
        onShowForgotPassword={() => showForgotPasswordModal()}
      />
      
      {/* 忘记密码弹窗 */}
      <ForgotPasswordModal
        visible={forgotPasswordVisible}
        onSuccess={handleForgotPasswordSuccess}
        onCancel={handleForgotPasswordCancel}
        onBack={handleForgotPasswordBack}
      />
    </>
  )
})

export default GlobalLoginManager
