<template>
  <div class="resume-container">
    <el-row :gutter="24">
      <!-- 左侧主体内容 -->
      <el-col :xs="24" :sm="24" :lg="16">
        <!-- 个人信息头栏 -->
        <div class="header-card">
          <div class="header-content">
            <div class="basic-info">
              <h1>{{ personalInfo.name }}</h1>
              <p class="position">{{ personalInfo.position }}</p>
              <div class="info-tags">
                <el-tag type="info">{{ personalInfo.age }}岁</el-tag>
                <el-tag type="info">{{ personalInfo.major }}</el-tag>
                <el-tag type="info">{{ personalInfo.degree }}</el-tag>
              </div>
            </div>
            <el-avatar :src="avatarUrl" fit="fill" class="header-avatar"></el-avatar>
          </div>
          <div class="contact-bar">
            <div v-for="(item, index) in contacts" :key="index" class="contact-item">
              <i :class="item.icon"></i>
              <span v-if="item.icon !== 'el-icon-link'">{{ item.value }}</span>
              <a v-else :href="item.value" target="_blank">github.com/videoqwg</a>
            </div>
          </div>
        </div>

        <!-- 教育背景 -->
        <el-card class="section-card">
          <div class="section-header">
            <i class="el-icon-school"></i>
            <h3>教育背景</h3>
          </div>
          <el-timeline>
            <el-timeline-item v-for="(edu, index) in education" :key="index" :timestamp="edu.time" placement="top"
              type="primary" color="#409EFF">
              <div class="edu-card">
                <h4>{{ edu.school }}</h4>
                <p class="major-tag">{{ edu.major }}</p>
                <div class="edu-detail">
                  <el-tag effect="plain" size="mini">GPA {{ edu.gpa }}</el-tag>
                  <el-tag effect="plain" size="mini" type="success">{{ edu.degree }}</el-tag>
                </div>
                <p class="edu-desc">{{ edu.description }}</p>

                <div>
                  <p class="edu-desc responsibility">荣获奖项：</p>
                  <ul>
                    <li v-for="(item, rIndex) in edu.prizes" :key="rIndex">{{ item }}</li>
                  </ul>
                </div>

              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 实习经历 -->
        <el-card class="section-card">
          <div class="section-header">
            <i class="el-icon-tickets"></i>
            <h3>实习经历</h3>
          </div>
          <div v-for="(internship, index) in internships" :key="index" class="project-card">
            <div class="project-header">
              <div class="project-title">
                <span class="project-time">{{ internship.time }}</span>
                <h4>{{ internship.name }}</h4>
                <el-tag type="warning">{{ internship.role }}</el-tag>
              </div>
            </div>
            <div class="project-content">
              <div class="responsibility">
                <h5>主要职责：</h5>
                <ul>
                  <li v-for="(item, rIndex) in internship.responsibilities" :key="rIndex">{{ item }}</li>
                </ul>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 项目经历 -->
        <el-card class="section-card">
          <div class="section-header">
            <i class="el-icon-data-line"></i>
            <h3>项目经历</h3>
          </div>
          <div v-for="(project, index) in projects" :key="index" class="project-card">
            <div class="project-header">
              <div class="project-title">
                <span class="project-time">{{ project.time }}</span>
                <h4>{{ project.name }}</h4>
              </div>
              <div class="tech-tags">
                <el-tag v-for="(tech, tIndex) in project.techStack" :key="tIndex" size="mini" effect="plain">
                  {{ tech }}
                </el-tag>
              </div>
            </div>
            <div class="project-content">
              <p class="project-desc">{{ project.description }}</p>
            </div>
          </div>
        </el-card>

        <!-- 技术栈 -->
        <el-card class="section-card">
          <div class="section-header">
            <i class="el-icon-cpu"></i>
            <h3>技术能力</h3>
          </div>
          <div class="skill-cloud">
            <el-tag v-for="(skill, index) in skills" :key="index" :type="skill.type" effect="plain">
              {{ skill.name }}
            </el-tag>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧边栏 -->
      <el-col :xs="24" :sm="24" :lg="8">
        <!-- 个人信息卡片 -->
        <el-card class="side-card profile-card">
          <div class="profile-header">
            <el-avatar :size="120" :src="avatarUrl"></el-avatar>
            <h2>{{ personalInfo.name }}</h2>
            <p class="position">{{ personalInfo.position }}</p>
          </div>

          <!-- 联系信息 -->
          <div class="info-block">
            <div class="info-item" v-for="(item, index) in contacts" :key="index">
              <i :class="item.icon"></i>
              <span v-if="item.icon !== 'el-icon-link'">{{ item.value }}</span>
              <a v-else :href="item.value" target="_blank">github.com/videoqwg</a>
            </div>
          </div>

          <!-- 技能雷达图 -->
          <div class="radar-chart">
            <raddar-chart />
          </div>

          <!-- 兴趣爱好 -->
          <div class="hobby-section">
            <h4>兴趣爱好</h4>
            <div class="hobby-grid">
              <div v-for="(hobby, index) in hobbies" :key="index" class="hobby-item">
                <i :class="hobby.icon"></i>
                <span>{{ hobby.name }}</span>
              </div>
            </div>
          </div>

          <!-- 新增二维码区域 -->
          <div class="qr-code-section" style="margin-top: 20px;">
            <h4>联系方式</h4>
            <div class="qr-code-container" style="display: flex; gap: 15px; margin-top: 15px;">
              <div class="qr-code-item" v-for="(qr, index) in qrCodes" :key="index">
                <img :src="qr.url" alt="二维码" style="width: 100%; max-width: 150px; border-radius: 8px;">
                <p style="text-align: center; margin-top: 8px; color: #666; font-size: 12px;">
                  {{ qr.title }}
                </p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>

import RaddarChart from './components/RaddarChart'
export default {
  components: { RaddarChart },
  data() {
    return {
      avatarUrl: require("@/assets/resume/hw.jpg"),
      fit: 'cover',
      personalInfo: {
        name: '黄威',
        position: '江西农业大学',
        age: 22,
        major: '数据科学与大数据技术',
        degree: '应届毕业生'
      },
      contacts: [
        { icon: 'el-icon-mobile-phone', value: '18770701003' },
        { icon: 'el-icon-message', value: '3080926500@qq.com' },
        { icon: 'el-icon-location-outline', value: '江西 · 赣州' },
        { icon: 'el-icon-link', value: 'https://github.com/videoqwg' }
      ],
      education: [
        {
          time: '2020/09-2024/06',
          school: '江西农业大学',
          major: '数据科学与大数据技术',
          degree: '本科学位',
          gpa: 3.3,
          description: '主修数据结构、数据库原理、java、python、数值分析',
          prizes: ['蓝桥杯省级三等奖', '大学生信息技术竞赛省级二等奖', '大学英语六级', '外教杯院级三等奖',
            '2021至2022第一学期专业三等奖学金', '2021至2022第二学期专业三等奖学金', '2022至2023第一学期专业二等奖学金',
            '2022至2023第二学期专业三等奖学金', '2023至2024第一学期国家励志奖学金']
        }
      ],
      internships: [
        {
          time: '2024/01-2024/03',
          name: '东莞市置胜隆机械设备有限公司',
          role: '实习生',
          responsibilities: [
            '负责计算机硬件的维护与升级，协助团队成员解决技术问题，以及完成上级安排的其他技术支持工作',
            '撰写内部稿件、会议记录及工作报告，以支持团队内部的沟通与信息共享',
            '负责收集、清洗和整理数据，确保数据质量，运用统计学方法和数据分析工具对数据进行分析'
          ]
        }
      ],
      projects: [
        {
          time: '2023/02 - 2023/03',
          name: '完全分布式数据库系统',
          techStack: ['ApacheHadoop', 'ZooKeeper', 'Linux', 'SSH', 'Mysql'],
          description: '该项目旨在搭建一个完全分布式的数据库系统， 以满足大规模数据存储和处理的需求。该系统采用分布式架构，允许数据在多个节点上进行存储和处理，以提高系统的可扩展性、容错性和性能。',
        },
        {
          time: '2024/03 - 2024/05',
          name: '基于springboot+vue2的高校考勤系统',
          techStack: ['Springboot', 'Mysql', 'Mongodb', 'Rabbitmq', 'Vue', 'Mybatis'],
          description: '该项目旨在搭建一个高校考勤系统，提供学生、教师和管理员三种角色的不同功能需求。系统采用Springboot+vue的前后端分离框架并配置了Rabbitmq，遵循MVC模式，前端使用vue2，后端通过远程连接MySQL数据库存储各类信息表，使用Mongodb数据库存储聊天信息。系统功能包括实时聊天、打卡管理、课程表展示以及智能助手等，旨在提高考勤管理的效率和互动体验。',
        }
      ],
      skills: [
        { name: 'Vue', level: 90, type: '' },
        { name: 'Springboot', level: 95, type: 'success' },
        { name: 'Mysql', level: 90, type: 'info' },
        { name: 'Redis', level: 75, type: 'warning' },
        { name: 'Rabbitmq', level: 85, type: 'danger' },
        { name: 'Git', level: 95, type: '' },
        { name: 'Docker', level: 90, type: 'success' },
      ],
      hobbies: [
        { name: '开源贡献', icon: 'el-icon-star-on' },
        { name: '技术写作', icon: 'el-icon-document' },
        { name: '摄影', icon: 'el-icon-camera' },
        { name: '徒步', icon: 'el-icon-place' }
      ],
      qrCodes: [
        {
          title: "微信好友",
          url: require("@/assets/resume/wechat.png")
        },
        {
          title: "QQ好友",
          url: require("@/assets/resume/qq.png")
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.resume-container {
  padding: 30px;
  background: #f8f9fa;
}

.header-card {
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  border-radius: 12px;
  padding: 30px;
  color: white;
  margin-bottom: 24px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .basic-info {
      h1 {
        font-size: 32px;
        margin: 0 0 8px 0;
      }

      .position {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 12px;
      }

      .info-tags .el-tag {
        margin-right: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }

    .header-avatar {
      border: 3px solid white;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      background: white;
    }

    @media (min-width: 768px) {
      .el-avatar {
        width: 100px;
        height: 100px;
      }
    }

    @media (max-width: 767px) {
      .el-avatar {
        width: 90px;
        height: 70px;
      }
    }
  }

  .contact-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;

    .contact-item {
      display: flex;
      align-items: center;

      i {
        margin-right: 8px;
        font-size: 18px;
      }
    }
  }
}

.section-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    i {
      font-size: 24px;
      color: #409EFF;
      margin-right: 12px;
    }

    h3 {
      margin: 0;
      color: #303133;
    }
  }
}

.edu-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;

  .major-tag {
    color: #409EFF;
    font-weight: 500;
    margin: 8px 0;
  }

  .edu-detail .el-tag {
    margin-right: 8px;
  }

  .edu-desc {
    color: #606266;
    line-height: 1.6;
    margin-top: 12px;
  }
}

.project-card {
  background: white;
  border-left: 3px solid #409EFF;
  padding: 16px;
  margin-bottom: 20px;

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .project-title {
      display: flex;
      align-items: center;
      gap: 12px;

      .project-time {
        color: #909399;
        font-size: 13px;
      }

      h4 {
        margin: 0;
        font-size: 16px;
      }
    }
  }

  .project-desc {
    color: #606266;
    line-height: 1.6;
  }

  .responsibility {
    margin-top: 12px;

    h5 {
      color: #409EFF;
      margin: 12px 0 8px 0;
    }

    ul {
      padding-left: 20px;
      color: #606266;

      li {
        margin-bottom: 6px;
        line-height: 1.5;
      }
    }
  }
}

.skill-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px;

  .skill-item {
    background: #409EFF;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }
}

// 右侧边栏样式
.side-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  &.profile-card {
    .profile-header {
      text-align: center;
      padding: 20px 0;

      h2 {
        margin: 16px 0 8px 0;
        color: #303133;
      }

      .position {
        color: #909399;
        font-size: 16px;
      }
    }

    .info-block {
      .info-item {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        margin: 8px 0;
        background: #f8fafc;
        border-radius: 8px;

        i {
          font-size: 18px;
          color: #409EFF;
          margin-right: 12px;
        }
      }
    }

    .hobby-section {
      margin-top: 24px;

      h4 {
        color: #303133;
        margin-bottom: 16px;
      }

      .hobby-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;

        .hobby-item {
          display: flex;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;

          i {
            color: #409EFF;
            margin-right: 8px;
            font-size: 18px;
          }
        }
      }
    }
  }
}

.radar-chart {
  height: 300px;
  margin: 20px 0;
}

.qr-code-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.qr-code-item {
  flex: 1;
  text-align: center;
}

.qr-code-item img {
  border: 1px solid #eee;
  padding: 5px;
  background: white;
}
</style>