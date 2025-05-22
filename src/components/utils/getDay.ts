import dayjs from 'dayjs';

export default function (filteredValue: number) {
  const date =
    filteredValue != null
      ? [
          dayjs().subtract(+filteredValue, 'day').format('YYYYMMDD'),
          dayjs()
            .subtract(+filteredValue > 0 ? 1 : 0, 'day')
            .format('YYYYMMDD'),
        ]
      : null;
  return date;
}
