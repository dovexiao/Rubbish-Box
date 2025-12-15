/**
 * MathML和HTML内容解析工具
 * 将MathML和HTML混合内容转换为可读文本
 * 支持常见数学公式：分数、幂次、根号、上下标等
 */

/**
 * 将MathML和HTML混合内容转换为可读文本
 * @param html - 包含MathML和HTML的字符串
 * @returns 转换后的纯文本
 */
export function parseContent(html: string): string {
  if (!html) return ""

  let result = html

  // 1. 处理MathML数学公式
  result = result.replace(/<math[^>]*>(.*?)<\/math>/gis, (match, content) => {
    // 提取并格式化数学内容
    const math = content
      // 分数：<mfrac><mrow>1</mrow><mrow>2</mrow></mfrac> → (1/2)
      .replace(
        /<mfrac[^>]*>\s*<mrow[^>]*>(.*?)<\/mrow>\s*<mrow[^>]*>(.*?)<\/mrow>\s*<\/mfrac>/gi,
        "($1/$2)",
      )
      // 上标（幂）：<msup><mrow>x</mrow><mrow>2</mrow></msup> → x^2
      .replace(
        /<msup[^>]*>\s*<mrow[^>]*>(.*?)<\/mrow>\s*<mrow[^>]*>(.*?)<\/mrow>\s*<\/msup>/gi,
        "$1^$2",
      )
      // 下标：<msub><mrow>x</mrow><mrow>1</mrow></msub> → x_1
      .replace(
        /<msub[^>]*>\s*<mrow[^>]*>(.*?)<\/mrow>\s*<mrow[^>]*>(.*?)<\/mrow>\s*<\/msub>/gi,
        "$1_$2",
      )
      // 根号：<msqrt><mrow>2</mrow></msqrt> → √2
      .replace(/<msqrt[^>]*>\s*<mrow[^>]*>(.*?)<\/mrow>\s*<\/msqrt>/gi, "√$1")
      // 运算符：<mo>+</mo>
      .replace(/<mo[^>]*>([^<]+)<\/mo>/g, " $1 ")
      // 数字：<mn>123</mn>
      .replace(/<mn[^>]*>([^<]+)<\/mn>/g, "$1")
      // 变量：<mi>x</mi>
      .replace(/<mi[^>]*>([^<]+)<\/mi>/g, "$1")
      // 文本：<mtext>text</mtext>
      .replace(/<mtext[^>]*>([^<]+)<\/mtext>/g, "$1")
      // 样式容器：<mstyle>...</mstyle>
      .replace(/<mstyle[^>]*>(.*?)<\/mstyle>/gi, "$1")
      // 行内容器：<mrow>...</mrow>
      .replace(/<mrow[^>]*>(.*?)<\/mrow>/gi, "$1")
      // 移除所有剩余MathML标签
      .replace(/<[^>]*>/g, "")
      // 处理HTML实体 - 基础运算符
      .replace(/&#x0002B;|&#43;/g, "+")
      .replace(/&#x02212;|&#8722;/g, "-")
      .replace(/&#x00028;|&#40;/g, "(")
      .replace(/&#x00029;|&#41;/g, ")")
      .replace(/&#x0007C;|&#124;/g, "|") // 竖线（绝对值）
      .replace(/&#x0005B;|&#91;/g, "[") // 左方括号
      .replace(/&#x0005D;|&#93;/g, "]") // 右方括号
      .replace(/&#x0007B;|&#123;/g, "{") // 左花括号
      .replace(/&#x0007D;|&#125;/g, "}") // 右花括号
      .replace(/&#x000D7;|&#215;/g, "×")
      .replace(/&#x000F7;|&#247;/g, "÷")
      .replace(/&times;/g, "×")
      .replace(/&divide;/g, "÷")
      .replace(/&plusmn;/g, "±")
      .replace(/&#x02217;|&#8727;|&lowast;/g, "∗") // 星号运算符
      .replace(/&#x000B7;|&#183;|&middot;/g, "·") // 中点（点乘）
      // 比较符号
      .replace(/&le;|&#8804;|&#x02264;/g, "≤")
      .replace(/&ge;|&#8805;|&#x02265;/g, "≥")
      .replace(/&ne;|&#8800;|&#x02260;/g, "≠")
      .replace(/&lt;|&#60;/g, "<")
      .replace(/&gt;|&#62;/g, ">")
      .replace(/&#x0003D;|&#61;/g, "=")
      // 希腊字母
      .replace(/&#x003C0;|&#960;|&pi;/g, "π")
      .replace(/&#x003B1;|&#945;|&alpha;/g, "α")
      .replace(/&#x003B2;|&#946;|&beta;/g, "β")
      .replace(/&#x003B3;|&#947;|&gamma;/g, "γ")
      .replace(/&#x00394;|&#916;|&Delta;/g, "Δ")
      .replace(/&#x003B4;|&#948;|&delta;/g, "δ")
      .replace(/&#x003B5;|&#949;|&epsilon;/g, "ε")
      .replace(/&#x003B8;|&#952;|&theta;/g, "θ")
      .replace(/&#x003BB;|&#955;|&lambda;/g, "λ")
      .replace(/&#x003BC;|&#956;|&mu;/g, "μ")
      .replace(/&#x003C3;|&#963;|&sigma;/g, "σ")
      .replace(/&#x003A3;|&#931;|&Sigma;/g, "Σ")
      .replace(/&#x003C9;|&#969;|&omega;/g, "ω")
      .replace(/&#x003A9;|&#937;|&Omega;/g, "Ω")
      // 数学符号
      .replace(/&#x0221A;|&#8730;|&radic;/g, "√")
      .replace(/&#x0221E;|&#8734;|&infin;/g, "∞")
      .replace(/&#x02220;|&#8736;|&ang;/g, "∠")
      .replace(/&#x02299;|&#8857;|&odot;/g, "⊙")
      .replace(/&#x02261;|&#8801;|&equiv;/g, "≡")
      .replace(/&#x02248;|&#8776;|&asymp;/g, "≈")
      .replace(/&#x02208;|&#8712;|&isin;/g, "∈")
      .replace(/&#x02209;|&#8713;|&notin;/g, "∉")
      .replace(/&#x02282;|&#8834;|&sub;/g, "⊂")
      .replace(/&#x02286;|&#8838;|&sube;/g, "⊆")
      .replace(/&#x02229;|&#8745;|&cap;/g, "∩")
      .replace(/&#x0222A;|&#8746;|&cup;/g, "∪")
      // 上标和下标数字（如果有的话）
      .replace(/&#x000B2;|&#178;|&sup2;/g, "²")
      .replace(/&#x000B3;|&#179;|&sup3;/g, "³")
      .replace(/&#x000B9;|&#185;|&sup1;/g, "¹")
      // 分数（特殊字符）
      .replace(/&#x000BD;|&#189;|&frac12;/g, "½")
      .replace(/&#x000BC;|&#188;|&frac14;/g, "¼")
      .replace(/&#x000BE;|&#190;|&frac34;/g, "¾")
      // 度数符号
      .replace(/&#x000B0;|&#176;|&deg;/g, "°")
      // 百分号
      .replace(/&#x00025;|&#37;|&percnt;/g, "%")
      // 清理多余空格
      .replace(/\s+/g, " ")
      .trim()

    return ` ${math} `
  })

  // 2. 处理普通HTML标签
  result = result
    .replace(/<br\s*\/?>/gi, "\n") // 换行
    .replace(/<\/p>/gi, "\n\n") // 段落结束
    .replace(/<p[^>]*>/gi, "") // 段落开始
    .replace(/<\/div>/gi, "\n") // div结束
    .replace(/<div[^>]*>/gi, "") // div开始
    .replace(/<[^>]*>/g, "") // 移除所有剩余HTML标签
    .replace(/&nbsp;/g, " ") // 空格
    .replace(/&lt;/g, "<") // 小于号
    .replace(/&gt;/g, ">") // 大于号
    .replace(/&amp;/g, "&") // 和号
    .replace(/&quot;/g, '"') // 引号
    .replace(/&#39;/g, "'") // 单引号
    .replace(/\n\s*\n\s*\n/g, "\n\n") // 最多保留两个连续换行
    .trim()

  return result
}

