<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ '👅| ' + showTm }}</span>
      <span class="iconfont title-icon" @click="showChoose" :style="comStyle">&#xe6eb;</span>
      <div class="select-con" v-show="showSan" :style="marginStyle">
        <div class="select-item" v-for="item in selectType" :key="item.key" @click="showMap(item.key)">{{ item.text }}</div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartInstane: null,
      allData: null, // 服务器获取的数据 加油，努力，自己改变自己命运
      showSan: false, // 显示与隐藏
      mapData: 'map',
      titleFontSize: 0
    }
  },
  created() {
    // 在组建创建完成之后，进行回调函数注册
    this.$socket.registerCallBack('trendData', this.getData)
  },

  mounted() {
    this.initChart()
    // this.getData()
    // 发送数据给服务器，告诉服务器我现在需要数据了
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },

  destroyed() {
    // 对事件取消监听
    window.removeEventListener('resize', this.screenAdapter)
    // 在组建销毁的时候 进行函数的取消
    this.$socket.unRegisterCallBack('trendData')
  },
  computed: {
    // 获取图表类型 可选条目
    selectType() {
      if (!this.allData) {
        return []
      } else {
        return this.allData.type.filter((item) => {
          return item.key !== this.mapData
        })
      }
    },
    // 显示的条目
    showTm() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.mapData].title
      }
    },
    // 字体大小
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    },
    // zuo边距
    marginStyle() {
      return {
        marginLeft: this.titleFontSize * 2 + 'px'
      }
    }
  },

  methods: {
    // 点击事件 显示与英藏地图选项按钮
    showChoose() {
      this.showSan = !this.showSan
    },
    // 初始化eachers实例对象
    initChart() {
      this.chartInstane = this.$eacharts.init(this.$refs.trend_ref, 'chalk')
      const initOption = {
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        },
        grid: {
          left: '3%',
          top: '35%',
          right: '4%',
          bottom: '1%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle'
        }
      }
      this.chartInstane.setOption(initOption)
    },
    // 从服务器获取数据
    getData(ret) {
      // await this.$http.get()
      // const { data: ret } = await this.$http.get('trend')
      console.log(ret)
      // 对allData进行赋值
      this.allData = ret
      this.updateChart()
    },

    updateChart() {
      // 半透明的颜色值
      const colorArr1 = ['rgba(11, 168, 44, 0.5)', 'rgba(44, 110, 255, 0.5)', 'rgba(22, 242, 217, 0.5)', 'rgba(254, 33, 30, 0.5)', 'rgba(250, 105, 0, 0.5)']
      // 全透明的颜色值
      const colorArr2 = ['rgba(11, 168, 44, 0)', 'rgba(44, 110, 255, 0)', 'rgba(22, 242, 217, 0)', 'rgba(254, 33, 30, 0)', 'rgba(250, 105, 0, 0)']
      // 处理数据
      // 类目轴数据
      const timerArr = this.allData.common.month
      // x轴series上的数据
      const valueArr = this.allData[this.mapData].data
      const seriesArr = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: this.mapData,
          areaStyle: {
            // new this.$eacharts.graphic.LinearGradient
            color: new this.$eacharts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorArr1[index] },
              {
                offset: 1,
                color: colorArr2[index]
              }
            ])
          }
        }
      })
      // 图例数据
      const legendArr = valueArr.map((item) => {
        return item.name
      })
      const dataOption = {
        xAxis: {
          data: timerArr
        },
        series: seriesArr,
        legend: {
          data: legendArr
        }
      }
      this.chartInstane.setOption(dataOption)
    },

    // 窗口自适应
    screenAdapter() {
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      }
      this.chartInstane.setOption(adapterOption)
      this.chartInstane.resize()
    },
    // 点击换图表
    showMap(key) {
      this.mapData = key
      this.updateChart()
      this.showSan = !this.showSan
    }
  }
}
</script>

<style lang="less" scoped>
.title {
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  z-index: 66;
  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }
  .select-con {
    background-color: #222733;
  }
}
</style>
