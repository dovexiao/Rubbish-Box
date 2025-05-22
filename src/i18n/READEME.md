### 多语言配置

```
  采用国际语言规范命名配置文件
  如: `zh_CN.ts`, `en_US.ts`, `en_CA.ts`
  对于前缀相同的,比如`en_US.ts`, `en_CA.ts`
  可以考虑使创建`en.ts`来定义公共部分
  i18n支持在`en_XX`中未找到时,回退到`en`
```

### 基本结构:

```
  {
    "页面": {
      "类型": {
        // 当key不重复或无歧义时,直接使用
        "key": "value"
        // 当key重复或有歧义时,考虑添加一层元素
        "元素": {
          "key": "value"
        }
      }
    }
  }
```

e.g.

```
  {
    home: {
      title: {
        lottery: 'Lottery',
        card: {
          lottery: 'xxx lottery'
        }
      }
    }
  }

```

对于一些约定好的,可以直接放在最外层直接定义,如:

```
  {
    label: {
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    tip: {
      success: 'Success'
    }
  }

```

对于一些确定不会有差异的(如上提到的 confirm 等),可以放在`src/components/i18n`下
页面上依赖的,要放在外部

#### 对于类型

```
  1.label: button和label中的文字
  2.tip: tooltip/popover/placeholder或text等元素中的提示性文本
  3.text: 一些长的说明文本
  4.有待补充
```

#### 新的库使用方法

```
  1.组件内部的多语言，使用hook方式 const {i18n} = useTranslation();
  2.组件外部，如普通函数等，无需更改 按原方式使用

```
