<template>
  <div class="dashboard-editor-container">
    <github-corner class="github-corner" />

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="this.lineChartData" />
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row>

    
  </div>
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import { DailyActiveUsers } from "@/api/monitor/logininfor"
import { CumulativeUserCount } from "@/api/system/user"

const DEFAULT_DATA_LENGTH = 7; // 提取常量

const generateDefaultData = (length) => Array.from({ length }, () => 0);

export default {
  name: 'DashboardAdmin',
  components: {
    GithubCorner,
    PanelGroup,
    LineChart,
    PieChart,
    BarChart,
  },
  data() {
    return {
      dailyActiveUsers: [],
      lineChartData: {
        actualData: generateDefaultData(DEFAULT_DATA_LENGTH),
      },
      lineChartDataList: {
        onlineVisitis: {
          actualData: generateDefaultData(DEFAULT_DATA_LENGTH),
        },
        messages: {
          actualData: generateDefaultData(DEFAULT_DATA_LENGTH),
        },
        totalVisitis: {
          actualData: generateDefaultData(DEFAULT_DATA_LENGTH),
        },
      },
      loading: false,
    };
  },
  created() {
    this.getDailyActiveUsers();
    this.getCumulativeUserCount();
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = this.lineChartDataList[type];
    },
    async getDailyActiveUsers() {
      this.loading = true;
      try {
        const response = await DailyActiveUsers();
        this.convertToDateList(response,"online");
      } catch (error) {
        console.error('获取每日在线用户人数错误:', error);
      } finally {
        this.loading = false;
      }
    },
    async getCumulativeUserCount() {
      this.loading = true;
      try {
        const response = await CumulativeUserCount();
        this.convertToDateList(response,"total");
      } catch (error) {
        console.error('获取累计用户人数错误:', error);
      } finally {
        this.loading = false;
      }
    },
    convertToDateList(data,type) {
      const today = new Date();
      const sevenDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - 6 + i);
        return date.toISOString().split("T")[0]; // 转换为 YYYY-MM-DD 格式
      });

      const dateUserMap = data.rows.reduce((map, item) => {
        map[item.date] = item.user_count;
        return map;
      }, {});

      if (type === "online"){
        this.lineChartDataList.onlineVisitis.actualData = sevenDays.map(
        (date) => dateUserMap[date] || 0
        );
        this.lineChartData = this.lineChartDataList.onlineVisitis
      }else if(type === "messages"){
        this.lineChartDataList.messages.actualData = sevenDays.map(
        (date) => dateUserMap[date] || 0
        );
      }else if(type === "total"){
        this.lineChartDataList.totalVisitis.actualData = sevenDays.map(
        (date) => dateUserMap[date] || 0
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
