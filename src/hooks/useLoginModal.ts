import { useState, useCallback } from 'react'

interface LoginModalState {
  isVisible: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

interface ForgotPasswordModalState {
  isVisible: boolean
  onSuccess?: () => void
  onCancel?: () => void
  onBack?: () => void
}

/**
 * 全局登录弹窗管理Hook
 * 确保同时只能显示一个登录弹窗
 */
export function useLoginModal() {
  const [modalState, setModalState] = useState<LoginModalState>({
    isVisible: false,
  })
  
  const [forgotPasswordState, setForgotPasswordState] = useState<ForgotPasswordModalState>({
    isVisible: false,
  })

  // 显示登录弹窗
  const showLoginModal = useCallback((options?: {
    onSuccess?: () => void
    onCancel?: () => void
  }) => {
    // 如果已经有登录弹窗显示，先关闭
    if (modalState.isVisible) {
      hideLoginModal()
    }
    
    setModalState({
      isVisible: true,
      onSuccess: options?.onSuccess,
      onCancel: options?.onCancel,
    })
    
    console.log('🔐 显示登录弹窗')
  }, [modalState.isVisible])

  // 隐藏登录弹窗
  const hideLoginModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isVisible: false,
    }))
    console.log('🔐 隐藏登录弹窗')
  }, [])

  // 登录成功回调
  const handleLoginSuccess = useCallback(() => {
    const { onSuccess } = modalState
    hideLoginModal()
    onSuccess?.()
    console.log('✅ 登录成功')
  }, [modalState, hideLoginModal])

  // 登录取消回调
  const handleLoginCancel = useCallback(() => {
    const { onCancel } = modalState
    hideLoginModal()
    onCancel?.()
    console.log('❌ 登录取消')
  }, [modalState, hideLoginModal])

  // 显示忘记密码弹窗
  const showForgotPasswordModal = useCallback((options?: {
    onSuccess?: () => void
    onCancel?: () => void
  }) => {
    setForgotPasswordState({
      isVisible: true,
      onSuccess: options?.onSuccess,
      onCancel: options?.onCancel,
      onBack: () => {
        hideForgotPasswordModal()
        showLoginModal(options)
      }
    })
    console.log('🔐 显示忘记密码弹窗')
  }, [])

  // 隐藏忘记密码弹窗
  const hideForgotPasswordModal = useCallback(() => {
    setForgotPasswordState(prev => ({
      ...prev,
      isVisible: false,
    }))
    console.log('🔐 隐藏忘记密码弹窗')
  }, [])

  // 忘记密码成功回调
  const handleForgotPasswordSuccess = useCallback(() => {
    const { onSuccess } = forgotPasswordState
    hideForgotPasswordModal()
    onSuccess?.()
    console.log('✅ 忘记密码成功')
  }, [forgotPasswordState, hideForgotPasswordModal])

  // 忘记密码取消回调
  const handleForgotPasswordCancel = useCallback(() => {
    const { onCancel } = forgotPasswordState
    hideForgotPasswordModal()
    onCancel?.()
    console.log('❌ 忘记密码取消')
  }, [forgotPasswordState, hideForgotPasswordModal])

  // 忘记密码返回回调
  const handleForgotPasswordBack = useCallback(() => {
    const { onBack } = forgotPasswordState
    hideForgotPasswordModal()
    onBack?.()
    console.log('⬅️ 忘记密码返回')
  }, [forgotPasswordState, hideForgotPasswordModal])

  return {
    // 登录弹窗
    isVisible: modalState.isVisible,
    showLoginModal,
    hideLoginModal,
    handleLoginSuccess,
    handleLoginCancel,
    // 忘记密码弹窗
    forgotPasswordVisible: forgotPasswordState.isVisible,
    showForgotPasswordModal,
    hideForgotPasswordModal,
    handleForgotPasswordSuccess,
    handleForgotPasswordCancel,
    handleForgotPasswordBack,
  }
}

// 全局单例模式
let globalLoginModal: ReturnType<typeof useLoginModal> | null = null

/**
 * 获取全局登录弹窗实例
 */
export function getGlobalLoginModal() {
  if (!globalLoginModal) {
    globalLoginModal = {
      isVisible: false,
      showLoginModal: () => {},
      hideLoginModal: () => {},
      handleLoginSuccess: () => {},
      handleLoginCancel: () => {},
    }
  }
  return globalLoginModal
}

/**
 * 设置全局登录弹窗实例
 */
export function setGlobalLoginModal(modal: ReturnType<typeof useLoginModal>) {
  globalLoginModal = modal
}
