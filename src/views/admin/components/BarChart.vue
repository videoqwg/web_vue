<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import { TopRegion } from "@/api/system/user"

const animationDuration = 6000

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
      cityList: ['地区1', '地区2', '地区3', '地区4', '地区5'],
      dataList: [0,0,0,0,0]
    
      
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getTopRegion()
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
    async getTopRegion() {
      this.loading = true;
      try {
        const response = await TopRegion();
        this.cityList = response.rows.map(item => item.name);
        this.dataList = response.rows.map(item => item.value);
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
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          top: 10,
          left: '2%',
          right: '2%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: this.cityList,
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          type: 'value',
          axisTick: {
            show: false
          }
        }],
        series: [{
          name: '用户量',
          type: 'bar',
          stack: 'vistors',
          barWidth: '60%',
          data: this.dataList,
          animationDuration
        }]
      })
    },
  }
}
</script>
