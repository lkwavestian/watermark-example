import VConsole from "vconsole";
import { useUserStoreWithOut } from "@/stores/user";

export default function useVconsoleVisible() {
  const useUserStore = useUserStoreWithOut();

  let userInfo = useUserStore.getUserInfo;
  let loginCode = userInfo.loginCode;

  let loginCodeArr = ["tech_support", "tyt2024", "superAdmin", "yfgly01"];
  let env = process.env.NODE_ENV;

  // 如果是测试环境，或者是在正式环境下登陆人是loginCodeArr中的一个，就开启vconsole
  if (loginCodeArr.includes(loginCode) || env === "development") {
    let Vconsole = new VConsole();
  }
}
