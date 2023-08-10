/**
 * 鼠标控制
 */

import robot from 'robotjs'

robot.setMouseDelay(2)

let start = []
let fingers = 1
const sensitivity = 4 // 灵敏度设置，值越大越灵敏，建议控制在 [2-8] 之间

const touchstart = function (len) {
  fingers = len

  // 获取鼠标当前位置
  let { x, y } = robot.getMousePos()
  if (x < 0) {
    x = 0
  }
  if (y < 0) {
    y = 0
  }
  start = [x, y]

  // 三指
  if (fingers === 3) {
    robot.mouseToggle('down')
  }
}

const touchmove = function (offset) {
  // console.log('移动中: ', pos);
  const [offsetX, offsetY] = offset
  const x = start[0] + offsetX * sensitivity
  const y = start[1] + offsetY * sensitivity

  if (fingers === 3) {
    // 三指拖动
    robot.dragMouse(x, y)
  } else if (fingers === 2) {
    // 双指滚动
    robot.scrollMouse(offsetX, offsetY)
  } else {
    // 默认单指
    robot.moveMouse(x, y)
  }
}

const touchend = function () {
  if (fingers === 3) {
    robot.mouseToggle('up')
  }
}

const click = function (taps, pointers) {
  if (taps === 2) {
    // 双击
    robot.mouseClick('left', true)
  } else if (pointers === 2) {
    // 右键
    robot.mouseClick('right')
  } else {
    // 单击
    robot.mouseClick()
  }
}

const key = function (val) {
  console.log('键盘', val)
  try {
    const code = val.toLocaleLowerCase()
    const modified = []
    if (/[A-Z]/.test(val)) {
      modified.push('shift')
    }
    robot.keyTap(code, modified)
  } catch (e) {
    console.log(e)
  }
}

const text = function (val) {
  robot.typeString(val)
}

const log = function (msg) {
  console.log(msg)
}

export default {
  touchstart,
  touchmove,
  touchend,
  click,
  key,
  text,
  log
}
