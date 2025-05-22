import {SafeAny} from '@/types';

class NativeSound {
  private sound: HTMLAudioElement;
  constructor(_sound: SafeAny) {
    this.sound = new Audio(_sound);
  }

  play() {
    this.sound.play();
  }

  stop() {
    this.sound.pause();
  }

  release() {
    this.sound.pause();
  }
}

export default NativeSound;
