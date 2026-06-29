import { NativeModules, Platform } from 'react-native';
import { IS_HARMONY } from '@/constants';
import { Toast } from '@ant-design/react-native';

export type VoiceRecordingHandler = {
  stop: () => Promise<string>;
  onLevel?: (listener: (level: number) => void) => () => void;
};

type AudioRecorderPlayerInstance = {
  startRecorder: (
    uri?: string,
    audioSets?: Record<string, unknown>,
    meteringEnabled?: boolean,
  ) => Promise<string>;
  stopRecorder: () => Promise<string>;
  addRecordBackListener: (callback: (event: RecordBackEvent) => void) => void;
  removeRecordBackListener: () => void;
  _isRecording?: boolean;
};

type RecordBackEvent = {
  currentPosition: number;
  currentMetering?: number;
};

type RecordingAttempt = {
  filePath: string;
  audioSet: Record<string, unknown>;
  meteringEnabled: boolean;
};

const audioRecorderPlayerLib = IS_HARMONY
  ? require('@react-native-ohos/react-native-audio-recorder-player')
  : require('react-native-audio-recorder-player');

let sharedRecorder: AudioRecorderPlayerInstance | null = null;
let recorderOperationQueue = Promise.resolve();

function withRecorderLock<T>(task: () => Promise<T>): Promise<T> {
  const run = recorderOperationQueue.then(task, task);
  recorderOperationQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

const RETRY_DELAY_MS = 80;

function ensureNativeRecorderModule() {
  if (IS_HARMONY) {
    return;
  }

  if (!NativeModules.RNAudioRecorderPlayer) {
    throw new Error(
      'RNAudioRecorderPlayer 原生模块未链接，请重新执行 pod install 并编译',
    );
  }
}

function getSharedRecorder(): AudioRecorderPlayerInstance {
  if (!sharedRecorder) {
    ensureNativeRecorderModule();
    const AudioRecorderPlayer = audioRecorderPlayerLib.default;
    sharedRecorder = new AudioRecorderPlayer() as AudioRecorderPlayerInstance;
  }
  return sharedRecorder;
}

function getIosRecordingAttempts(): RecordingAttempt[] {
  const { AVEncodingOption, AVEncoderAudioQualityIOSType } =
    audioRecorderPlayerLib;

  const fileName = `voice_${Date.now()}.m4a`;

  return [
    {
      filePath: 'DEFAULT',
      audioSet: { AVFormatIDKeyIOS: AVEncodingOption.aac },
      meteringEnabled: false,
    },
    {
      filePath: fileName,
      audioSet: { AVFormatIDKeyIOS: AVEncodingOption.aac },
      meteringEnabled: false,
    },
    {
      filePath: fileName,
      audioSet: {
        AVFormatIDKeyIOS: AVEncodingOption.aac,
        AVNumberOfChannelsKeyIOS: 1,
        AVSampleRateKeyIOS: 44100,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.medium,
      },
      meteringEnabled: true,
    },
  ];
}

function getRecordingAttempts(): RecordingAttempt[] {
  const extension = IS_HARMONY || Platform.OS === 'ios' ? 'm4a' : 'mp4';
  const fileName = `voice_${Date.now()}.${extension}`;

  if (IS_HARMONY) {
    const {
      AudioSourceHarmonyType,
      AudioMimeHarmonyType,
      AudioFormatHarmonyType,
    } = audioRecorderPlayerLib;

    return [
      {
        filePath: fileName,
        audioSet: {
          AudioSourceHarmony: AudioSourceHarmonyType.MIC,
          AudioMimeHarmony: AudioMimeHarmonyType.AUDIO_AAC,
          AudioFileFormatHarmony: AudioFormatHarmonyType.MPEG_4A,
          AudioSamplingRateHarmony: 16000,
          AudioEncodingBitRateHarmony: 48000,
          AudioChannelsHarmony: 1,
        },
        meteringEnabled: true,
      },
    ];
  }

  if (Platform.OS === 'ios') {
    return getIosRecordingAttempts();
  }

  const {
    AudioEncoderAndroidType,
    AudioSourceAndroidType,
    OutputFormatAndroidType,
  } = require('react-native-audio-recorder-player');

  let filePath = fileName;
  try {
    const RNFS = require('react-native-fs') as {
      CachesDirectoryPath?: string;
      DocumentDirectoryPath?: string;
      TemporaryDirectoryPath?: string;
    };
    const directory =
      RNFS.CachesDirectoryPath ||
      RNFS.DocumentDirectoryPath ||
      RNFS.TemporaryDirectoryPath;
    if (directory) {
      filePath = `${directory}/${fileName}`;
    }
  } catch {
    // ignore
  }

  return [
    {
      filePath,
      audioSet: {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
        AudioSamplingRateAndroid: 16000,
        AudioChannelsAndroid: 1,
        AudioEncodingBitRateAndroid: 48000,
      },
      meteringEnabled: true,
    },
  ];
}

function normalizeRecordingPath(path: string, fallbackPath?: string): string {
  const trimmed = path?.trim?.() ?? '';
  if (
    !trimmed ||
    trimmed === 'Already stopped' ||
    trimmed === 'Already recording'
  ) {
    return fallbackPath?.replace(/^file:\/\//, '') ?? '';
  }

  return trimmed.replace(/^file:\/\//, '');
}

function normalizeMeteringLevel(currentMetering?: number): number {
  if (typeof currentMetering !== 'number' || Number.isNaN(currentMetering)) {
    return 0;
  }

  return Math.max(0, Math.min(1, (currentMetering + 160) / 160));
}

async function forceResetRecorder(player: AudioRecorderPlayerInstance) {
  player.removeRecordBackListener();
  player._isRecording = false;

  try {
    await NativeModules.RNAudioRecorderPlayer.stopRecorder();
  } catch {
    // ignore when native recorder is already idle
  }
}

async function tryStartRecorder(
  player: AudioRecorderPlayerInstance,
  attempt: RecordingAttempt,
): Promise<string> {
  await forceResetRecorder(player);

  const startedUri = await player.startRecorder(
    attempt.filePath,
    attempt.audioSet,
    attempt.meteringEnabled,
  );

  if (startedUri === 'Already recording') {
    throw new Error('Already recording');
  }

  // 原生录音会定时发送 rn-recordback；无监听器时 RN 会反复告警并可能阻塞 JS 线程
  player.addRecordBackListener(() => {});

  return startedUri;
}

export async function startVoiceRecording(): Promise<VoiceRecordingHandler> {
  return withRecorderLock(async () => {
    const player = getSharedRecorder();
    const attempts = getRecordingAttempts();
    let lastError: unknown;

    for (let index = 0; index < attempts.length; index += 1) {
      const attempt = attempts[index];
      try {
        const startedUri = await tryStartRecorder(player, attempt);
        const resolvedPath = normalizeRecordingPath(
          startedUri,
          attempt.filePath,
        );

        return {
          stop: async () =>
            withRecorderLock(async () => {
              try {
                const result = await player.stopRecorder();
                player.removeRecordBackListener();
                return normalizeRecordingPath(result, resolvedPath);
              } catch (error) {
                player.removeRecordBackListener();
                console.warn('[voiceRecorder] stop failed', error);
                return resolvedPath;
              }
            }),
          onLevel: listener => {
            if (!attempt.meteringEnabled) {
              return () => {};
            }

            player.addRecordBackListener(event => {
              listener(normalizeMeteringLevel(event.currentMetering));
            });

            return () => {
              player.removeRecordBackListener();
            };
          },
        };
      } catch (error) {
        lastError = error;
        console.warn('[voiceRecorder] attempt failed', attempt.filePath, error);
        if (index < attempts.length - 1) {
          await new Promise<void>(resolve => {
            setTimeout(resolve, RETRY_DELAY_MS);
          });
        }
      }
    }

    throw lastError ?? new Error('录音启动失败');
  });
}
