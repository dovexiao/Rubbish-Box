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
      return response
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
      return response
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
