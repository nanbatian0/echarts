<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref">图标</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartInstace: null,
      // 服务器返回的数据
      allData: null,
      totalPage: 0, // 图表的总页面
      currentPage: 1, // 图表的当前页面
      timerId: null // 定时器
    }
  },
  created() {
    this.$socket.registerCallBack('sellerData', this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller',
      value: ''
    })
    // 监听浏览器的大小
    window.addEventListener('resize', this.screenAdd)
    // 在首次页面加载完成时，主动进行屏幕自适配
    this.screenAdd()
  },

  destroyed() {
    clearInterval(this.timerId)
    window.removeEventListener('resize', this.screenAdd)
    this.$socket.unRegisterCallBack('sellerData')
  },

  methods: {
    // 初始化eacharts实例对象
    initChart() {
      this.chartInstace = this.$eacharts.init(this.$refs.seller_ref, 'chalk')
      // 对图表初始化的配置
      const initOption = {
        title: {
          text: '👅| 商家销售统计图',
          textStyle: {},
          left: 20,
          top: 20
        },

        grid: {
          top: '20%',
          left: '3%',
          bottom: '3%',
          right: '6%',
          containLabel: true // 距离是包含坐标轴上的文字
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        series: [
          {
            type: 'bar',
            itemStyle: {
              // 颜色渐变
              color: new this.$eacharts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: '#5052EE'
                },
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            },
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'pink'
              }
            }
          }
        ],
        // 提示框组件
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              color: '#2D3443'
            }
          }
        }
      }
      this.chartInstace.setOption(initOption)

      // 对图标进行鼠标事件监听
      this.chartInstace.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstace.on('mouseout', () => {
        this.startInterval(this.timerId)
      })
    },

    // 获取服务器数据
    getData(ret) {
      // const { data: ret } = await this.$http.get('seller')
      // console.log(ret)
      this.allData = ret
      this.allData.sort((a, b) => {
        return a.value - b.value
      })
      // 每5个元素显示一页
      this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
      this.updateChart()
      this.startInterval()
    },

    // 更新图表
    updateChart() {
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      const showData = this.allData.slice(start, end)
      const sellerNames = showData.map((item) => {
        return item.name
      })
      const sellerValues = showData.map((item) => {
        return item.value
      })

      // 设置option配置项 获取数据后的配置项
      const dataOption = {
        yAxis: {
          data: sellerNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      }

      this.chartInstace.setOption(dataOption)
    },

    // 窗口自适应
    screenAdd() {
      // console.log(this.$refs.seller_ref.offsetWidth)
      // 标题文字大小
      const titleFontSize = (this.$refs.seller_ref.offsetWidth / 100) * 3.6
      // 屏幕自适应配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },

        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ],
        // 提示框组件
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        }
      }
      this.chartInstace.setOption(adapterOption)
      // 手动调用图表resize
      this.chartInstace.resize()
    },
    // 定时器
    startInterval() {
      // 保险方法 消除定时器
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    }
  }
}
</script>

<style lang="less" scoped></style>
