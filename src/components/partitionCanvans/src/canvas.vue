<template>
  <div class="partion_canvas">
    <canvas
      class="canvas"
      ref="canvas"
      @mousedown="OnMouseDown"
      @mousemove="OnMouseMove"
      @mouseup="OnMouseUp"
      @touchstart="OnMouseDown"
      @touchmove.passive="OnMouseMove"
      @touchend="OnMouseUp"
    >
    </canvas>
  </div>
</template>
<script lang="ts">
import Canvas from "./index";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

@Component
export default class PartionCanvas extends Vue {
  @Prop({ type: Number, default: 16 })
  private currentTem!: number;

  @Prop({ type: Object, default: () => ({}) })
  private canvasGradient!: Canvas.canvasGradient;

  private el: Canvas.elState = {
    currentTemperature: 28,
  };
  private initInfo: Canvas.initInfo = {};
  private canvasId = {} as HTMLCanvasElement;
  private canvasContent = {} as CanvasRenderingContext2D;
  private isTouchMouse = false;
  private drawData: Canvas.drawDataState = {
    lx: 0,
    ly: 0,
    lr: 0,
    lj: 0,
  };
  private drawOption: number[] = [];
  private animationFrameKey = 0;

  @Watch("currentTem")
  currentTemHandler(newValue: number, oldValue: number): void {
    if (newValue !== oldValue) {
      // this.initTemperature(newValue);
      this.canvasId && this.drawRequestAnimationFrame(newValue, oldValue);
    }
  }

  @Watch("canvasGradient", { deep: true })
  canvasGradientHandler(): void {
    const { lx, ly, lr, lj } = this.drawData;
    this.draw(lx, ly, lr, lj);
  }

  $refs!: {
    canvas: HTMLCanvasElement;
  };

  created() {
    // 基础信息配置
    const el = {
      currentTemperature: 28,
    };
    this.$nextTick(() => {
      this.init(this.$refs.canvas);
    });
  }

  init(element: HTMLCanvasElement) {
    this.canvasId = element;
    this.canvasContent = element.getContext("2d") as CanvasRenderingContext2D;
    const canvasRect = this.setCanvasRect();
    this.setCanvasCircularRect(canvasRect);
    this.draw.prototype = this;
    this.initTemperature();
  }

  setCanvasRect(): Canvas.canvasRect {
    const screen = {
      width: window.document.documentElement.clientWidth,
      height: window.document.documentElement.clientHeight,
    };
    const canvasRect = {
      width: screen.width > 400 ? 400 : screen.width,
      height: screen.width > 400 ? 400 : screen.width,
    };

    canvasRect.width = canvasRect.width + 0.5;
    canvasRect.height = canvasRect.height + 0.5;

    this.canvasId.width = canvasRect.width;
    this.canvasId.height = canvasRect.height;

    return canvasRect;
  }

  setCanvasCircularRect(canvas: Canvas.canvasRect): void {
    const el = {
      circleCenter: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: canvas.width * 0.37,
        color: "#c0c0c0",
      }, //圆的圆心( x, y ), 半径r
      angle: { s: 0.85, e: 2.15 }, // 始末角度 （ s: 起角度 e: 始角度,0-2为一圈 ）
      variable: {
        x: 93.08,
        y: 254,
        eAngle: 0.85,
      }, // 可变区数据
      slider: {
        x: (canvas.width * 93.08) / 400,
        y: (canvas.height * 254) / 400,
        r: (canvas.height * 11) / 400,
        color: "#fff",
      }, // 滑块信息
      temperature: {
        min: 16,
        max: 30,
        current: this.currentTem,
      }, // 温度信息
    };
    this.el = el;
  }
  initTemperature(lcurrent?: number) {
    // 根据初始温度，初始canvas数据
    const temperature = this.el.temperature as Canvas.temperatureState;
    const circleCenter = this.el.circleCenter as Canvas.circleCenterState;
    const angle = this.el.angle as Canvas.angleState;

    if (!("max" in temperature)) return;
    const section = temperature.max - temperature.min; // 数值区间

    const current = lcurrent || temperature.current; // 当前值
    const partition = (angle.e - angle.s) / section; // 刻度范围
    const radian =
      (angle.s + (current - temperature.min) * partition) * Math.PI; // 可移动弧线eAng数值

    const sliderPoint = {
      x: circleCenter.x + circleCenter.r * Math.cos(radian),
      y: circleCenter.y + circleCenter.r * Math.sin(radian),
    };
    this.drawOption = [sliderPoint.x, sliderPoint.y, 0, radian];
    this.draw(sliderPoint.x, sliderPoint.y, 0, radian);
  }
  draw(lx: number, ly: number, lr: number, lj: number) {
    const { x, y, r, j } = this.getDrawPoint({ lx, ly, lr, lj });
    this.drawBottomRadian();
    this.drawScaleRadian(x, j);
    this.drawSlider(x, y, r);
  }
  getDrawPoint({ lx, ly, lr, lj }: Canvas.drawDataState): Canvas.drawPooint {
    if (!("slider" in this.el)) return { x: 0, y: 0, j: 0, r: 0 }; // 未被初始化
    const slider = this.el.slider as Canvas.sliderState;
    const variable = this.el.variable as Canvas.variableState;

    const x = lx || slider.x,
      y = ly || slider.y,
      r = lr || slider.r,
      j = lj || variable.eAngle * Math.PI;
    this.canvasContent.clearRect(
      0,
      0,
      this.canvasId.width,
      this.canvasId.height
    );

    this.drawData = { lx, ly, lr, lj };
    return { x, y, r, j };
  }
  drawSlider(sliderX: number, sliderY: number, sliderR: number) {
    const slider = this.el.slider as Canvas.sliderState;

    // 滑块
    this.canvasContent.beginPath();
    this.canvasContent.fillStyle = slider.color;
    this.canvasContent.shadowOffsetX = 0; // 阴影Y轴偏移
    this.canvasContent.shadowOffsetY = 0; // 阴影X轴偏移
    this.canvasContent.shadowBlur = 15; // 模糊尺寸
    // this.canvasContent.spread = -2;
    this.canvasContent.shadowColor = "rgba(0, 0, 0, 0.49)";
    this.canvasContent.arc(sliderX, sliderY, sliderR, 0, Math.PI * 2, false); // 绘制滑块内侧
    this.canvasContent.fill();
  }
  drawScaleRadian(sliderX: number, angle: number) {
    // 绘制可变弧
    const circleCenter = this.el.circleCenter as Canvas.circleCenterState;

    this.canvasContent.beginPath();
    this.canvasContent.shadowOffsetX = 0; // 阴影Y轴偏移
    this.canvasContent.shadowOffsetY = 0; // 阴影X轴偏移
    this.canvasContent.shadowBlur = 0; // 模糊尺寸
    // this.canvasContent.spread = 0;
    this.canvasContent.arc(
      circleCenter.x,
      circleCenter.y,
      circleCenter.r,
      Math.PI * 0.85,
      angle,
      false
    );
    let gradient = this.canvasContent.createLinearGradient(0, 0, sliderX, 0);

    this.canvasGradient;
    const list = Object.keys(this.canvasGradient);

    for (let index = 0; index < list.length; index++) {
      gradient.addColorStop(
        Number(list[index]),
        this.canvasGradient[Number(list[index])]
      );
    }

    // gradient.addColorStop("0","rgba(0,196,140,1)");
    // gradient.addColorStop("0.5","rgba(0,196,140,1)");
    // gradient.addColorStop("1.0","rgba(2,211,237,1)");
    this.canvasContent.strokeStyle = gradient;
    this.canvasContent.lineCap = "round";
    this.canvasContent.lineWidth = 10;
    this.canvasContent.stroke();
  }
  drawBottomRadian() {
    const circleCenter = this.el.circleCenter as Canvas.circleCenterState;
    const angle = this.el.angle as Canvas.angleState;

    // 底圆弧
    this.canvasContent.beginPath();
    this.canvasContent.shadowOffsetX = 0; // 阴影Y轴偏移
    this.canvasContent.shadowOffsetY = 0; // 阴影X轴偏移
    this.canvasContent.shadowBlur = 0; // 模糊尺寸
    // this.canvasContent.spread = 0;
    this.canvasContent.arc(
      circleCenter.x,
      circleCenter.y,
      circleCenter.r,
      Math.PI * angle.s,
      Math.PI * angle.e,
      false
    );

    this.canvasContent.strokeStyle = circleCenter.color;
    this.canvasContent.lineCap = "round";
    this.canvasContent.lineWidth = 10;
    this.canvasContent.stroke();
  }
  OnMouseMove(e: MouseEvent | TouchEvent) {
    if (this.isTouchMouse) {
      const mousePoint = this.getMousePoint(e) || {
        x: undefined,
        y: undefined,
      };

      // 获取滑块 在圆的 坐标点
      let slider2Coordinate = this.pointChange(mousePoint, "canvas2point");

      if (!slider2Coordinate) return;

      const slideMove = this.getMoveTo(
        slider2Coordinate.x,
        slider2Coordinate.y
      );

      const slider = this.el.slider as Canvas.sliderState;

      this.getTemperature(slideMove); // 动态现实当前温度
      if (!slideMove.x) return;

      const tar = this.pointChange(slideMove, "point2canvas");
      this.drawOption = [tar.x, tar.y, slider.r, slideMove.z];
      this.draw(tar.x, tar.y, slider.r, slideMove.z);
    }
  }

  getMousePoint(e: MouseEvent | TouchEvent): Canvas.mousePoint {
    // 获取鼠标当前在canvas的位置
    const clientX =
      e instanceof MouseEvent ? e.clientX : e.targetTouches[0].clientX;
    const clientY =
      e instanceof MouseEvent ? e.clientY : e.targetTouches[0].clientY;

    return {
      x: clientX - this.canvasId.getBoundingClientRect().left,
      y: clientY - this.canvasId.getBoundingClientRect().top,
    };
  }
  getTemperature(e: Canvas.slideMove) {
    const temperature = this.el.temperature as Canvas.temperatureState;
    const angle = this.el.angle as Canvas.angleState;
    const section = temperature.max - temperature.min; // 数值区间
    const partition = (angle.e - angle.s) / section; // 刻度范围
    let scale; // 刻度

    // 判断当前滑动数据处于何区间

    // 尽头，判断最大最小
    const ttt = e.z / Math.PI;
    if (ttt < angle.s && ttt > angle.e - 2) {
      scale = ttt > 1 - ttt ? 0 : 14;
      // console.log("当前温度：", scale + temperature.min);
      this.currentTemChange(scale + temperature.min);
      return false;
    }

    if (e.z / Math.PI < angle.s) {
      scale = Math.floor((2 + e.z / Math.PI - angle.s) / partition);
    } else {
      scale = Math.floor((e.z / Math.PI - angle.s) / partition);
    }
    // console.log("当前温度：", scale + temperature.min);
    this.currentTemChange(scale + temperature.min);
    return scale + temperature.min;
  }
  currentTemChange(e: number) {
    this.$emit("update:currentTem", e);
  }
  getMoveTo(lx: number, ly: number): Canvas.slideMove {
    if (!this.isTouchMouse) return { x: 0, y: 0, z: 0 };
    let res = {};

    // 由滑块粗略位置 -> 滑块精准位置 -> 最终转角角度
    // 计算滑块在园内的精确坐标信息
    // f(x)=arctanx则是求正切值为x的对袭应的是多少角度(或弧度)
    const atanMouse = Math.atan(ly / lx);

    const circleCenter = this.el.circleCenter as Canvas.circleCenterState;
    const angle = this.el.angle as Canvas.angleState;
    let mousePoint = {
      x: circleCenter.r * Math.cos(atanMouse),
      y: circleCenter.r * Math.sin(atanMouse),
      z: 0,
    };

    if (lx < 0) {
      //坐标点处理
      mousePoint.x = -mousePoint.x;
      mousePoint.y = -mousePoint.y;
    }
    const degrees = Math.atan2(mousePoint.y, mousePoint.x) / (Math.PI / 180);
    const radianChange =
      degrees < 0 ? Math.abs(degrees / 180) : (360 - degrees) / 180;
    const eAngle = Math.PI * radianChange;
    // 限制
    if (angle.e - 2 < radianChange && radianChange < angle.s) {
      return { x: 0, y: 0, z: eAngle };
    }

    mousePoint.z = eAngle;
    return mousePoint;
  }
  pointChange(a: Canvas.slideMove | Canvas.mousePoint, type: string) {
    //canvas与坐标之间转化
    let target = {
      x: 0,
      y: 0,
    };
    const { x, y } = this.el.circleCenter as Canvas.circleCenterState; // 圆心坐标

    if (type === "canvas2point") {
      // canvas坐标转圆坐标
      target.x = a.x < x ? -x + a.x : a.x - x;
      target.y = a.y < y ? y - a.y : y - a.y;
    } else if (type === "point2canvas") {
      // 圆坐标转canvas坐标
      target.x = a.x < 0 ? x - Math.abs(a.x) : x + a.x;
      target.y = a.y < 0 ? y + Math.abs(a.y) : y - a.y;
    }

    return target;
  }
  OnMouseUp() {
    //鼠标释放
    this.sliderNarrow();
    this.isTouchMouse = false;
  }
  OnMouseDown(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    const mousePoint = this.getMousePoint(e) || {
      x: undefined,
      y: undefined,
    };
    const isPointInPath = this.canvasContent.isPointInPath(
      mousePoint.x,
      mousePoint.y
    );
    if (isPointInPath) {
      this.isTouchMouse = true;
      this.sliderEnlarge(mousePoint);
    } else {
      this.isTouchMouse = false;
    }
  }
  sliderEnlarge(mousePoint: Canvas.mousePoint) {
    const slider = this.el.slider as Canvas.sliderState;
    slider.r = (this.canvasId.height * 20) / 400;
    console.log("@", this.drawOption);

    this.draw(this.drawOption[0], this.drawOption[1], 0, this.drawOption[3]);
  }
  sliderNarrow() {
    const slider = this.el.slider as Canvas.sliderState;
    slider.r = (this.canvasId.height * 11) / 400;

    this.draw(this.drawOption[0], this.drawOption[1], 0, this.drawOption[3]);
  }
  drawRequestAnimationFrame(newVal: number, oldVal: number) {
    if (this.isTouchMouse) return;
    // 获取当前滑块距离，目标滑块距离，变量公式
    const angle = this.el.angle as Canvas.angleState;
    const temperature = this.el.temperature as Canvas.temperatureState;
    const section = temperature.max - temperature.min; // 数值区间
    const partition = (angle.e - angle.s) / section; // 刻度范围

    const dVal = newVal - oldVal;
    const changeTemTotal = this.currentTem - dVal;
    const isPositive = dVal > 0;

    // const changeRadian =
    //   (angle.s + (oldVal - temperature.min) * partition) * Math.PI;
    // 计算滑块点
    // const circleCenter = this.el.circleCenter as Canvas.circleCenterState;
    // const sliderPoint = {
    //   x: circleCenter.x + circleCenter.r * Math.cos(oldVal + changeRadian),
    //   y: circleCenter.y + circleCenter.r * Math.sin(oldVal + changeRadian),
    // };
    const oldValRadian =
      (angle.s + (oldVal - temperature.min) * partition) * Math.PI;
    const changeRadian = (newVal - oldVal) * partition * Math.PI;
    // this.dueRequestAnimationFrame(oldVal, oldValRadian, changeRadian);
    // this.loopRequestAnimationFrame(changeRadian, 1000);
    const timeVal = changeRadian / 10;
    this.tes(oldValRadian, changeRadian, timeVal, 10);
  }
  // dueRequestAnimationFrame(
  //   oldVal: number,
  //   oldValRadian: number,
  //   changeRadian: number
  // ) {
  //   const circleCenter = this.el.circleCenter as Canvas.circleCenterState;
  //   const sliderPoint = {
  //     x:
  //       circleCenter.x + circleCenter.r * Math.cos(oldValRadian + changeRadian),
  //     y:
  //       circleCenter.y + circleCenter.r * Math.sin(oldValRadian + changeRadian),
  //   };
  // }
  tes(
    oldValRadian: number,
    changeRadian: number,
    timeVal: number,
    times: number
  ) {
    const circleCenter = this.el.circleCenter as Canvas.circleCenterState;
    const sliderPoint = {
      x: circleCenter.x + circleCenter.r * Math.cos(oldValRadian + timeVal),
      y: circleCenter.y + circleCenter.r * Math.sin(oldValRadian + timeVal),
    };
    if (!times) {
      console.log("*", this.drawOption);
      window.cancelAnimationFrame(this.animationFrameKey);
    } else {
      this.draw(sliderPoint.x, sliderPoint.y, 0, oldValRadian + timeVal);
      this.drawOption = [
        sliderPoint.x,
        sliderPoint.y,
        0,
        oldValRadian + timeVal,
      ];

      this.animationFrameKey = window.requestAnimationFrame(() =>
        this.tes(oldValRadian + timeVal, changeRadian, timeVal, times - 1)
      );
    }
  }
  loopRequestAnimationFrame(
    changeRadian: number,
    timeStamp: number,
    remakeTime = 0
  ) {
    const times = +new Date();
    if (remakeTime && times - remakeTime > timeStamp) {
      window.cancelAnimationFrame(this.animationFrameKey);
      console.log("取消");
    } else if (times - remakeTime > 1000 / 60) {
      console.log("run runrun ", times - remakeTime, remakeTime);
      // this.draw(sliderPoint.x, sliderPoint.y, 0, radian);
      this.animationFrameKey = window.requestAnimationFrame(() =>
        this.loopRequestAnimationFrame(changeRadian, timeStamp, times)
      );
    } else {
      console.log("not run", times - remakeTime);
    }
    // const portion = changeRadian / timeStamp / 60;
  }
  // runRequestAnimationFrame() {}
  // event() {
  //   //事件绑定
  //   this.canvasId.addEventListener(
  //     "mousedown",
  //     this.OnMouseDown.bind(this),=-
  //     false
  //   );
  //   this.canvasId.addEventListener(
  //     "mousemove",
  //     this.OnMouseMove.bind(this),
  //     false
  //   );
  //   this.canvasId.addEventListener("mouseup", this.OnMouseUp.bind(this), false);
  //   this.canvasId.addEventListener(
  //     "touchstart",
  //     this.OnMouseDown.bind(this),
  //     false
  //   );
  //   this.canvasId.addEventListener(
  //     "touchmove",
  //     this.OnMouseMove.bind(this),
  //     false
  //   );
  //   this.canvasId.addEventListener(
  //     "touchendend",
  //     this.OnMouseUp.bind(this),
  //     false
  //   );
  // }
}
</script>
<style lang="less" scoped>
.partion_canvas {
  .canvas {
    z-index: 100;
    display: block;
    margin: 0 auto;
  }
}
</style>
