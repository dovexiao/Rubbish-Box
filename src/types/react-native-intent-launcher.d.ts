declare module 'react-native-intent-launcher' {
  interface StartActivityOptions {
    action: string;
    data?: string;
    type?: string;
    category?: string;
    flags?: number;
    component?: {
      package: string;
      class: string;
    };
    extras?: Array<{
      key: string;
      value: string | number | boolean;
      type: 'string' | 'int' | 'long' | 'float' | 'double' | 'boolean';
    }>;
  }

  interface IntentLauncher {
    startActivity(options: StartActivityOptions): Promise<void>;
  }

  const IntentLauncher: IntentLauncher;
  export default IntentLauncher;
}
