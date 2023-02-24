<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toleft" :style="comStyle">&#xe6eb;</span>
    <span class="iconfont arr-right" @click="toright" :style="comStyle">&#xe6ee;</span>
    <div class="toggerbtn" :style="comStyle">{{ compag }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartInstane: null, // 服务器返回的数据
      allData: null,
      currentIndex: 0,
      titleFontSize: 0
    }
  },
  created() {
    // 在组建创建完成之后，进行回调函数注册
    this.$socket.registerCallBack('hotproductData', this.getData)
  },

  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'hotproductData',
      chartName: 'hotproduct',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('hotproductData')
  },
  computed: {
    compag() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    }
  },

  methods: {
    // @1
    // 初始化eachers实例对象
    initChart() {
      this.chartInstane = this.$eacharts.init(this.$refs.hot_ref, 'chalk')
      const initOption = {
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true
              },
              labelLine: {
                show: false
              }
            }
          }
        ],
        legend: {
          top: '15%',
          icon: 'circle'
        },
        title: {
          text: '|  热销商品金额占比图',
          top: 20,
          left: 20
        },
        tooltip: {
          formatter: (arg) => {
            // console.log(arg)
            const three = arg.data.children
            let total = 0

            three.forEach((item) => {
              total += item.value
            })
            let str = ''
            three.forEach((item) => {
              str += `
              ${item.name}: ${parseInt((item.value / total) * 100)} %
              </br>
              `
            })

            return str
          }
        }
      }
      this.chartInstane.setOption(initOption)
    },

    // @2
    // 获取服务器的数据，对alldata赋值后，调用updateChart更新图标
    getData(ret) {
      // this.$http.get('map)
      // const { data: ret } = await this.$http.get('hotproduct')
      this.allData = ret
      console.log(this.allData)
      this.updateChart()
    },

    // @3
    // 把数据渲染到图表中
    updateChart() {
      // 处理需要的数据
      const twoArr = this.allData[this.currentIndex].children.map((item) => {
        return {
          name: item.name,
          value: item.value,
          children: item.children
        }
      })
      const legendArr = twoArr.map((item) => {
        return item.name
      })

      const dataOption = {
        legend: {
          data: legendArr
        },
        series: [
          {
            data: twoArr
          }
        ]
      }
      this.chartInstane.setOption(dataOption)
    },

    // @4
    // 屏幕字体适配调节
    screenAdapter() {
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.4,
            center: ['50%', '60%']
          }
        ],
        legend: {
          itemWidth: this.titleFontSize / 2,
          itemHeight: this.titleFontSize / 2,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      }
      this.chartInstane.setOption(adapterOption)
      this.chartInstane.resize()
    },
    toleft() {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    toright() {
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0
      }
      this.updateChart()
    }
  }
}
</script>

<style lang="less" scoped>
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  cursor: pointer;
  color: white;
}
.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  cursor: pointer;
  color: white;
}
.toggerbtn {
  position: absolute;
  top: 90%;
  right: 10%;
  color: white;
}
</style>
