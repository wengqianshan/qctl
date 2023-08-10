/**
 * web服务 + websocket服务
 */

import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import { Notification } from 'electron'

import localIpUrl from 'local-ip-url'
import QRCode from 'qrcode'
// import getPort from 'get-port'
import mouse from './mouse.js'
import path from 'path'

let service = null

// fix: esm 模块引入问题
const loadModule = async () => {
  const m = await import('get-port')
  return m.default
}

export const start = async function (callback) {
  const getPort = await loadModule()
  // web服务和websocket服务初始化
  const app = express()
  const server = http.createServer(app)
  const io = new Server(server)

  // web资源路由
  // $App.isPackaged
  const dir = path.join(__dirname, '../../resources/mobile/')
  app.use(express.static(dir))

  // 建立websocket连接
  io.on('connection', (socket) => {
    console.log('新客户端加入:', socket.handshake.address)
    const notify = new Notification({
      title: '新客户端加入',
      body: 'Time: ' + Date.now()
    })
    notify.show()

    const events = ['touchstart', 'touchmove', 'touchend', 'click', 'key', 'text', 'log']
    events.forEach((event) => {
      socket.on(event, mouse[event])
    })

    socket.on('disconnect', (reason) => {
      console.log('客户端断开:', socket.id, reason)
    })
  })

  // 启动web服务
  const ip = localIpUrl()
  const port = await getPort({ port: 3000 })
  const url = `http://${ip}:${port}`
  service = server.listen(port, () => {
    callback({ service, ip, port })
    console.log(`web服务启动成功 访问地址: ${url}`)
    // 生成二维码
    QRCode.toString(url, { type: 'terminal' }, function (err, url) {
      console.log(url)
    })
  })
}

export const stop = function () {
  service && service.close()
}
