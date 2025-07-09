export function forEach<T>(array: T[], callback: (value: T, index: number) => void) {
  for (let i = 0; i < array.length; i++) {
    callback(array[i], i);
  }
}

export async function asyncForEach<T>(array: T[], callback: (value: T, index: number) => Promise<void>) {
  for (let i = 0; i < array.length; i++) {
    await callback(array[i], i);
  }
}

export function map<T, R>(array: T[], callback: (value: T, index: number) => R) {
  const newArr: R[] = []
  for (let i = 0; i < array.length; i++) {
    newArr.push(callback(array[i], i));
  }
  return newArr;
}
