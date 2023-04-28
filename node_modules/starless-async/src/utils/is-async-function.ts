export default function isAsyncFunction(func: unknown) {
  if (
    func.toString().includes("async") ||
    func.toString().includes("__awaiter")
  ) {
    return true;
  }
  return false;
}
