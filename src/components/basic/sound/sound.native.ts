import {SafeAny} from '@/types';
import Sound from 'react-native-sound';

class NativeSound {
  private sound: Sound;
  constructor(_sound: SafeAny) {
    this.sound = new Sound(_sound);
  }

  play() {
    this.sound.play();
  }

  stop() {
    this.sound.stop();
  }

  release() {
    this.sound.release();
  }
}

export default NativeSound;
