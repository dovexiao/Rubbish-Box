/**
 * QuestionResult 数学公式渲染测试用例
 * 
 * 测试各种数学公式格式：
 * 1. \[ ... \] - 块级公式（主要格式）
 * 2. \( ... \) - 内联公式（主要格式）
 * 3. $$ ... $$ - 块级公式（兼容格式）
 * 4. $ ... $ - 内联公式（兼容格式）
 * 5. 混合文本和公式
 */

// 测试数据示例
export const testCases = [
  {
    name: "\\[ \\] 块级公式（主要格式）",
    content: "二次公式：\\[x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\\]",
    expected: "应该渲染为块级居中公式"
  },
  {
    name: "\\( \\) 内联公式（主要格式）",
    content: "求解方程 \\(x^2 + 2x + 1 = 0\\) 的解",
    expected: "应该渲染为：求解方程 [x²+2x+1=0] 的解"
  },
  {
    name: "$$ $$ 块级公式（兼容格式）",
    content: "勾股定理：$$a^2 + b^2 = c^2$$",
    expected: "应该渲染为块级居中公式"
  },
  {
    name: "$ $ 内联公式（兼容格式）",
    content: "圆的面积公式 $S = \\pi r^2$ 很常用",
    expected: "应该渲染为：圆的面积公式 [S=πr²] 很常用"
  },
  {
    name: "混合多种格式",
    content: "已知 \\(a=3\\)，\\(b=4\\)，求 \\[c = \\sqrt{a^2 + b^2}\\] 的值",
    expected: "应该正确混合渲染内联和块级公式"
  },
  {
    name: "复杂积分公式",
    content: "高斯积分：\\[\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\\]",
    expected: "应该渲染为完整的积分公式"
  },
  {
    name: "希腊字母和分数",
    content: "三角函数：\\(\\sin(\\theta) = \\frac{对边}{斜边}\\)",
    expected: "应该正确渲染希腊字母 θ 和分数"
  },
  {
    name: "多个内联公式",
    content: "方程组：\\(x + y = 5\\) 且 \\(x - y = 1\\)，求 \\(x\\) 和 \\(y\\)",
    expected: "应该正确渲染多个内联公式"
  },
  {
    name: "矩阵（块级）",
    content: "单位矩阵：\\[I = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}\\]",
    expected: "应该渲染为矩阵格式"
  },
  {
    name: "求和符号",
    content: "级数求和：\\[S_n = \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\\]",
    expected: "应该正确渲染求和符号"
  },
  {
    name: "纯文本（无公式）",
    content: "这是一段普通文本，没有任何数学公式。",
    expected: "应该正常显示文本"
  },
  {
    name: "换行和段落",
    content: "第一行文字\\[a + b = c\\]第二行文字",
    expected: "应该在公式前后正确换行"
  }
]

// 使用方法：
// 在开发环境中，可以创建一个测试页面来验证这些公式是否正确渲染
// 
// import { testCases } from './QuestionResult.test'
// 
// <ScrollView>
//   {testCases.map((test, index) => (
//     <View key={index} style={styles.testCase}>
//       <Text style={styles.testName}>{test.name}</Text>
//       <MixedContent content={test.content} style={styles.testContent} />
//       <Text style={styles.testExpected}>{test.expected}</Text>
//     </View>
//   ))}
// </ScrollView>

