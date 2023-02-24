<template>
  <div class="com-container" @dblclick="revermap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>

<script>
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils.js'
export default {
  data() {
    return {
      chartInstace: null, // 服务器返回的数据
      allData: null,
      mapData: {} // 缓存请求的省份地图
      // getAttribute: 1
    }
  },
  created() {
    // 在组建创建完成之后，进行回调函数注册
    this.$socket.registerCallBack('mapData', this.getData)
  },

  mounted() {
    this.initChart()
    // this.getData()
    // 发送数据给服务器，告诉服务器我现在需要数据了
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed() {
    // 对事件取消监听
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unRegisterCallBack('mapData')
  },

  methods: {
    // 初始化eachers实例对象
    async initChart() {
      // this.chartInstane = this.$eacharts.init(this.$refs.map_ref)
      this.chartInstace = this.$eacharts.init(this.$refs.map_ref, 'chalk')

      // 获取中国矢量地图 http://localhost:8999/static/map/china.json
      const ret = await axios.get('http://localhost:8999/static/map/china.json')
      this.$eacharts.registerMap('china', ret.data)
      // console.log(ret)
      const initOption = {
        // color: ['red', 'pink', 'yellow'],
        title: {
          text: '⭐|   商家分布图',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          top: '5%',
          bottom: '5%',
          map: 'china',
          label: {
            show: true
          },
          itemStyle: {
            areaColor: '#2E72BF',
            borderColor: '#333'
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.chartInstace.setOption(initOption)
      // 点击地图获取省份地图
      this.chartInstace.on('click', async (arg) => {
        const pingyingmap = getProvinceMapInfo(arg.name)
        if (!this.mapData[pingyingmap.key]) {
          const { data: sfmap } = await axios.get('http://localhost:8999' + pingyingmap.path)
          this.mapData[pingyingmap.key] = sfmap
          // console.log(sfmap)
          this.$eacharts.registerMap(pingyingmap.key, sfmap)
        }
        const sfoption = {
          geo: {
            map: pingyingmap.key
          }
        }

        this.chartInstace.setOption(sfoption)

        // console.log(pingyingmap)
      })
    },
    // 获取服务器的数据，对alldata赋值后，调用updateChart更新图标
    getData(ret) {
      // this.$http.get('map)
      // const { data: ret } = await this.$http.get('map')
      // console.log(ret)
      this.allData = ret
      this.updateChart()
    },

    // 把数据渲染到图表中
    updateChart() {
      // 处理需要的数据
      // 处理需要的图例数据
      const legendArr = this.allData.map((item) => {
        return {
          name: item.name
        }
      })
      // 地图中显示的散点数据
      const seriesArr = this.allData.map((item) => {
        return {
          type: 'effectScatter',
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo',
          rippleEffect: {
            scale: 7,
            brushType: 'stroke'
          }
        }
      })
      const dataOption = {
        series: seriesArr,
        legend: {
          data: legendArr
        }
      }
      this.chartInstace.setOption(dataOption)
    },

    // 屏幕字体适配调节
    screenAdapter() {
      const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 1.9,
          itemHeight: titleFontSize / 1.9,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2.1
          }
        }
      }
      this.chartInstace.setOption(adapterOption)
      this.chartInstace.resize()
    },
    revermap() {
      const rmapoption = {
        geo: {
          map: 'china'
        }
      }
      this.chartInstace.setOption(rmapoption)
    }
  }
}
</script>

<style lang="less" scoped></style>
