<template>
  <view class="tips">点击下方按钮添加图片，单击图片可放大进行预览</view>

  <view class="imgWrapper">
    <view
      class="imgItem"
      v-for="(item, index) in imgFilePathList"
      :key="item.hash"
    >
      <image
        :src="item"
        style="width: 250rpx; height: 250rpx"
        :key="index"
        @click="previewImage(item, index)"
        mode="aspectFit"
      >
      </image>
    </view>
    <view class="add">
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
import { onLoad } from "@dcloudio/uni-app";
import { ref, watch, toRefs, inject, onMounted, getCurrentInstance } from "vue";
import dayjs from "dayjs";

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
      let tempFiles = res.tempFiles;

      // 选择图片时有可能多选，所以需要添加遍历去一个个添加水印
      for (let i = 0; i < imgPath.length; i++) {
        //循环添加水印
        let drawImageFile = await drawStart(imgPath[i]);
        console.log("drawImageFile", drawImageFile);

        imgFilePathList.value.push(drawImageFile.path);
      }
      uni.hideLoading();

      toast.value.show({
        type: "success",
        message: "上传成功",
        complete: () => {},
      });
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
      let lineHeight = 22;
      let y = 40;

      // 绘制文本 参数分别是：文本、x坐标、y坐标
      ctx.fillText(time, 10, y);
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
    urls: imgFilePathList.value,
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
</script>

<style lang="scss" scoped>
.tips {
  padding-top: 100px;
  padding-left: 20px;
  padding-bottom: 10px;
}
.imgWrapper {
  display: flex;
  padding-left: 20px;
  padding-right: 20px;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.imgItem {
  position: relative;
  :deep(.uv-icon__icon) {
    color: #f56c6c !important;
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
  width: 110px;
  height: 85px;
  border: 5px solid #dadbde;
  :deep(.uv-icon__icon) {
    color: #dadbde !important;
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

.canvas-box {
  //隐藏canvas盒子
  position: absolute;
  top: -3000px;
}
</style>
