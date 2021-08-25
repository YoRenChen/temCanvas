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
