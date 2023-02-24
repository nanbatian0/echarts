export default class SocketService {
  // 单例设计模式
  static instance = null
  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  // 和服务端连接的socket对象
  ws = null
  // 记录是否连接到服务器
  connected = false
  // 记录重新发送数据的次数
  sendRetrycount = 0
  // 记录重新连接尝试的次数
  connectRetryCount = 0
  // 存贮回调函数的
  callBackMapping = {}

  // 定义连接服务器的方法
  connect() {
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket')
    }
    this.ws = new WebSocket('ws://localhost:9998')
    // 连接成功的事件
    this.ws.onopen = () => {
      console.log('连接服务端成功了')
      this.connected = true
      this.connectRetryCount = 0
    }
    // 连接服务端失败事件
    this.ws.onclose = () => {
      console.log('连接服务器失败')
      this.connected = false
      this.connectRetryCount++
      setTimeout(() => {
        this.connect()
      }, this.connectRetryCount * 500)
    }
    // 得到服务端发过来数据
    this.ws.onmessage = (msg) => {
      console.log('从服务端获取到了数据')
      // console.log(msg.data)
      const recvData = JSON.parse(msg.data)
      const socketType = recvData.socketType
      // 判断回调函数是否存在
      if (this.callBackMapping[socketType]) {
        const action = recvData.action
        if (action === 'getData') {
          const realData = JSON.parse(recvData.data)
          this.callBackMapping[socketType].call(this, realData)
        } else if (action === 'fullScreen') {
          //
        } else if (action === 'themeChange') {
          //
        }
      }
    }

    //
  }

  // 回调函数的注册
  registerCallBack(socketType, callBack) {
    this.callBackMapping[socketType] = callBack
  }

  // 取消某一个回调函数
  unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null
  }

  // 发送数据的方法
  send(data) {
    // 先判断此时此刻有没有和服务端连接成功
    if (this.connected) {
      this.sendRetrycount = 0
      this.ws.send(JSON.stringify(data))
    } else {
      this.sendRetrycount++
      setTimeout(() => {
        this.send(data)
      }, this.sendRetrycount * 500)
    }
  }
}
