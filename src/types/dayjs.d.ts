declare module 'dayjs' {
  // 使用 any 简化 dayjs 类型，主要目的是消除 TS(2307) 报错
  const dayjs: any;
  export default dayjs;
}
