<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import { DeviceUserCounts } from "@/api/system/user"

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null,
      cityList: ['设备1', '设备2', '设备3'],
      dataList: [
              { value: 0, name: '设备1' },
              { value: 0, name: '设备2' },
              { value: 0, name: '设备3' }
            ]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getDeviceUserCounts()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    async getDeviceUserCounts() {
      this.loading = true;
      try {
        const response = await DeviceUserCounts();
        this.cityList = response.rows.map(item => item.name);
        this.dataList = response.rows;
        this.initChart()
      } catch (error) {
        console.error('获取地区人数错误:', error);
      } finally {
        this.loading = false;
      }
    },
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: this.cityList
        },
        series: [
          {
            name: '网站使用设备人数',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            data: this.dataList,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
