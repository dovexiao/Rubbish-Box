import { post } from "./api"

export interface LoginResponse {
  access_token: string
  refresh_token?: string
  user_info?: {
    id: string
    phone: string
    username?: string
    avatar?: string
    password_exists?: boolean
    username_exists?: boolean
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
      const response = await post("/AppStart/SignUp/login/", {
        phoneid: phone,
        code: code,
        device_code: "mobile",
      })
      console.log("response_sms_login:", response)
      
      // 直接使用登录接口返回的数据，包含 username_exists 和 password_exists
      return {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user_info: {
          id: response.user_id || "",
          phone: phone,
          username: response.username,
          avatar: response.avatar,
          password_exists: response.password_exists,
          username_exists: response.username_exists,
        }
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
      const response = await post("/AppStart/SignUp/login/", {
        phoneid: phone,
        password: password,
        device_code: "mobile",
      })
      console.log("response_password_login:", response)
      
      // 直接使用登录接口返回的数据，包含 username_exists 和 password_exists
      return {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user_info: {
          id: response.user_id || "",
          phone: phone,
          username: response.username,
          avatar: response.avatar,
          password_exists: response.password_exists,
          username_exists: response.username_exists,
        }
      }
    } catch (error) {
      console.error("密码登录失败:", error)
      throw error
    }
  }

  /**
   * 设置密码（首次设置）
   */
  static async setPassword(firstPassword: string, secondPassword: string): Promise<void> {
    try {
      await post("/AppStart/SetPassword/set_password/", {
        the_first_time_password: firstPassword,
        the_second_time_password: secondPassword,
      })
    } catch (error) {
      console.error("设置密码失败:", error)
      throw error
    }
  }

  /**
   * 重置密码（忘记密码）
   */
  static async resetPassword(phone: string, code: string, newPassword: string, confirmPassword: string): Promise<void> {
    try {
      await post("/AppStart/SignUp/forgot-password/", {
        phoneid: phone,
        code: code,
        new_password: newPassword,
        confirm_password: confirmPassword,
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
