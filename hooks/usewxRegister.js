// import { getJsApiTicketApi } from "@/common/api/basic";
// import CryptoJS from "crypto-js";
// import { useEnvWx } from "./useEnvWx";

// export async function useWxRegister(apiList, urls) {
//   let envWx = useEnvWx();

//   console.log("请求前");

//   let JSAPI_TICKET = await getJsApiTicketApi();

//   console.log("请求后");

//   // let JSAPI_TICKET =
//   //   "kgt8ON7yVITDhtdwci0qeTzEV_bW4FAwTpurB4YsqKrr5OxvgHLJGHyEhu9txXFQ1p9sTFN0x-tGPuOrmYc5MA";
//   let reqNumber = 0;

//   console.log("JSAPI_TICKET", JSAPI_TICKET);
//   console.log("apiList", apiList);
//   console.log("urls", urls);

//   let wxRegister = (apiTicket, url) => {
//     let timeStamp = new Date().getTime();
//     let signature = "";

//     let needObj = {
//       jsapi_ticket: JSAPI_TICKET,
//       timeStamp,
//       noncestr: "10014",
//       url: url,
//     };
//     signature = getSignature(needObj); //签名权限

//     console.log("signature", signature);

//     envWx.config({
//       beta: true, // 必须这么写，否则wx.invoke调用形式的jsapi会有问题
//       // debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
//       appId: "wwd631e7e5524551bc", // 必填，企业微信的corpID，必须是本企业的corpID，不允许跨企业使用
//       // corpid: "wwd631e7e5524551bc", // 必填，企业微信的corpid，必须与当前登录的企业一致
//       // agentid: "1000013", // 必填，企业微信的应用id （e.g. 1000247）
//       timestamp: needObj.timeStamp, // 必填，生成签名的时间戳
//       nonceStr: needObj.noncestr, // 必填，生成签名的随机串
//       signature: signature, // 必填，签名，见附录-JS-SDK使用权限签名算法
//       jsApiList: apiList, //必填，传入需要使用的接口名称
//       success: function (res) {
//         // 回调
//         alert("企业微信配置成功");
//         console.log("企业微信配置成功", res);
//       },
//       fail: async function (res) {
//         alert("企业微信配置失败");
//         console.log("企业微信配置失败", res);
//         let { err_msg } = res;
//         if (err_msg.indexOf("function not exist") > -1) {
//           alert("版本过低请升级");
//         }
//         console.log(res);
//         // 是否JSAPi_TICKET 失效;
//         if (
//           (err_msg.includes("40093") || err_msg.includes("42012")) &&
//           reqNumber < 3
//         ) {
//           let JSAPI_TICKET = await getJsApiTicketApi();

//           reqNumber++;
//           wxRegister(JSAPI_TICKET, url);
//         }
//       },
//       complete(res) {
//         alert("企业微信配置完成");

//         console.log("企业微信配置完成", res);
//       },
//     });

//     envWx.error(function (res) {
//       alert("企业微信配置失败error");
//       // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
//       console.log("企业微信配置失败", res);
//     });
//   };

//   const getSignature = (obj) => {
//     let sign =
//       "jsapi_ticket=" +
//       obj.jsapi_ticket +
//       "&noncestr=" +
//       obj.noncestr +
//       "&timestamp=" +
//       obj.timeStamp +
//       "&url=" +
//       obj.url;
//     return sha1(sign);
//   };

//   let sha1 = (input) => {
//     console.log(input);
//     console.log(CryptoJS.SHA1(input));
//     return CryptoJS.SHA1(input).toString();
//   };

//   wxRegister(JSAPI_TICKET, urls);
// }
