<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ 'ð| ' + showTm }}</span>
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
      allData: null, // æå¡å¨è·åçæ°æ® å æ²¹ï¼åªåï¼èªå·±æ¹åèªå·±å½è¿
      showSan: false, // æ¾ç¤ºä¸éè
      mapData: 'map',
      titleFontSize: 0
    }
  },
  created() {
    // å¨ç»å»ºåå»ºå®æä¹åï¼è¿è¡åè°å½æ°æ³¨å
    this.$socket.registerCallBack('trendData', this.getData)
  },

  mounted() {
    this.initChart()
    // this.getData()
    // åéæ°æ®ç»æå¡å¨ï¼åè¯æå¡å¨æç°å¨éè¦æ°æ®äº
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
    // å¯¹äºä»¶åæ¶çå¬
    window.removeEventListener('resize', this.screenAdapter)
    // å¨ç»å»ºéæ¯çæ¶å è¿è¡å½æ°çåæ¶
    this.$socket.unRegisterCallBack('trendData')
  },
  computed: {
    // è·åå¾è¡¨ç±»å å¯éæ¡ç®
    selectType() {
      if (!this.allData) {
        return []
      } else {
        return this.allData.type.filter((item) => {
          return item.key !== this.mapData
        })
      }
    },
    // æ¾ç¤ºçæ¡ç®
    showTm() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.mapData].title
      }
    },
    // å­ä½å¤§å°
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px'
      }
    },
    // zuoè¾¹è·
    marginStyle() {
      return {
        marginLeft: this.titleFontSize * 2 + 'px'
      }
    }
  },

  methods: {
    // ç¹å»äºä»¶ æ¾ç¤ºä¸è±èå°å¾éé¡¹æé®
    showChoose() {
      this.showSan = !this.showSan
    },
    // åå§åeacherså®ä¾å¯¹è±¡
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
    // ä»æå¡å¨è·åæ°æ®
    getData(ret) {
      // await this.$http.get()
      // const { data: ret } = await this.$http.get('trend')
      console.log(ret)
      // å¯¹allDataè¿è¡èµå¼
      this.allData = ret
      this.updateChart()
    },

    updateChart() {
      // åéæçé¢è²å¼
      const colorArr1 = ['rgba(11, 168, 44, 0.5)', 'rgba(44, 110, 255, 0.5)', 'rgba(22, 242, 217, 0.5)', 'rgba(254, 33, 30, 0.5)', 'rgba(250, 105, 0, 0.5)']
      // å¨éæçé¢è²å¼
      const colorArr2 = ['rgba(11, 168, 44, 0)', 'rgba(44, 110, 255, 0)', 'rgba(22, 242, 217, 0)', 'rgba(254, 33, 30, 0)', 'rgba(250, 105, 0, 0)']
      // å¤çæ°æ®
      // ç±»ç®è½´æ°æ®
      const timerArr = this.allData.common.month
      // xè½´seriesä¸çæ°æ®
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
      // å¾ä¾æ°æ®
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

    // çªå£èªéåº
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
    // ç¹å»æ¢å¾è¡¨
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
