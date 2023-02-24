<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartInstane: null, // 服务器返回的数据
      allData: null,
      currentPage: 0, // 当前的页面
      timerId: null, // 定时器标识
      titleFontSize: 0
    }
  },
  created() {
    // 在组建创建完成之后，进行回调函数注册
    this.$socket.registerCallBack('stockData', this.getData)
  },

  mounted() {
    this.initChart()
    // this.getData()
    // 发送数据给服务器，告诉服务器我现在需要数据了
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      value: ''
    })
    this.startInterval()

    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timerId)
    // 在组建销毁的时候 进行函数的取消
    this.$socket.unRegisterCallBack('stockData')
  },

  methods: {
    // @1
    // 初始化eachers实例对象
    initChart() {
      this.chartInstane = this.$eacharts.init(this.$refs.stock_ref, 'chalk')
      const initOption = {
        title: {
          text: '|  库存与销量',
          top: 20,
          left: 20
        }
      }
      this.chartInstane.setOption(initOption)
      this.chartInstane.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstane.on('mouseout', this.startInterval)
    },

    // @2
    // 获取服务器的数据，对alldata赋值后，调用updateChart更新图标
    getData(ret) {
      // this.$http.get('map)
      // const { data: ret } = await this.$http.get('stock')
      this.allData = ret

      console.log(ret)
      this.updateChart()
    },

    // @3
    // 把数据渲染到图表中
    updateChart() {
      // 处理需要的数据
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]

      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const start = this.currentPage * 5
      const end = (this.currentPage + 1) * 5
      const showArr = this.allData.slice(start, end).map((item, index) => {
        return {
          type: 'pie',
          radius: [this.titleFontSize * 2.2, this.titleFontSize * 3],
          center: centerArr[index],

          data: [
            {
              name: item.name + '\n' + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$eacharts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1]
                  }
                ])
              }
            },
            {
              value: item.stock,

              itemStyle: {
                color: '#333843'
              }
            }
          ],
          hoverAnimation: false,
          labelLine: {
            show: false
          },
          label: {
            position: 'center',
            show: true,
            color: colorArr[index][0],
            fontSize: this.titleFontSize / 2
          }
        }
      })
      const dataOption = {
        series: showArr
      }
      this.chartInstane.setOption(dataOption)
    },

    // @4
    // 屏幕字体适配调节
    screenAdapter() {
      // 标准字体大小
      this.titleFontSize = (this.$refs.stock_ref.offsetWidth / 100) * 3.6
      // const innerRadius = titleFontSize * 2
      // const outterRadius = innerRadius * 1.125
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
          // series: [
          //   {
          //     type: 'pie',
          //     radius: [outterRadius, innerRadius],
          //     label: {
          //       fontSize: titleFontSize / 2
          //     }
          //   },
          //   {
          //     type: 'pie',
          //     radius: [outterRadius, innerRadius],
          //     label: {
          //       fontSize: titleFontSize / 2
          //     }
          //   },
          //   {
          //     type: 'pie',
          //     radius: [outterRadius, innerRadius],
          //     label: {
          //       fontSize: titleFontSize / 2
          //     }
          //   },
          //   {
          //     type: 'pie',
          //     radius: [outterRadius, innerRadius],
          //
          //   },
          //   {
          //     type: 'pie',
          //     radius: [outterRadius, innerRadius],
          //     label: {
          //       fontSize: titleFontSize / 2
          //     }
          //   }
          // ]
        }
      }
      this.chartInstane.setOption(adapterOption)
      this.chartInstane.resize()
    },
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.allData.length / 5 - 1) {
          this.currentPage = 0
        }
        this.updateChart()
      }, 1500)
    }
  }
}
</script>

<style lang="less" scoped></style>
