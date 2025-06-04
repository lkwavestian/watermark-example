<template>
  <view class="imgWrapper" v-if="showType === 'image'">
    <view
      class="imgItem"
      v-for="(item, index) in imgFilePathList"
      :key="item.hash"
    >
      <uv-image
        :src="item"
        radius="5"
        @click="previewImage(item, index)"
        height="90"
        width="100%"
        :key="index"
      >
      </uv-image>
    </view>
    <view class="add yfdd-color-border">
      <uv-icon name="plus" size="26" bold @click="addClick"></uv-icon>
    </view>
  </view>

  <uv-toast ref="toast"></uv-toast>
  <canvas
    class="canvas-box"
    :style="{ width: canvasW + 'px', height: canvasH + 'px' }"
    canvas-id="myCanvas"
  >
  </canvas>
</template>

<script setup>
import { ref, watch, toRefs, inject, onMounted, getCurrentInstance } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import { useWxRegister } from "@/hooks/usewxRegister";
import { useEnvWx } from "@/hooks/useEnvWx";

onLoad(async () => {
  // await useWxRegister(["getLocation"], location.href.split("#")[0]);
});

const toast = ref(null);

const imgFilePathList = ref([]); // 图片临时路径接口
const time = ref(""); //绘制图片的时间
const canvasW = ref(0); //画布宽度
const canvasH = ref(0); //画布高度

// vue3 获取实例
const instance = getCurrentInstance();

const addClick = () => {
  uni.chooseImage({
    // sourceType: "camera", // 可选择相机或相册
    success: async function (res) {
      uni.showLoading({
        title: "加载中...",
        mask: true,
      });

      let imgPath = res.tempFilePaths;

      // 选择图片时有可能多选，所以需要添加遍历去一个个添加水印
      for (let i = 0; i < imgPath.length; i++) {
        //循环添加水印
        await drawStart(imgPath[i]);
      }

      // toast.value.show({
      //   type: "success",
      //   message: "上传成功",
      //   complete: () => {
      //     uni.hideLoading();
      //   },
      // });
    },
  });
};

const drawStart = (imgSrc) => {
  return new Promise(async (resolve, reject) => {
    //获取图片信息
    const infoRes = await getImgInfo(imgSrc);
    console.log("infoRes", infoRes);

    //获取图片宽度
    const imgWidth = infoRes.width;
    //获取当前屏幕宽度赋值给画布宽度
    if (!canvasW.value) {
      canvasW.value = await getScreenWidth();
    }
    //获取画布宽度跟图片宽度的比例
    const perc = canvasW.value / imgWidth;
    //根据图片宽高比例算出画布高度
    canvasH.value = infoRes.height * perc;
    //延时等待画布宽高渲染完成再绘制
    setTimeout(async () => {
      console.log("instance", instance);
      const ctx = uni.createCanvasContext("myCanvas", instance);
      console.log("ctx", ctx);

      // 绘制背景图片  参数分别是：图片路径、左上角x坐标、左上角y坐标、绘制的宽度、绘制的高度
      ctx.drawImage(imgSrc, 0, 0, canvasW.value, canvasH.value);

      // 保存当前的画布状态
      ctx.save();
      // 恢复到最近一次保存的画布状态
      // ctx.restore();
      // 绘制文本
      ctx.setFontSize(18);
      ctx.setFillStyle("#F42932");

      let time = getTimeStr(); //拿到时间
      // let location = await getLocationStr(); //拿到地址
      let lineHeight = 22;
      let y = 40;
      ctx.fillText(time, 10, y);
      // wrapText(ctx, location, 10, y + lineHeight, canvasW.value - 10, 22);
      ctx.draw();

      //延时等待渲染完成再导出图片
      setTimeout(async () => {
        //获取水印临时图片
        const tempFilePath = await getAfterImg(instance);
        console.log("tempFilePath", tempFilePath);
        // #ifdef APP-PLUS
        resolve(tempFilePath);
        //#endif
        // #ifdef H5
        //base64转bold
        const url = tempFilePath.replace(/[\r\n]/g, "");
        console.log("url", url);
        //调用
        let file = base64ToFile(url, "test.png");

        const tempPath = URL.createObjectURL(file);
        file.path = tempPath;

        resolve(file);

        // #endif
      }, 600);
    }, 100);
  });
};
const getAfterImg = (instance) => {
  //获取水印临时图片
  return new Promise((resolve, reject) => {
    uni.canvasToTempFilePath(
      {
        canvasId: "myCanvas",
        // width: canvasW.value,
        // height: canvasH.value,
        // quality: 0.5,
        success: (res) => {
          console.log("getAfterImg res", res);
          resolve(res.tempFilePath);
        },
        fail: (err) => {
          console.log("getAfterImg err", err);
          uni.hideLoading();
          console.log("获取水印临时图片错误" + JSON.stringify(err));
          reject(err);
        },
      },
      instance,
    );
  });
};
const getImgInfo = (imgSrc) => {
  //获取图片宽高
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: imgSrc,
      success: (infoRes) => {
        resolve(infoRes);
      },
      fail: (err) => {
        uni.hideLoading();
        console.log("获取图片宽高错误" + JSON.stringify(err));
        reject(err);
      },
    });
  });
};
const getScreenWidth = () => {
  //获取当前屏幕宽度
  return new Promise((resolve, reject) => {
    uni.getSystemInfo({
      success: (res) => {
        resolve(res.windowWidth);
      },
      fail: (err) => {
        uni.hideLoading();
        console.log("获取当前屏幕宽度错误" + JSON.stringify(err));
        reject(err);
      },
    });
  });
};

const previewImage = (item, index) => {
  uni.previewImage({
    urls: item,
    current: index,
  });
};

const base64ToFile = (base64Data, filename = "file") => {
  // 分割Base64头和数据部分
  const arr = base64Data.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);

  // 转换为字节数组
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  // 生成File对象
  return new File([u8arr], filename, {
    type: mime,
    lastModified: Date.now(),
  });
};

const getTimeStr = () => {
  let currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  return `当前时间：${currentTime}`;
};

const getLocationStr = async () => {
  let location = await getLocation();
  return `当前位置：${location}`;
};

const getLocation = () => {
  return new Promise((resolve, reject) => {
    let envWx = useEnvWx();
    console.log("envWx.getLocation", envWx.getLocation);
    // alert(envWx.getLocation);
    envWx.getLocation({
      type: "gcj02",
      success: (res) => {
        console.log("企业微信地址信息:", res);

        let geocoder = new TMap.service.Geocoder();

        geocoder
          .getAddress({
            location: new TMap.LatLng(res.latitude, res.longitude),
          })
          .then((addRes) => {
            console.log("腾讯地图逆地址解析具体地址信息:", addRes);
            resolve(addRes.result.formatted_addresses.standard_address);
          });
      },
      fail: (err) => {
        console.error("企业微信定位：", err);
      },
    });
  });
};

// 自动换行
let wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
  if (typeof text != "string" || typeof x != "number" || typeof y != "number") {
    return;
  }

  if (typeof maxWidth == "undefined") {
    maxWidth = (ctx && ctx.width) || 300;
  }
  if (typeof lineHeight == "undefined") {
    lineHeight =
      (ctx && parseInt(window.getComputedStyle(ctx).lineHeight)) ||
      parseInt(window.getComputedStyle(document.body).lineHeight);
  }

  // 字符分隔为数组
  var arrText = text.split("");
  var line = "";

  for (var n = 0; n < arrText.length; n++) {
    var testLine = line + arrText[n];
    var metrics = ctx.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = arrText[n];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
};
</script>

<style lang="scss" scoped>
.imgWrapper {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.imgItem {
  position: relative;
  :deep(.uv-icon__icon) {
    color: $uv-error !important;
  }
}
.icon {
  position: absolute;
  right: -8px;
  top: -8px;
}

.add {
  display: flex;
  align-items: center;
  justify-content: center;
  border-width: 5px;
  width: 110px;
  height: 85px;
  :deep(.uv-icon__icon) {
    color: $uv-light-color !important;
  }
}

:deep(.tki-tree-view) {
  padding-top: 0px;
  margin-top: -5px;
}
:deep(.uv-image) {
  width: calc(100% - 10px);
  height: 90px !important;
}

.imgItem {
  width: calc((100% - 20px) / 3) !important;
}

.canvas-box {
  //隐藏canvas盒子
  position: absolute;
  top: -3000px;
}
</style>
