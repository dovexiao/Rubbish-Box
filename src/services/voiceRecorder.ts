import { Platform } from 'react-native';
import { IS_HARMONY } from '@/constants';

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
};

type RecordBackEvent = {
  currentPosition: number;
  currentMetering?: number;
};

let recorderInstance: AudioRecorderPlayerInstance | null = null;

function getRecorder(): AudioRecorderPlayerInstance {
  if (!recorderInstance) {
    const AudioRecorderPlayer =
      require('react-native-audio-recorder-player').default;
    recorderInstance = new AudioRecorderPlayer() as AudioRecorderPlayerInstance;
  }
  return recorderInstance;
}

function getRecordingFilePath(): string {
  const extension = IS_HARMONY || Platform.OS === 'ios' ? 'm4a' : 'mp4';
  const fileName = `voice_${Date.now()}.${extension}`;

  if (IS_HARMONY) {
    return fileName;
  }

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
      return `${directory}/${fileName}`;
    }
  } catch {
    // ignore and fall back to file name
  }

  return fileName;
}

function getVoiceAudioSet(): Record<string, unknown> {
  const {
    AudioEncoderAndroidType,
    AudioSourceAndroidType,
    AVEncodingOption,
    AVEncoderAudioQualityIOSType,
    AVModeIOSOption,
    OutputFormatAndroidType,
  } = require('react-native-audio-recorder-player');

  if (IS_HARMONY) {
    const {
      AudioSourceHarmonyType,
      AudioMimeHarmonyType,
      AudioFormatHarmonyType,
    } = require('react-native-audio-recorder-player');

    return {
      AudioSourceHarmony: AudioSourceHarmonyType.MIC,
      AudioMimeHarmony: AudioMimeHarmonyType.AUDIO_AAC,
      AudioFileFormatHarmony: AudioFormatHarmonyType.MPEG_4A,
      AudioSamplingRateHarmony: 16000,
      AudioEncodingBitRateHarmony: 48000,
      AudioChannelsHarmony: 1,
    };
  }

  return {
    AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
    AudioSourceAndroid: AudioSourceAndroidType.MIC,
    OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
    AudioSamplingRateAndroid: 16000,
    AudioChannelsAndroid: 1,
    AudioEncodingBitRateAndroid: 48000,
    AVFormatIDKeyIOS: AVEncodingOption.aac,
    AVNumberOfChannelsKeyIOS: 1,
    AVSampleRateKeyIOS: 16000,
    AVModeIOS: AVModeIOSOption.spokenaudio,
    AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.medium,
  };
}

function normalizeRecordingPath(path: string): string {
  const trimmed = path?.trim?.() ?? '';
  if (
    !trimmed ||
    trimmed === 'Already stopped' ||
    trimmed === 'Already recording'
  ) {
    return '';
  }

  return trimmed.replace(/^file:\/\//, '');
}

function normalizeMeteringLevel(currentMetering?: number): number {
  if (typeof currentMetering !== 'number' || Number.isNaN(currentMetering)) {
    return 0;
  }

  // currentMetering 通常为 -160 ~ 0 dB
  return Math.max(0, Math.min(1, (currentMetering + 160) / 160));
}

async function resetRecorderState(player: AudioRecorderPlayerInstance) {
  try {
    await player.stopRecorder();
  } catch {
    // ignore stale recorder state
  } finally {
    player.removeRecordBackListener();
  }
}

export async function startVoiceRecording(): Promise<VoiceRecordingHandler> {
  const player = getRecorder();
  await resetRecorderState(player);

  const filePath = getRecordingFilePath();
  const audioSet = getVoiceAudioSet();

  await player.startRecorder(filePath, audioSet, true);

  return {
    stop: async () => {
      try {
        const result = await player.stopRecorder();
        player.removeRecordBackListener();
        return normalizeRecordingPath(result);
      } catch {
        player.removeRecordBackListener();
        return '';
      }
    },
    onLevel: listener => {
      player.addRecordBackListener(event => {
        listener(normalizeMeteringLevel(event.currentMetering));
      });

      return () => {
        player.removeRecordBackListener();
      };
    },
  };
}
