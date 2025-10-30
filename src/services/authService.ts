import { post } from "./api"

export interface LoginResponse {
  access_token: string
  refresh_token?: string
  user_info?: {
    id: string
    phone: string
    username?: string
    avatar?: string
  }
}

export interface SMSResponse {
  code: string
  message: string
}

/**
 * 登录相关API服务
 */
export class AuthService {
  /**
   * 发送短信验证码
   */
  static async sendSMS(phone: string): Promise<SMSResponse> {
    try {
      const response = await post("/AppStart/Input_Code", {
        phoneid: phone,
      })
      return response
    } catch (error) {
      console.error("发送验证码失败:", error)
      throw error
    }
  }

  /**
   * 短信验证码登录
   */
  static async loginWithSMS(phone: string, code: string): Promise<LoginResponse> {
    try {
      const response = await post("/AppStart/SignInPhoneid/", {
        phoneid: phone,
        code: code,
        device_code: "mobile",
      })
      console.log("response_sms_login:", response)
      // 先保存 token 到 userStore
      const { useUserStore } = await import("../stores/userStore")
      const userStore = useUserStore.getState()
      userStore.setToken(response.access_token)
      
      // 登录成功后，获取用户信息（现在有 token 了）
      const userInfoResponse = await post("/AppStart/UserInformation/user_information/", {
        device_code: "mobile",
      })
      console.log("userInfoResponse:", userInfoResponse)
      return {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user_info: userInfoResponse, // 直接使用用户信息接口返回的数据
      }
    } catch (error) {
      console.error("短信登录失败:", error)
      throw error
    }
  }

  /**
   * 账号密码登录
   */
  static async loginWithPassword(phone: string, password: string): Promise<LoginResponse> {
    try {
      const response = await post("/AppStart/SignInPassword/", {
        phoneid: phone,
        password: password,
        device_code: "mobile",
      })
      
      // 先保存 token 到 userStore
      const { useUserStore } = await import("../stores/userStore")
      const userStore = useUserStore.getState()
      userStore.setToken(response.access_token)
      
      // 登录成功后，获取用户信息（现在有 token 了）
      const userInfoResponse = await post("/AppStart/UserInformation/user_information/", {
        device_code: "mobile",
      })
      
      return {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user_info: userInfoResponse, // 直接使用用户信息接口返回的数据
      }
    } catch (error) {
      console.error("密码登录失败:", error)
      throw error
    }
  }

  /**
   * 重置密码
   */
  static async resetPassword(phone: string, code: string, newPassword: string): Promise<void> {
    try {
      await post("/AppStart/ResetPassword/", {
        phoneid: phone,
        code: code,
        password: newPassword,
      })
    } catch (error) {
      console.error("重置密码失败:", error)
      throw error
    }
  }

  /**
   * 刷新token
   */
  static async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await post("/AppStart/RefreshToken/", {
        refresh_token: refreshToken,
      })
      return response
    } catch (error) {
      console.error("刷新token失败:", error)
      throw error
    }
  }

  /**
   * 登出
   */
  static async logout(): Promise<void> {
    try {
      await post("/AppStart/Logout/")
    } catch (error) {
      console.error("登出失败:", error)
      throw error
    }
  }
}

export default AuthService
