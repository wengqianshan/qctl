import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import Versions from './components/Versions'

function App() {
  const [server, setServer] = useState()
  const [qrcode, setQrcode] = useState()
  const [permission, setPermission] = useState()
  const [loading, setLoading] = useState(false)
  const start = async () => {
    setLoading(true)
    console.log('启动服务 >>>>>>>>>>>>>>>>>')
    const info = await window.electron.ipcRenderer.invoke('app.server')
    const { ip, port } = info
    const url = `http://${ip}:${port}`
    const data = await QRCode.toDataURL(url, { width: 300, height: 300, margin: 1 })
    setQrcode(data)
    setServer({ url })
    setLoading(false)
  }

  const stop = () => {
    console.log('停止服务 <<<<<<<<<<<<<<<<<<<')
    window.electron.ipcRenderer.send('app.stop')
    setServer(null)
  }

  const exit = () => {
    window.electron.ipcRenderer.send('app.exit')
  }

  const checkPermission = () => {
    const { permissions } = window.api
    const { getAuthStatus } = permissions
    let status = getAuthStatus('accessibility')
    console.log('检查权限: ', status)
    setPermission(status)
    setTimeout(() => {
      checkPermission()
    }, 3000)
  }

  const AskPermission = () => {
    const { permissions } = window.api
    const { askForAccessibilityAccess } = permissions
    askForAccessibilityAccess()
  }

  useEffect(() => {
    console.log(permission, '权限 ++++++++++++')
    if (!permission) {
      return
    }
    if (loading) {
      return
    }
    if (permission !== 'authorized' && server) {
      return stop()
    }
    if (server) {
      return
    }
    if (permission === 'authorized') {
      start()
    }
    return () => {}
  }, [permission, loading, server])

  useEffect(() => {
    const { platform } = window.api
    if (platform !== 'darwin') {
      return
    }
    checkPermission()
    return () => {}
  }, [])

  const authorized = permission === 'authorized'

  return (
    <div className="container">
      <section className="main">
        {authorized ? (
          <img className="qrcode" srcSet={qrcode} />
        ) : (
          <button onClick={AskPermission}>去授权</button>
        )}
      </section>
      {authorized && (
        <section className="server">
          <h3>{server?.url}</h3>
          <ul>
            <li>1. 确保此设备和手机在同一WiFi</li>
            <li>2. 打开手机相机或有扫码功能的App扫描上方二维码</li>
          </ul>
        </section>
      )}
      <footer className="footer">
        <div className="actions">
          <button onClick={exit}>退出</button>
        </div>
        <Versions />
      </footer>
    </div>
  )
}

export default App
