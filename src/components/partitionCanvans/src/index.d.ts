namespace Canvas {
  type canvasGradient = {
    [key in number]: string;
  };
  type circleCenterState = {
    x: number;
    y: number;
    r: number;
    color: string;
  };
  type angleState = {
    s: number;
    e: number;
  };
  type variableState = {
    x: number;
    y: number;
    eAngle: number;
  };
  type sliderState = {
    x: nunber;
    y: number;
    r: number;
    color: string;
  };
  type temperatureState = {
    min: numnber;
    max: numnber;
    current: number;
  };
  type elState = {
    currentTemperature?: number;
    circleCenter?: circleCenterState;
    angle?: angleState;
    variable?: variableState;
    slider?: sliderState;
    temperature?: temperatureState;
  };
  type initInfo = {
    [k in string]: string;
  };
  type canvasRect = {
    width: number;
    height: number;
  };
  type drawDataState = {
    lx: number;
    ly: number;
    lr: number;
    lj: number;
  };
  type slideMove = {
    x: number;
    y: number;
    z: number;
  };
  type mousePoint = {
    x: number;
    y: number;
  };
  type drawPooint = {
    x: number;
    y: number;
    r: number;
    j: number;
  };
}
export default Canvas;
