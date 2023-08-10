const socket = io();

const $touch = document.querySelector('#touch');
const $actions = document.querySelectorAll('.btn');
const $input = document.querySelector('#input');
const $error = document.querySelector('#error');

socket.on('disconnect', (reason) => {
  // console.log(reason);
  $error.classList.remove('hide');
});
socket.on('connect', (reason) => {
  // console.log(reason, '/////');
  $error.classList.add('hide');
});

$touch.addEventListener('touchstart', (e) => {
  $input.blur();
});

let start = [0, 0]; // 记录起始点
$touch.addEventListener('touchstart', (e) => {
  const touches = e.touches;

  const {pageX, pageY} = touches[0];
  start = [pageX, pageY];

  const fingers = touches.length;

  socket.emit('touchstart', fingers);
});

// 移动中
$touch.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const {pageX, pageY} = touch;
  const offset = [Math.round(pageX - start[0]), Math.round(pageY - start[1])];
  socket.emit('touchmove', offset);
});

// 结束触点
$touch.addEventListener('touchend', (e) => {
  socket.emit('touchend');
});

// 监听键盘事件
document.addEventListener('keyup', (e) => {
  e.preventDefault();
  const key = e.key;
  socket.emit('key', key);
});
[].slice.call($actions).map(item => {
  item.addEventListener('click', (e) => {
    const val = item.dataset.val;
    switch (val) {
      case 'text':
        const txt = window.prompt('文本输入');
        if (!txt) {
          return;
        }
        socket.emit('text', txt);
        break;
      case 'keyboard':
        e.preventDefault();
        $input.focus();
        break;
      default:
      socket.emit('key', val);
        break;
    }
  });
});

// hammer
const mc = new Hammer.Manager($touch);
// 定义右键
mc.add( new Hammer.Tap({ event: 'righttap', pointers: 2 }) );
// 定义双击
mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
mc.add( new Hammer.Tap({ event: 'singletap' }) );

mc.on("singletap", function(ev) {
  // console.log('单击')
  // socket.emit('log', '单击');
  socket.emit('click');
});
mc.on("doubletap", function(ev) {
  // console.log('双击')
  // socket.emit('log', '双击');
  socket.emit('click', 2);
});
mc.on("righttap", function(ev) {
  // console.log('右键')
  // socket.emit('log', '右键');
  socket.emit('click', 1, 2);
});

/**
 * 下面是hammer实现的鼠标移动事件
 *
// 鼠标移动
const move = new Hammer.Pan({event: 'move', pointers: 1, direction: Hammer.DIRECTION_ALL});
// 鼠标滚动
const scroll = new Hammer.Pan({event: 'scroll', pointers: 2, direction: Hammer.DIRECTION_ALL});
// 鼠标拖动
const drag = new Hammer.Pan({event: 'drag', pointers: 3, direction: Hammer.DIRECTION_ALL});

mc.add([move, scroll, drag]);

drag.recognizeWith([scroll, move]);
scroll.recognizeWith(move);

scroll.requireFailure(drag);
move.requireFailure([drag, scroll]);

let start = [0, 0]; // 记录起始点
mc.on('movestart scrollstart dragstart', (e) => {
  const pointers = e.pointers.length;
  socket.emit('touchstart', pointers);
});

mc.on('move scroll drag', (e) => {
  socket.emit('touchmove', [e.deltaX, e.deltaY]);
});

mc.on('moveend scrollend dragend', (e) => {
  socket.emit('touchend');
});

**
 * end
 */
