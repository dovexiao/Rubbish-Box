//临时存储html值使用，如果后面使用redux，就替换掉该文件

let renderHtml: string = '';

const setRenderHtml = (newValue: string) => {
  renderHtml = newValue;
};

const getRenderHtml = () => {
  return renderHtml;
};

const resetRenderHtml = () => {
  renderHtml = ''; // 这里我们“重置”全局变量，而不是“销毁”它
};

export {setRenderHtml, getRenderHtml, resetRenderHtml};
