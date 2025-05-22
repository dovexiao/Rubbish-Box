## Text 组件

基于 react-native-element 的 text 封装,支持所有原本属性

拓展了四个属性
fontFamily?: 'fontDin' | 'fontAnybody' | 'fontInter' | 'fontInterBold' = 'fontInter';
fontSize?: TextStyle['fontSize'] = font.m;
fontWeight?: TextStyle['fontWeight'] = 'normal';
color?: string // 指定颜色
second?: boolean // 二级主题色,默认一级
accent?: boolean // 三级主题色,默认一级
secAccent?: boolean // 四级主题色,默认一级
