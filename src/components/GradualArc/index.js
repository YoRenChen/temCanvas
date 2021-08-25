class Color {
  rgbToHex(r, g, b) {
    var hex = ((r<<16) | (g<<8) | b).toString(16);
    return "#" + new Array(Math.abs(hex.length-7)).join("0") + hex;
  }
  hexToRgb(hex){
    var rgb = [];
    for(let i = 1; i < 7; i += 2){
        rgb.push(parseInt("0x" + hex.slice(i,i+2)));
    }
    return rgb;
  }

  // 计算每份 RGB 差值颜色
  gradient (startColor, endColor, step = 5){
      const rgbColor = this.setIntermediateColor(startColor, endColor)
      const startCol = this.hexToRgb(startColor)

      const rgbDiff = rgbColor.map(e => e/step)
      const gradientColorArr = 
        new Array(step).fill().map((el, i) => rgbToHex(
            parseInt(rgbDiff[0] * i + startCol[0]),
            parseInt(rgbDiff[1] * i + startCol[1]),
            parseInt(rgbDiff[2] * i + startCol[2])
          )
        )
      return gradientColorArr;
  }

  // 获取两颜色的色差
  setIntermediateColor(startColor = '#fff', endColor) {
    if (!startColor || !endColor) return this.hexToRgb(startColor || endColor)
    const startCol = this.hexToRgb(startColor),
          endCol = this.hexToRgb(endColor);

    const rStep = (endCol[0] - startCol[0]),
        gStep = (endCol[1] - startCol[1]),
        bStep = (endCol[2] - startCol[2]);
    return [rStep, gStep, bStep]
  }

  // 两数相加/相乘
  addNum(num1, num2) {
    const pow = this.getPow(num1, num2)
    return (num1 * pow + num2 * pow) / pow
  }

  // 两数相乘
  multiplyNum(num1, num2) {
    const pow = this.getPow(num1, num2)
    return (num1 * pow * num2 * pow) / Math.pow(pow, 2)
  }

  getPow(num1, num2) {
    const numStr1 = num1.toString().split(".")[1] || ''
    const numStr2 = num2.toString().split(".")[1] || ''
    const length1 = numStr1.length
    const length2 = numStr2.length
    return Math.pow(10, Math.max(length1, length2))
  }
}

class GradualCircle extends Color {
  constructor(props) {
    super()
    this.canvas = props.canvas
    this.ctx = undefined
    this.partternImageSrouce = undefined
    this.animation = {
      from: 0,
      to: 0
    }
    this.valueRange = {
      min: props.min || 0,
      max: props.max || 100
    }
    this.value = 100
    this.speedValue = 2
    this.speed = 0
    this.temporaryValue = 0
    this.animationTime = 0
    this.arc = {  // 默认 0 - 2 PI
      start: 0,
      end: 2,
    }
    this.ofsFix = 0

    this.circle = {
      size: props.size || 200,
      r: props.r || 75,
      lineWidth: props.lineWidth || 8,
      startArc:  Math.PI * -0.5
    }
    this.defaultArc = Math.PI / 2
    this.color = {
      50: '#0081FF',
      100: '#01D8DA',
    }
    this.counterclockwise = false // false = 顺时针，true = 逆时针
    this.colorStepNumber = 2 // 分 5份
    this.colorObj = {}
    this.runAimation = true

    this.init()
  }

  init() {
    const canvas = this.canvas
    canvas.width = 200
    canvas.height = 200
    // this.animation.to = this.percent
    this.ctx = this.canvas.getContext('2d')

    this.drawCircle()
  }

  drawCircle() {
    const colorObj = this.colorLayered(this.color)
    this.colorObj = colorObj

    this.drawAnimation()
  }

  // 动画
  drawAnimation(ctx = this.ctx, colorObj = this.colorObj) {
    // 初始值和目标值的准差
    // 初步设计每4进
    if(!this.runAimation) return
    const time = +new Date()
    const timeDiff = time - this.animationTime
    window.requestAnimationFrame(() => {
      this.drawAnimation(ctx, colorObj)
      const value = this.setAnimationValue()
      if ((timeDiff) > this.speed && this.temporaryValue !== value) {
        this.animationTime = time
        this.temporaryValue = value
        this.drawMove(ctx, colorObj, value)
      }
    })
  }

  setAnimationValue() {
    const diff = this.value - this.temporaryValue

    const val =  Math.abs(diff) > 0 
      ? Math.abs(diff) > 4
        ? this.temporaryValue + (diff > 0 ? this.speedValue : -this.speedValue)
        : this.temporaryValue + diff
      : this.temporaryValue
    if (this.value === val) this.runAimation = false
    console.log(val, this.value, this.temporaryValue, diff);
    return val
  }

  changeValue(val) {
    this.value = val
    this.runAimation = true
    this.drawAnimation()
  }

  // 绘制
  drawMove(ctx, colorObj, endValue) {
    if (!this.partternImageSrouce) {
      this.partternImageSrouce = this.getPattern(colorObj)
    }
    const value = (endValue > this.valueRange.max) 
      ? this.valueRange.max 
      : (this.value < this.valueRange.min) 
      ? this.valueRange.min 
      : endValue

    const arcStart = this.circle.startArc
    const arcEnd = this.circle.startArc 
      + (2 * value / (this.valueRange.max - this.valueRange.min)) * Math.PI
    ctx.beginPath()
    ctx.clearRect(0, 0, this.circle.size, this.circle.size)
    const newFill = ctx.createPattern(this.partternImageSrouce, 'repeat')
    ctx.strokeStyle = newFill
    ctx.lineWidth = this.circle.lineWidth
    ctx.lineCap = this.ofsFix ? 'round' : 0
    ctx.arc(this.circle.size / 2, this.circle.size / 2, this.circle.r, arcStart, arcEnd, this.counterclockwise)
    ctx.stroke()
    ctx.closePath()

  }

  colorType() {
    // 单色情况
    if (typeof this.color === 'string') {
      // 单色
    }
    else if (typeof this.color === 'object') {
      // 多颜色组合渐变
    }
  }

  /**
   * 颜色分层
   * @param {*} color
   * @returns {0: #fff,..., 100: #fff}
   */
  colorLayered(color) {
    if (!color) return
    const keys = Object.keys(color).sort((a, b) => a - b)
    // 获取颜色组合
    const listObj = {}
    keys.map((el, i) => {
      if (!i) {
        listObj[0] = color[keys[i]]
      } else {
        const previousColorVal = Object.values(listObj)[i - 1]
        const diffList = this.setIntermediateColor(previousColorVal, color[el])
        const startRgb = this.hexToRgb(previousColorVal)
        const colorRgbDiff = diffList.map((e, i) => parseInt(e / 2 + startRgb[i]))
        listObj[keys[i - 1]] = this.rgbToHex(colorRgbDiff[0], colorRgbDiff[1], colorRgbDiff[2])
      }
    })
    const lastColorVal = color[keys[keys.length - 1]]
    listObj[100] = lastColorVal

    return listObj
  }

  getPattern(colorObj) {
    const canvasElement = document.createElement('canvas')
    canvasElement.width = this.circle.size
    canvasElement.height = this.circle.size
    const center = { x: this.circle.size / 2, y: this.circle.size / 2 }
    const radius = this.circle.r

    const quadrants = this.getQuadrants(Object.keys(colorObj), colorObj)
    // console.log('quadrants', quadrants);

    const ctx = canvasElement.getContext('2d')

    quadrants.forEach((el, i) => {
      // 如果路径超过了 总圆弧的50% 需要细化分段
      Math.abs(el.angleEnd - el.angleStart) > 1
       ? this.getcolorSteps(el).forEach(element => this.colorGradient(element, center, radius, ctx))
       : this.colorGradient(el, center, radius, ctx)
    })

    // 旋转
    ctx.translate(center.x, center.y)
    ctx.rotate(-Math.PI * 0.5) 
    ctx.translate(-center.x, -center.y)
    ctx.drawImage(canvasElement, 0, 0)
    return canvasElement
  }

  // 上色
  colorGradient(el, center, radius, ctx) {
    const grad = ctx.createLinearGradient(el.x1, el.y1, el.x2, el.y2)
    grad.addColorStop(0, el.colorSteps[0])
    grad.addColorStop(1, el.colorSteps[1])
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, el.angleStart * Math.PI, el.angleEnd * Math.PI, this.counterclockwise)
    ctx.strokeStyle = grad
    ctx.lineWidth = this.circle.lineWidth
    ctx.stroke()
  }

  // 需要把色块再分化
  getcolorSteps(el) {
    // 弧度差值
    const angleDiffVal = Math.abs(el.angleEnd - el.angleStart) / this.colorStepNumber
    // 色值差值
    const colorDiffVal = this.setIntermediateColor(el.colorSteps[0], el.colorSteps[1]).map(el => Number((el / this.colorStepNumber).toFixed(6)) ) 

    return new Array(this.colorStepNumber).fill().map((_, i) => {
      const angleStart = this.addNum(el.angleStart, this.multiplyNum(angleDiffVal, i))
      const angleEnd = this.addNum(el.angleStart, this.multiplyNum(angleDiffVal, (i + 1)))

      // 色值叠加
      const startRGB = this.hexToRgb(el.colorSteps[0])
      const endRGB = this.hexToRgb(el.colorSteps[1])

      const startColorRGB 
        = colorDiffVal.map((element, index) => startRGB[index] + element * i)
      const endColorRGB 
        = colorDiffVal.map((element, index) => startRGB[index] + element * (i + 1))
      const startColorHEX 
        = this.rgbToHex(startColorRGB[0], startColorRGB[1], startColorRGB[2])
      const endColorHEX 
        = this.rgbToHex(endColorRGB[0], endColorRGB[1], endColorRGB[2])
      // 获取转移后的坐标
      const coordinatePoint = this.getCoordinatePoint(angleStart, angleEnd)
      return {
        angleStart,
        angleEnd,
        colorSteps: [startColorHEX, endColorHEX],
        x1: coordinatePoint.x1, 
        x2: coordinatePoint.x2, 
        y1: coordinatePoint.y1, 
        y2: coordinatePoint.y2
      }
    })
  }

  getQuadrants(keys, colorObj) {
    return keys.map((el, i) => {
      const nextKeysVal = keys[i + 1] || keys[i]
      const sAngle = this.arc.start + this.arc.end * el / 100
      const eAngle = this.arc.start + this.arc.end * nextKeysVal / 100
      const coordinatePoint = this.getCoordinatePoint(sAngle, eAngle)
      const res = {
        angleStart: sAngle,
        angleEnd: eAngle,
        x1: coordinatePoint.x1,
        x2: coordinatePoint.x2,
        y1: coordinatePoint.y1,
        y2: coordinatePoint.y2,
        colorSteps: [colorObj[el], colorObj[nextKeysVal]]
      }
      return res
    })
  }
  // 由弧度线获取 坐标轴点
  getCoordinatePoint(sAngle, eAngle) {
    const center = { x: this.circle.size / 2, y: this.circle.size / 2 }
    const radius = this.circle.r
    const ofs = this.ofsFix

    return {
      x1: center.x + radius
        * parseFloat(Math.cos(sAngle * Math.PI).toFixed(6)),
      y1: center.y + radius 
        * this.getCounterclockwiseY(sAngle),
      x2: center.x + radius 
        * parseFloat(Math.cos(eAngle * Math.PI).toFixed(6)),
      y2: center.y + radius 
        * this.getCounterclockwiseY(eAngle),
    }
  }

  // 获取 Y 轴下的弧序 正反值
  getCounterclockwiseY(e) {
    const val = parseFloat(Math.sin(e * Math.PI).toFixed(6))
    return this.counterclockwise ? -val : val
  }

}
