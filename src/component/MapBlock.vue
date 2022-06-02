<template>
  <div class="map-wrapper">
    <div ref="mapBox" class="map"></div>
  </div>
</template>

<script>
// import bus from '@/assets/js/bus.js'

export default {
  inject: ['axios', 'echarts'],
  data() {
    return {
      myCharts: true,
      geoJson: {
        features: []
      },
      parentInfo: [{
        cityName: '四川省',
        code: 510000
      }],
      // 当前地图的行政区域码
      currentCityCode: '',
      //
      geoChinaJson: null
    }
  },
  created() {
    // bus.$on('toTargetCity', (data) => {
    //   this.chooseArea(data[0], data[1])
    // })
    this.axios({
      url: './json/mapjson/china.json'
    }).then(res => {
      this.geoChinaJson = res.data
    })
    this.$emit('navigatorMapCity', this.parentInfo)
    this.getGeoJson(this.parentInfo[0].code)
  },
  methods: {
    // 请求GeoJson数据
    getGeoJson(adcode) {
      this.axios({
        url: './json/mapjson/' + adcode + '.json'
      }).then(res => {
        this.geoJson = res.data
        this.getMapData(this.geoJson)
      })
    },
    // 定义数据
    getMapData() {
      let mapData = this.geoJson.features.map(item => {
        return {
          name: item.properties.name,
          value: Math.random() * 10000,
          cityCode: item.properties.adcode,
          center: item.properties.center
        }
      })
      mapData = mapData.sort(function (a, b) {
        return b.value - a.value
      })
      this.initEcharts(mapData)
    },
    // 初始化地图
    initEcharts(mapData) {
      this.myChart = this.echarts.init(this.$refs.mapBox)

      this.echarts.registerMap('ChinaMap', this.geoChinaJson) // 注册
      this.echarts.registerMap('regionMap', this.geoJson) // 注册

      const option = {
        tooltip: {
          trigger: 'item',
          padding: 0,
          formatter: params => {
            const data = params.data
            let tipsContent = ''
            if (data) {
              const fontStyle = `color:#303133;font-weight:600;font-size:12px;text-align:center;`
              const arrowBg = require('@/assets/images/map/arrow.svg')
              const bgColor = `background: linear-gradient(180deg, #D5EFE2 0%, #FFFFFF 100%);`
              tipsContent = `
                <div style="position:relative;padding:8px;${bgColor}">
                     <div style="position:absolute;
                                 bottom:-9px;
                                 width:20px;
                                 height:10px;
                                 left:calc(50% - 10px);
                                 background:url(${arrowBg});
                                 background-size:100% 100%">
                     </div>
                     <div style="${fontStyle}border-bottom:1px solid rgba(0,0,0,0.1);">${data.name}</div>
                     <div style="${fontStyle}height: 56px;line-height:26px;border-radius: 4px;">
                      <p>流入：<span style='color:#1FB8AC;'>${data.value}亩</span></p>
                      <p>流出：<span style='color:#FC7424;'>${data.value}亩</span></p>
                     </div>
                </div>
              `
            }
            return tipsContent
          },
          position(point, params, dom, rect, size) {
            const contentSize = size.contentSize
            return [point[0] - contentSize[0] / 2, point[1] - contentSize[1]]
          }
        },
        geo: {
          map: 'ChinaMap',
          zoom: 6,
          z: 0,
          tooltip: {
            show: false
          },
          itemStyle: {
            normal: {
              color: '#fff',
              areaColor: "#F5F4EE",
              borderColor: "#C0C2C2",
            },
            emphasis: {
              areaColor: "#F5F4EE",
              borderColor: "#C0C2C2"
            },
          },
        },
        visualMap: {
          type: 'piecewise',
          text: ['图例（亩)'],
          align: "left",
          left: '80%',
          bottom: '10%',
          show: true,
          showLabel: true,
          padding: [16, 30],
          itemHeight: 14,
          itemWidth: 14,
          itemGap: 16,
          borderWidth: 1,
          borderColor: '#DCDFE6',
          backgroundColor: 'rgba(255,255,255,1)',
          pieces: [
            { min: 5000, label: '>5000', color: '#32865C' },
            { min: 4000, max: 5000, label: '4000~5000', color: '#499E74' },
            { min: 3000, max: 4000, label: '3000~4000', color: '#98CEB7' },
            { min: 2000, max: 3000, label: '2000~3000', color: '#C8E9D9' },
            { min: 0, max: 2000, label: '0~1000', color: '#EEFAF4' }
          ],
          textStyle: {
            fontSize: 14,
            textBorderWidth: 1
          }
        },
        series: [
          // {
          //   name: '地图',
          //   type: 'map',
          //   map: 'regionMap',
          //   roam: true, // 是否可缩放
          //   zoom: 1, // 缩放比例
          //   z: 2,
          //   data: mapData,
          //   label: {
          //     normal: {
          //       show: true,
          //       color: 'rgb(249, 249, 249)', // 省份标签字体颜色
          //       formatter: p => {
          //         return p.name
          //       }
          //     },
          //     emphasis: {
          //       show: true,
          //       color: '#000'
          //     }
          //   },
          //   itemStyle: {
          //     normal: {
          //       borderColor: '#256E49',
          //       borderWidth: 2,
          //     },
          //     emphasis: {
          //       areaColor: '#3DA667',
          //       borderColor: '#fff',
          //       borderWidth: 2,
          //       shadowOffsetX: 4,
          //       shadowOffsetY: 4,
          //       shadowBlur: 4,
          //       shadowColor: 'rgba(0, 0, 0, 0.2)'
          //     }
          //   }
          // }
        ]
      }
      this.myChart.setOption(option, true)

      // 配置柱状图
      const _this = this
      function renderBarChart() {
        const areaOption = {
          xAxis: [],
          yAxis: [],
          tooltip: {
            trigger: 'axis'
          },
          grid: [],
          series: []
        };

        // 遍历区域数据，并铺设柱状图
        mapData.forEach((item, index) => {
          // 获取坐标
          const geoCoord = item.center
          // 将geo坐标值转换成像素坐标值
          const coord = _this.myChart.convertToPixel('geo', geoCoord)

          // x轴
          areaOption.xAxis.push({
            id: index,
            gridIndex: index, // x轴所在的grid的索引
            type: 'category', // 坐标轴类型
            name: item.name, // 坐标轴名称
            nameLocation: 'middle', // 坐标轴名称显示位置
            nameGap: 3, // 坐标轴名称与轴线之间的距离
            splitLine: { // 坐标轴在 grid 区域中的分隔线
              show: false
            },
            axisTick: { // 坐标轴刻度
              show: false
            },
            axisLabel: { // 坐标轴刻度标签
              show: false
            },
            axisLine: { // 坐标轴轴线
              onZero: false,
              lineStyle: {
                color: '#666'
              }
            },
            data: ["数据A", "数据B"], // 类目数据
            z: 100
          })

          // Y轴配置
          areaOption.yAxis.push({
            id: index, // 组件id，在配置中引用标识
            gridIndex: index, // x轴所在的grid的索引
            splitLine: { // 坐标轴在 grid 区域中的分隔线
              show: false
            },
            axisTick: { // 坐标轴刻度
              show: false
            },
            axisLabel: { // 坐标轴刻度标签
              show: false
            },
            axisLine: { // 坐标轴轴线
              show: false,
              lineStyle: {
                color: '#1C70B6'
              }
            },
            z: 100
          });

          // 坐标系配置
          areaOption.grid.push({
            id: index, // 组件id，在配置中引用标识
            width: 30, // 组件的宽度
            height: 40, // 组件的高度
            left: coord[0], // 离容器左侧的距离
            top: coord[1], // 离容器上侧的距离
            z: 100
          });

          // 图标系列配置
          areaOption.series.push({
            id: index, // 组件id，在配置中引用标识
            type: 'bar', // 柱状图
            xAxisId: index, // 使用的x轴的id
            yAxisId: index, // 使用的y轴的id
            barGap: 0, // 柱间距离
            barCategoryGap: 0, // 同一系列的柱间距离
            data: [30, 50], // 柱子数据
            z: 100,
            itemStyle: { // 柱子样式
              normal: {
                color: ['#F75D5D', '#59ED4F']
              }
            }
          });
        })

        _this.myChart.setOption(areaOption);
      }

      renderBarChart()

      this.myChart.off('click')
      this.myChart.on('click', this.echartsMapClick)
    },
    // 点击下钻
    echartsMapClick(params) {
      if (!params.data || this.parentInfo[this.parentInfo.length - 1].code == params.data.cityCode) {
        return
      }

      const data = params.data
      this.parentInfo.push({
        cityName: data.name,
        code: data.cityCode
      })
      this.$emit('navigatorMapCity', this.parentInfo)

      // 将当前的行政区域码传递给父组件
      this.currentCityCode = data.cityCode
      this.$emit('getCityCode', String(this.currentCityCode))

      // 重新加载地图
      this.getGeoJson(data.cityCode)
    },
    // 选择切换市县
    chooseArea(val, index) {
      if (this.parentInfo.length === index + 1) {
        return
      }
      this.parentInfo.splice(index + 1)

      this.$emit('navigatorMapCity', this.parentInfo)

      // 将当前的行政区域码传递给父组件
      this.currentCityCode = this.parentInfo[this.parentInfo.length - 1].code
      this.$emit('getCityCode', String(this.parentInfo[this.parentInfo.length - 1].code))
      // 重新加载地图
      this.getGeoJson(this.parentInfo[this.parentInfo.length - 1].code)
    }
  }
}
</script>

<style scoped lang='scss'>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;

  .map {
    width: 100%;
    height: 100%;
  }

  .back-btn {
    position: absolute;
    top: 50px;
    right: 50px;
    z-index: 999;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    background-color: rgba(56, 127, 209, 0.8);
    border-radius: 50%;
    cursor: pointer;
  }
}
</style>
