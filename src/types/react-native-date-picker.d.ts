declare module 'react-native-date-picker' {
  import * as React from 'react';

  export interface DatePickerProps {
    date: Date;
    mode?: 'date' | 'time' | 'datetime';
    locale?: string;
    theme?: 'light' | 'dark' | 'auto';
    dividerColor?: string;
    is24hourSource?: 'device' | 'locale';
    onDateChange?: (date: Date) => void;
    [key: string]: any;
  }

  const DatePicker: React.ComponentType<DatePickerProps>;
  export default DatePicker;
}
