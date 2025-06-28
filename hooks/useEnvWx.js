import { usePlatForm } from "./usePlatForm";

export function useEnvWx() {
  let envWx = null;
  let platform = usePlatForm();

  console.log("platform", platform);

  if (platform == "ios" || process.env.NODE_ENV === "development") {
    envWx = wx;
  } else {
    envWx = jWeixin;
  }

  return envWx;
}
