# 页面的按钮，含有 Page All、向左和向右的按钮

type PageButtonType = 'all' | 'left' | 'right';

interface PageButtonProps {
/** 页面按钮的类型 \*/
type?: PageButtonType;
/** 按钮是否失效 _/
disabled?: boolean;
/\*\* 按钮按下时触发事件 _/
onPress?: () => void;
}
