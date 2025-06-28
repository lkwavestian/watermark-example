export function usePlatForm() {
  return uni.getSystemInfoSync().platform;
}
