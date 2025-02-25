<template>
  <div class="notice-container border-b-[1px] border-solid border-[#f0f0f0] dark:border-[#303030]">
    <el-avatar
      v-if="noticeItem.avatar"
      :size="30"
      :src="noticeItem.avatar"
      class="notice-container-avatar"
    />
    <div class="notice-container-text">
      <div class="notice-text-title text-[#000000d9] dark:text-white">
        <el-tooltip
          popper-class="notice-title-popper"
          :effect="tooltipEffect"
          :disabled="!titleTooltip"
          :content="noticeItem.title"
          placement="top-start"
          :enterable="!isMobile"
        >
          <div ref="titleRef" class="notice-title-content" @mouseover="hoverTitle">
            {{ noticeItem.title }}
          </div>
        </el-tooltip>
        <el-tag
          v-if="noticeItem && noticeItem.extra"
          :type="noticeItem && noticeItem.status ? noticeItem.status : ''"
          size="small"
          class="notice-title-extra"
        >
          {{ noticeItem && noticeItem.extra ? noticeItem.extra : '' }}
        </el-tag>

      </div>

      <el-tooltip
        popper-class="notice-title-popper"
        :effect="tooltipEffect"
        :disabled="!descriptionTooltip"
        :content="noticeItem.description"
        placement="top-start"
      >
        <div
          ref="descriptionRef"
          class="notice-text-description"
          @mouseover="hoverDescription($event, noticeItem.description)"
        >
          {{ noticeItem.description }}
        </div>
      </el-tooltip>
      <div class="notice-text-datetime text-[#00000073] dark:text-white">
        {{ noticeItem.datetime }}
      </div>
    </div>
  </div>
</template>

<script>
// import { deviceDetection } from '@pureadmin/utils'
// import { useNav } from '@/layout/hooks/useNav'

export default {
  name: 'NoticeItem',
  props: {
    noticeItem: {
      type: Object,
      default: () => ({
        avatar: '',
        title: '',
        description: '',
        datetime: '',
        extra: '',
        status: ''
      })
    }
  },
  data() {
    return {
      isMobile: false,
      titleTooltip: false,
      descriptionTooltip: false
    }
  },
  computed: {
    tooltipEffect() {
      return 'light'
    }
  },
  methods: {
    hoverTitle() {
      this.$nextTick(() => {
        const titleRef = this.$refs.titleRef
        if (titleRef && titleRef.scrollWidth > titleRef.clientWidth) {
          this.titleTooltip = true
        } else {
          this.titleTooltip = false
        }
      })
    },
    hoverDescription(event, description) {
      const tempTag = document.createElement('span')
      tempTag.innerText = description
      tempTag.className = 'getDescriptionWidth'
      document.body.appendChild(tempTag)
      const currentWidth = tempTag.offsetWidth
      document.body.removeChild(tempTag)

      const cellWidth = event.target.offsetWidth
      this.descriptionTooltip = currentWidth > 2 * cellWidth
    }
  }
}
</script>

<style scoped>
.notice-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 0;

  .notice-container-avatar {
    margin-right: 16px;
    background: #fff;
  }

  .notice-container-text {
    flex: 1;
    flex-direction: column;

    .notice-text-title {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 400;

      .notice-title-content {
        flex: 1;
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .notice-title-extra {
        margin-left: 8px;
      }
    }

    .notice-text-description {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .notice-text-datetime {
      margin-top: 4px;
    }
  }
}
</style>
