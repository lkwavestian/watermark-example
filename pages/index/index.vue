<template>
  <view>
    <button @tap="pickImg()">选择图片</button>
    <view>展示选择的图片并添加水印</view>
    <view style="display: flex; flex-wrap: wrap">
      <image
        v-for="(item, index) in imgList"
        :key="index"
        :src="item"
        style="width: 250rpx; height: 250rpx"
        mode="aspectFit"
      ></image>
    </view>
    <upImgTime ref="upImgTime" @getImg="getImg"></upImgTime>
  </view>
</template>

<script>
import upImgTime from "@/components/upImgTime/upImgTime.vue";
export default {
  components: {
    upImgTime,
  },
  data() {
    return {
      imgList: [],
    };
  },
  methods: {
    pickImg() {
      this.$refs.upImgTime.upImg();
    },
    getImg(e) {
      console.log("执行完毕拿到图片路径");
      console.log(e);
      this.imgList.push(e);
    },
  },
};
</script>
<style lang="scss"></style>
