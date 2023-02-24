<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartInstane: null, // 服务器返回的数据
      allData: null,
      startValue: 0, // 图表数据起始值
      endValue: 9, // 图表数据显示结束值
      timerId: null
    }
  },
  created() {
    // 在组建创建完成之后，进行回调函数注册
    this.$socket.registerCallBack('rankData', this.getData)
    // 在组建销毁的时候 进行函数的取消
  },

  mounted() {
    this.initChart()
    // this.getData()
    // 发送数据给服务器，告诉服务器我现在需要数据了
    this.$socket.send({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
    this.startInterval()
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timerId)
    this.$socket.unRegisterCallBack('rankData')
  },

  methods: {
    // @1
    // 初始化eachers实例对象
    initChart() {
      this.chartInstane = this.$eacharts.init(this.$refs.rank_ref, 'chalk')
      const initOption = {
        title: {
          text: '|  地区销售排行',
          left: 20,
          top: 20
        },
        grid: {
          top: '40%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true
        },
        tooltip: {},
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar'
          }
        ]
      }
      this.chartInstane.setOption(initOption)
      this.chartInstane.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstane.on('mouseout', () => {
        this.startInterval()
      })
    },

    // @2
    // 获取服务器的数据，对alldata赋值后，调用updateChart更新图标
    getData(ret) {
      // const { data: ret } = await this.$http.get('rank')
      this.allData = ret.sort((a, b) => {
        return b.value - a.value
      })
      this.updateChart()
    },

    // @3
    // 把数据渲染到图表中
    updateChart() {
      // 处理需要的数据
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]

      // @3.1 省份数组
      const provinceArr = this.allData.map((item) => {
        return item.name
      })

      // @3.2 销量数组
      const valueArr = this.allData.map((item) => {
        return item.value
      })
      const dataOption = {
        xAxis: {
          data: provinceArr
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              color: (arg) => {
                let jbcArr = null
                if (arg.value > 300) {
                  jbcArr = colorArr[0]
                } else if (arg.value > 200) {
                  jbcArr = colorArr[1]
                } else {
                  jbcArr = colorArr[2]
                }
                return new this.$eacharts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: jbcArr[0] },
                  { offset: 1, color: jbcArr[1] }
                ])
              }
            }
          }
        ],
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        }
      }
      this.chartInstane.setOption(dataOption)
    },

    // @4
    // 屏幕字体适配调节
    screenAdapter() {
      const titleFontSize = (this.$refs.rank_ref.offsetWidth / 100) * 3.6
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
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
            }
          }
        ]
      }
      this.chartInstane.setOption(adapterOption)
      this.chartInstane.resize()
    },
    startInterval() {
      this.timerId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 1000)
    }
  }
}
</script>

<style lang="less" scoped></style>
