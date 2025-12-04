/**
 * 资源路径集中管理
 * 避免在组件中硬编码资源路径
 */

// 图标
export const Icons = {
  // 导航图标 - 只保留实际存在的图标
  back: require("../../assets/images/back-icon.png"),
}

// 应用图片
export const AppImages = {
  // 应用图标和启动图 - 使用实际存在的文件
  // 这些文件在assets/app/icons目录中，但不在images目录中
}

// 静态资源图片
export const Images = {
  // 标签栏图标
  tabHome: require("../../assets/tabbar/home.png"),
  tabHomeActive: require("../../assets/tabbar/home-active.png"),
  tabStudy: require("../../assets/tabbar/study.png"),
  tabStudyActive: require("../../assets/tabbar/study-active.png"),
  tabPointsMall: require("../../assets/tabbar/pointsMall.png"),
  tabPointsMallActive: require("../../assets/tabbar/pointsMall-active.png"),
  tabMine: require("../../assets/tabbar/mine.png"),
  tabMineActive: require("../../assets/tabbar/mine-active.png"),

  // 用户相关
  userAvatarBoy: require("../../assets/images/user-avatar-boy.png"),
  userAvatarGirl: require("../../assets/images/user-avatar-girl.png"),
  userAvatar: require("../../assets/images/user-avatar.png"),

  // 首页图片
  homeSettingIcon: require("../../assets/images/home-setting-icon.png"),
  indexClassRoomBg: require("../../assets/images/index-class-room-bg.png"),
  indexUserinfoBg: require("../../assets/images/index-userinfo-bg.png"),
  indexRankBg2: require("../../assets/images/index-rank-bg1.png"),
  homeBg1: require("../../assets/images/home-bg-1.png"),
  book1: require("../../assets/images/book-1.png"),
  tipsIcon: require("../../assets/images/tips-icon.png"),
  rankGold: require("../../assets/images/rank/gold.png"),
  indexAiBtn: require("../../assets/images/index-ai-btn.png"),

  // 登录相关
  loginLogo: require("../../assets/images/login-logo.png"),

  // 学习相关
  studyImg1: require("../../assets/images/study-img1.png"),
  studyImg2: require("../../assets/images/study-img2.png"),
  studyImg3: require("../../assets/images/study-img3.png"),
  studyImg4: require("../../assets/images/study-img4.png"),
  studyImg5: require("../../assets/images/study-img5.png"),
  studyImg6: require("../../assets/images/study-img6.png"),
  studyImg8: require("../../assets/images/study-img8.png"),

  // AI相关
  aiBg1: require("../../assets/images/AI-bg1.png"),
  aiBg2: require("../../assets/images/AI-bg2.png"),
  aiResultTitleBg: require("../../assets/images/AI-result-title-bg.png"),
  aiLoadingNotionBg: require("../../assets/images/ai-loading-notion-bg.png"),
  aiResultCorrect: require("../../assets/images/ai-result-corrout.png"),
  loadingBg: require("../../assets/images/loading-bg.png"),
  frame2090059922: require("../../assets/images/Frame-2090059922.png"),
  generatedImage: require("../../assets/images/Generated-Image.png"),
  vector3417: require("../../assets/images/Vector-3417.png"),
  vector3418: require("../../assets/images/Vector-3418.png"),
  frame2090059195: require("../../assets/images/Frame 2090059195.png"),
  rectangle1312320897: require("../../assets/images/Rectangle-1312320897.png"),
  frame2090059194: require("../../assets/images/Frame-2090059194.png"),
  frame2090059962: require("../../assets/images/Frame-2090059962.png"),
  rectangle1312320903: require("../../assets/images/Rectangle 1312320903.png"),
  aiSpeaking1: require("../../assets/images/speaking-1.png"),
  aiSpeaking2: require("../../assets/images/speaking-2.png"),
  aiSpeaking3: require("../../assets/images/speaking-3.png"),


  // 课堂相关
  classroomBcj: require("../../assets/images/classroom/bcj.png"),
  classroomBgCardBottom: require("../../assets/images/classroom/bg-card-bottom.png"),
  classroomBtnLearn: require("../../assets/images/classroom/btn-learn.png"),
  classroomTopBanner: require("../../assets/images/classroom/top-banner.png"),

  // 学习背景
  studyBg1: require("../../assets/images/study/bg1.png"),
  studyBg2: require("../../assets/images/study/bg2.png"),
  studyBg3: require("../../assets/images/study/bg3.png"),

  // 学习页面专用图片 - 对应UniApp /static/images/study/目录（已迁移到/assets/images/study/）
  studyBg17: require("../../assets/images/study/bg17.png"), // 错题本图标
  studyBg18: require("../../assets/images/study/bg18.png"), // 作文批改图标
  studyBg19: require("../../assets/images/study/bg19.png"), // 作业批改图标
  studyBg20: require("../../assets/images/study/bg20.png"), // 作文收录图标
  studyBg21: require("../../assets/images/study/bg21.png"), // AI卡片背景
  studyBg22: require("../../assets/images/study/bg22.png"), // AI卡片顶部装饰
  studyBg23: require("../../assets/images/study/bg23.png"), // 阅读卡片背景
  studyBg24: require("../../assets/images/study/bg24.png"), // 阅读卡片顶部装饰
  studyBg25: require("../../assets/images/study/bg25.png"), // 课堂卡片背景
  studyBg26: require("../../assets/images/study/bg26.png"), // 课堂卡片装饰
  studyPolygon: require("../../assets/images/study/Polygon.png"), // 箭头图标

  // 旋转页面图标
  rotate: require("../../assets/images/rotate.png"),
  rotateBack: require("../../assets/images/rotate-back.png"),
  rotateConfirm: require("../../assets/images/rotate-confirm.png"),

  // 其他图标
  bluetooth: require("../../assets/images/bluetooth.png"),
  crown: require("../../assets/images/crown.png"),
  eyeExercise: require("../../assets/images/eye-exercise.png"),
  lightMonitor: require("../../assets/images/light-monitor.png"),
  pointsIcon: require("../../assets/images/points-icon.png"),
  readerShop: require("../../assets/images/reader-shop.png"),
  screenDisplay: require("../../assets/images/screen-display.png"),
  timeProtection: require("../../assets/images/time-protection.png"),
  boyReading: require("../../assets/images/boy-reading.png"),
  cartoonBoy: require("../../assets/images/cartoon-boy.png"),
  operateIcon: require("../../assets/images/operate-icon.png"),
  catalogIcon: require("../../assets/images/catalog-icon.png"),

  // 网络弹窗相关
  networkModalTitle: require("../../assets/images/network-modal-title.png"),
  networkBoy: require("../../assets/images/network-boy.png"),
}

// 统一导出
export default {
  Icons,
  AppImages,
  Images,
}
