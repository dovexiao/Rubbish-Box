/**
 * 录音服务占位
 * TODO: 接入真实录音模块（如 Nitro Sound Recorder）
 */
export type VoiceRecordingHandler = {
  stop: () => Promise<string>;
  onLevel?: (listener: (level: number) => void) => () => void;
};

export async function startVoiceRecording(): Promise<VoiceRecordingHandler> {
  return {
    stop: async () => {
      // 占位：返回临时文件路径
      return '';
    },
  };
}
