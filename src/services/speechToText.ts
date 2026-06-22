/**
 * 语音转文字 API 占位
 * TODO: 接入真实语音识别服务
 */
export type SpeechToTextResult = {
  text: string;
};

export async function speechToText(_audioFilePath: string): Promise<SpeechToTextResult> {
  // 占位：模拟网络请求延迟
  await new Promise<void>(resolve => {
    setTimeout(resolve, 300);
  });

  return {
    text: '',
  };
}
