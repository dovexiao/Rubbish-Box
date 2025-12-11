import { post } from "./api"

/**
 * 积分商城相关API服务
 * 100%还原UniApp项目 /src/service/pointsMall.ts
 */

// ==================== 类型定义 ====================

/**
 * 积分余额数据
 */
export interface PointsBalanceData {
  points: number
}

/**
 * 兑换记录单个项目
 */
export interface ExchangeRecordItem {
  id: number
  product_name: string
  change_amount: number
  created_at: string
  status_display: string
  logistics_status_display: string
  exchange_quantity: number
  image: string
}

/**
 * 兑换记录响应数据结构
 */
export interface ExchangeRecordsResponse {
  records: ExchangeRecordItem[]
  total: number
  current_page: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

/**
 * 兑换记录请求参数
 */
export interface ExchangeRecordsParams {
  page: string
  per_page: string
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  total: number
  per_page: number
  current_page: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
  next_page: number
  previous_page: number
}

/**
 * 商品列表请求参数
 */
export interface MallListParams {
  page: string
  per_page: string
  category: number
  redeemable_only: boolean
}

/**
 * 商品列表单个项目
 */
export interface ProductItem {
  id: number
  name: string
  description: string
  price: number
  original_points: number
  stock: number
  is_active: boolean
  image: string
  heat: number
}

export interface CategoryItem {
  id: number
  name: string
}

/**
 * 商品列表响应数据结构
 */
export interface MallListResponse {
  items: ProductItem[]
  pagination: PaginationInfo
  categories: CategoryItem[]
  [property: string]: any;
}

/**
 * 商品详情请求参数
 */
export interface ProductDetailParams {
  product_id: string
}

/**
 * 商品详情图片
 */
export interface ProductImage {
  id: number
  url: string
  sort_order: number
}

/**
 * 商品详情响应数据结构
 */
export interface ProductDetailResponse {
  id: number
  name: string
  description: string
  price: number
  stock: number
  shipping_address: string
  is_active: boolean
  heat: number
  images: ProductImage[]
  main_image: string
  detail_image: ProductImage[]
  host_graph: ProductImage[]
}

/**
 * 积分明细单个项目
 */
export interface PointsItem {
  balance: number
  created_at: string
  description: string
  id: number
  points: number
  type: string
  type_display: string
}

/**
 * 积分明细响应数据结构
 */
export interface PointsDetailResponse {
  points_list: PointsItem[]
  current_page: number
  total_pages: number
  has_next: boolean
}

/**
 * 收货地址单个项目
 */
export interface AddressItem {
  city: string // 城市文本
  city_text: string // 城市文本（备用）
  city_code?: string // 城市编码（可选）
  detail_address: string
  district: string // 区县文本
  district_text: string // 区县文本（备用）
  district_code?: string // 区县编码（可选）
  id: number
  is_default: boolean
  phone: string
  province: string // 省份文本
  province_text: string // 省份文本（备用）
  province_code?: string // 省份编码（可选）
  receiver_name: string
  user: string
}

/**
 * 添加收货地址请求参数
 */
export interface AddAddressParams {
  receiver_name: string
  phone: string
  province: string
  city: string
  district: string
  detail_address: string
  is_default?: boolean
}

/**
 * 修改收货地址请求参数
 */
export interface UpdateAddressParams extends AddAddressParams {
  id: number
}

/**
 * 删除收货地址请求参数
 */
export interface DeleteAddressParams {
  address_id: number
}

/**
 * 兑换商品请求参数
 */
export interface ExchangeProductParams {
  product_id: string
  address_id: string
}

/**
 * 删除兑换记录请求参数
 */
export interface DeleteExchangeRecordParams {
  record_id: number
}

/**
 * 获取7天打卡活动列表数据结构
 */
export interface WeekCheckInListData {
  consecutive_days: number;
  today_checked: boolean;
  today_date: string;
  week_check_list: WeekCheckListItem[];
  [property: string]: any;
}

/**
 * 7天打卡活动列表单个项目
 */
export interface WeekCheckListItem {
  checked: boolean;
  date: string;
  is_today: boolean;
  weekday: string;
  [property: string]: any;
}

/**
 * 每日打卡练习题数据结构
 */
export interface DailyCheckInExerciseData {
  questions: Question[];
  quiz_date: string;
  quiz_id: number;
  statistics: Statistics;
  [property: string]: any;
}

/**
 * 每日打卡练习题题目
 */
export interface Question {
  /**
   * 类型
   */
  category: string;
  /**
   * 正确答案
   */
  correct_answer: string;
  /**
   * 解析
   */
  explanation: string;
  id: number;
  is_answered: boolean;
  is_correct: null;
  /**
   * 选项
   */
  options: Options;
  question_index: number;
  /**
   * 题目
   */
  question_text: string;
  user_answer: null;
  [property: string]: any;
}

/**
* 选项
*/
export interface Options {
  A: string;
  B: string;
  C: string;
  D: string;
  [property: string]: any;
}

/**
 * 每日打卡练习题统计数据结构
 */
export interface Statistics {
  accuracy: number;
  answered_count: number;
  correct_count: number;
  total_count: number;
  total_points_earned: number;
  unanswered_count: number;
  wrong_count: number;
  [property: string]: any;
}

export interface DiscountProductListData {
  /**
   * 折扣日是否开启，周六此字段会变成True
   */
  discount_day: boolean;
  discount_products: DiscountProduct[];
  [property: string]: any;
}

export interface DiscountProduct {
  /**
   * 商品描述
   */
  description: string;
  /**
   * 商品id
   */
  id: number;
  /**
   * 商品图片
   */
  image: null | string;
  is_active: boolean;
  /**
   * 商品名称
   */
  name: string;
  /**
   * 商品所需价格，周六会有折扣
   */
  price: number;
  /**
   * 商品数量
   */
  stock: number;
  [property: string]: any;
}

// ==================== API接口 ====================

/**
 * 获取积分余额
 */
export const getPointsBalance = () => {
  return post<PointsBalanceData>("/AppStart/Protected/points_balance/", {})
}

/**
 * 获取兑换记录
 */
export const getExchangeRecords = (params: ExchangeRecordsParams) => {
  return post<ExchangeRecordsResponse>("/AppStart/Protected/exchange_records/", params)
}

/**
 * 获取商品列表
 */
export const getMallList = (params: MallListParams) => {
  return post<MallListResponse>("/AppStart/Protected/mall_list/", params)
}

/**
 * 获取商品详情
 */
export const getProductDetail = (params: ProductDetailParams) => {
  return post<ProductDetailResponse>("/AppStart/Protected/product_detail/", params)
}

/**
 * 获取收货地址列表
 */
export const getAddressList = () => {
  return post<AddressItem[]>("/AppStart/Protected/address_list/", {})
}

/**
 * 添加收货地址
 */
export const addAddress = (params: AddAddressParams) => {
  return post("/AppStart/Protected/address_create/", params)
}

/**
 * 修改收货地址
 */
export const updateAddress = (params: UpdateAddressParams) => {
  return post("/AppStart/Protected/address_update/", params)
}

/**
 * 删除收货地址
 */
export const deleteAddress = (params: DeleteAddressParams) => {
  return post("/AppStart/Protected/address_delete/", params)
}

/**
 * 兑换商品
 */
export const exchangeProduct = (params: ExchangeProductParams) => {
  return post("/AppStart/Protected/exchange_product/", params)
}

/**
 * 删除兑换记录
 */
export const deleteExchangeRecord = (params: DeleteExchangeRecordParams) => {
  return post("/AppStart/Protected/delete_exchange_record/", params)
}

/**
 * 获取积分明细
 */
export const getPoints = (params: { page: number; per_page: number }) => {
  return post<PointsDetailResponse>("/AppStart/Protected/points_detail/", params)
}

/**
 * 获取省份数据
 */
export const getProvinces = () => {
  return post<Array<{ value: string; text: string }>>("/AppStart/AddressView/get_provinces/", {})
}

/**
 * 获取城市数据
 */
export const getCities = (params: { province_code: string }) => {
  return post<Array<{ value: string; text: string }>>("/AppStart/AddressView/get_cities/", params)
}

/**
 * 获取区县数据
 */
export const getCounties = (params: { city_code: string }) => {
  return post<Array<{ value: string; text: string }>>("/AppStart/AddressView/get_counties/", params)
}

/**
 * 获取7天打卡活动列表
 */
export const getWeekCheckInList = () => {
  return post<WeekCheckInListData>("/AppStart/DailyQuiz/check_list/", {})
}

/**
 * 获取每日打卡练习题
 */
export const getDailyCheckInExercise = () => {
  return post<DailyCheckInExerciseData>("/AppStart/DailyQuiz/get_quiz_result/", {})
}

/**
 * 添加每日打卡积分
 */
export const addDailydPoints = (params: { devices: string, points: string, "points_type": "daily" }) => {
  return post("/AppStart/Protected/add_points/", params)
}

/**
 * 获取折扣商品列表
 */
export const getDiscountProductList = () => {
  return post<DiscountProductListData>("/AppStart/Protected/discount_product_list/", {})
}