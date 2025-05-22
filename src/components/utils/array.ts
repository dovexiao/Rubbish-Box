export const convertArrayToPairs = (arr: string | any[]) => {
  const pairs = [];

  if (arr?.length <= 0) {
    return [];
  }

  for (let i = 0; i < arr?.length; i += 2) {
    pairs.push({value1: arr[i], value2: arr[i + 1]});
  }
  if (pairs[pairs.length - 1]?.value2 === undefined) {
    delete pairs[pairs.length - 1]?.value2;
  }
  return pairs;
};

export function convertArrayToPairsMore(arr: string | any[]) {
  const pairs = [];
  if (!arr?.length) {
    return [];
  }
  for (let i = 0; i < arr?.length; i += 4) {
    pairs.push({
      value1: arr[i],
      value2: arr[i + 1],
      value3: arr[i + 2],
      value4: arr[i + 3],
    });
  }
  return pairs;
}
