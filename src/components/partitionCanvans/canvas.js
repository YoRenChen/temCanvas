const DrawCanvas = {
  init: function (e, initInfo) {
    // debugger
    this.canvasId = e; //获取canvas对象
    this.canvasContent = e.getContext("2d");
    const screen = {
      width: window.document.documentElement.clientWidth,
      height: window.document.documentElement.clientHeight,
    };

    const canvas = {
      width: screen.width > 400 ? 400 : screen.width,
      height: screen.width > 400 ? 400 : screen.width,
    };

    this.canvasId.width = canvas.width;
    this.canvasId.height = canvas.height;

    const el = {
      circleCenter: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: canvas.width * 0.3,
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
        current: 16,
      }, // 温度信息
    };
    this.el = el;
    this.initInfo = initInfo;
    this.draw.prototype = this;
    this.event();
    this.canvasEl = new this.draw();
    this.initTemperature();
  },
  draw: function (lx, ly, lr, lj) {
    const x = lx || this.el.slider.x,
      y = ly || this.el.slider.y,
      r = lr || this.el.slider.r,
      j = lj || this.el.angle.eAngle * Math.PI;
    // const {}
    this.canvasContent.clearRect(
      0,
      0,
      this.canvasId.width,
      this.canvasId.height
    );

    // 底圆弧
    this.canvasContent.beginPath();
    this.canvasContent.arc(
      this.el.circleCenter.x,
      this.el.circleCenter.y,
      this.el.circleCenter.r,
      Math.PI * this.el.angle.s,
      Math.PI * this.el.angle.e,
      false
    );

    this.canvasContent.strokeStyle = this.el.circleCenter.color;
    this.canvasContent.lineCap = "round";
    this.canvasContent.lineWidth = 10;
    this.canvasContent.stroke();

    // 绘制可变弧

    this.canvasContent.beginPath();
    this.canvasContent.arc(
      this.el.circleCenter.x,
      this.el.circleCenter.y,
      this.el.circleCenter.r,
      Math.PI * 0.85,
      j,
      false
    );
    let gradient = this.canvasContent.createLinearGradient(0, 0, x, 0);

    gradient.addColorStop("0", "rgba(0,196,140,1)");
    gradient.addColorStop("0.5", "rgba(0,196,140,1)");
    gradient.addColorStop("1.0", "rgba(2,211,237,1)");
    this.canvasContent.strokeStyle = gradient;
    this.canvasContent.lineCap = "round";
    this.canvasContent.lineWidth = 10;
    this.canvasContent.stroke();

    // 滑块
    this.canvasContent.beginPath();
    this.canvasContent.moveTo(100, 100);
    this.canvasContent.arc(x, y, r, 0, Math.PI * 2, false); // 绘制滑块内侧

    this.canvasContent.fillStyle = this.el.slider.color;
    this.canvasContent.fill();
  },
  OnMouseMove: function (e) {
    if (!this.canvasEl.isDown) return;
    const mousePoint = this.getMousePoint(e) || { x: undefined, y: undefined };

    // 获取滑块 在圆的 坐标点
    let slider2Coordinate = this.pointChange(mousePoint, "canvas2point");
    if (!slider2Coordinate) return;

    const slideMove = this.getMoveTo(slider2Coordinate.x, slider2Coordinate.y);

    this.getTemperature(slideMove); // 动态现实当前温度
    if (!slideMove.x) return;

    const tar = this.pointChange(slideMove, "point2canvas");

    this.canvasEl.draw(tar.x, tar.y, this.el.slider.r, slideMove.z);
  },
  OnMouseDown: function (e) {
    const mousePoint = this.getMousePoint(e) || { x: undefined, y: undefined };
    const isPointInPath = this.canvasContent.isPointInPath(
      mousePoint.x,
      mousePoint.y
    );
    if (isPointInPath) {
      this.canvasEl.isDown = true;
    } else {
      this.canvasEl.isDown = false;
    }
  },
  OnMouseUp: function () {
    //鼠标释放
    this.canvasEl.isDown = false;
  },
  event: function () {
    //事件绑定
    this.canvasId.addEventListener(
      "mousedown",
      this.OnMouseDown.bind(this),
      false
    );
    this.canvasId.addEventListener(
      "mousemove",
      this.OnMouseMove.bind(this),
      false
    );
    this.canvasId.addEventListener("mouseup", this.OnMouseUp.bind(this), false);
    this.canvasId.addEventListener(
      "touchstart",
      this.OnMouseDown.bind(this),
      false
    );
    this.canvasId.addEventListener(
      "touchmove",
      this.OnMouseMove.bind(this),
      false
    );
    this.canvasId.addEventListener(
      "touchendend",
      this.OnMouseUp.bind(this),
      false
    );
  },
  getMoveTo: function (lx, ly) {
    if (!this.canvasEl.isDown) return false;
    let res = {};

    // 由滑块粗略位置 -> 滑块精准位置 -> 最终转角角度
    // 计算滑块在园内的精确坐标信息
    // f(x)=arctanx则是求正切值为x的对袭应的是多少角度(或弧度)
    const atanMouse = Math.atan(ly / lx);
    let mousePoint = {
      x: this.el.circleCenter.r * Math.cos(atanMouse),
      y: this.el.circleCenter.r * Math.sin(atanMouse),
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
    if (this.el.angle.e - 2 < radianChange && radianChange < this.el.angle.s) {
      return { z: eAngle };
    }

    mousePoint.z = eAngle;
    return mousePoint;
  },
  pointChange: function (a, type) {
    //canvas与坐标之间转化
    let target = {};
    const { x, y } = this.el.circleCenter; // 圆心坐标

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
  },
  getMousePoint(e) {
    // 获取鼠标当前在canvas的位置
    const clientX = e.clientX || e.targetTouches[0].clientX;
    const clientY = e.clientY || e.targetTouches[0].clientY;

    return {
      x: clientX - this.canvasId.getBoundingClientRect().left,
      y: clientY - this.canvasId.getBoundingClientRect().top,
    };
  },
  initTemperature(lcurrent) {
    // 根据初始温度，初始canvas数据
    const temperature = this.el.temperature;
    const section = temperature.max - temperature.min; // 数值区间

    const current = lcurrent || temperature.current; // 当前值
    if (current !== temperature.min) {
      const partition = (this.el.angle.e - this.el.angle.s) / section; // 刻度范围
      const radian =
        (this.el.angle.s + (current - temperature.min) * partition) * Math.PI; // 可移动弧线eAng数值

      const sliderPoint = {
        x: this.el.circleCenter.x + this.el.circleCenter.r * Math.cos(radian),
        y: this.el.circleCenter.y + this.el.circleCenter.r * Math.sin(radian),
      };
      this.canvasEl.draw(sliderPoint.x, sliderPoint.y, false, radian);
    } else {
      this.canvasEl.draw();
    }
  },
  getTemperature(e) {
    const temperature = this.el.temperature;
    const section = temperature.max - temperature.min; // 数值区间
    const partition = (this.el.angle.e - this.el.angle.s) / section; // 刻度范围
    let scale; // 刻度

    // 判断当前滑动数据处于何区间

    // 尽头，判断最大最小
    const ttt = e.z / Math.PI;
    if (ttt < this.el.angle.s && ttt > this.el.angle.e - 2) {
      scale = ttt > 1 - ttt ? 0 : 14;
      // debugger
      console.log("当前温度：", scale + temperature.min);
      return false;
    }

    if (e.z / Math.PI < this.el.angle.s) {
      scale = parseInt((2 + e.z / Math.PI - this.el.angle.s) / partition);
    } else {
      scale = parseInt((e.z / Math.PI - this.el.angle.s) / partition);
    }
    console.log("当前温度：", scale + temperature.min);
    return scale + temperature.min;
  },
};
export default { DrawCanvas };
