<template>
  <canvas
    class="canvas-box"
    :style="{ width: canvasW + 'px', height: canvasH + 'px' }"
    canvas-id="myCanvas"
  >
  </canvas>
</template>

<script>
import { base64ToPath } from "image-tools";
export default {
  data() {
    return {
      time: "", //绘制图片时间
      canvasW: 0,
      canvasH: 0, // 画布高
    };
  },
  methods: {
    upImg() {
      uni.chooseImage({
        count: 9,
        sizeType: ["original", "compressed"], //可以指定是原图还是压缩图，默认二者都有
        success: async (res) => {
          const imgPath = res.tempFilePaths;
          uni.showLoading({
            mask: true,
          });
          for (let i = 0; i < imgPath.length; i++) {
            //循环添加水印
            await this.drawStart(imgPath[i]);
          }
          uni.hideLoading();
        },
      });
    },
    drawStart(imgSrc) {
      return new Promise(async (resolve, reject) => {
        //获取图片信息
        const infoRes = await this.getImgInfo(imgSrc);
        //获取图片宽度
        const imgWidth = infoRes.width;
        //获取当前屏幕宽度赋值给画布宽度
        if (!this.canvasW) {
          this.canvasW = await this.getScreenWidth();
        }
        //获取画布宽度跟图片宽度的比例
        const perc = this.canvasW / imgWidth;
        //根据图片宽高比例算出画布高度
        this.canvasH = infoRes.height * perc;
        //延时等待画布宽高渲染完成再绘制
        setTimeout(() => {
          const ctx = uni.createCanvasContext("myCanvas", this);
          // 绘制背景图片  参数分别是：图片路径、左上角x坐标、左上角y坐标、绘制的宽度、绘制的高度
          ctx.drawImage(imgSrc, 0, 0, this.canvasW, this.canvasH);
          // 保存当前的画布状态
          ctx.save();
          // 恢复到最近一次保存的画布状态
          ctx.restore();
          // 绘制文本
          ctx.setFontSize(18);
          ctx.setFillStyle("#F42932");
          this.time = this.getCurrentDateTime(); //拿到时间
          ctx.fillText(this.time, 10, 20); //绘制时间
          // 绘制到画布上
          ctx.draw();
          //延时等待渲染完成再导出图片
          setTimeout(async () => {
            //获取水印临时图片
            const tempFilePath = await this.getAfterImg();
            // #ifdef APP-PLUS
            this.$emit("getImg", tempFilePath);
            resolve();
            //#endif
            // #ifdef H5
            //base64转bold
            const url = tempFilePath.replace(/[\r\n]/g, "");
            base64ToPath(url)
              .then((path) => {
                this.$emit("getImg", path);
                resolve();
              })
              .catch((error) => {
                uni.hideLoading();
                console.log("图片的临时路径转换出错了：", error);
              });
            // #endif
          }, 600);
        }, 100);
      });
    },
    getCurrentDateTime() {
      //获取当前时间
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      return formattedDateTime;
    },
    getAfterImg() {
      //获取水印临时图片
      return new Promise((resolve, reject) => {
        uni.canvasToTempFilePath({
          canvasId: "myCanvas",
          success: (res) => {
            resolve(res.tempFilePath);
          },
          fail: (err) => {
            uni.hideLoading();
            console.log("获取水印临时图片错误" + JSON.stringify(err));
            reject(err);
          },
        });
      });
    },
    getImgInfo(imgSrc) {
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
    },
    getScreenWidth() {
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
    },
  },
};
</script>
<style lang="scss">
.canvas-box {
  //隐藏canvas盒子
  position: absolute;
  top: -3000px;
}
</style>
