<template>
  <div class="week-time-range-picker" :style="setMaxWidth">
    <div class="wtrp-schedule" :style="scheduleStyle" v-show="isDrag"></div>
    <table class="wtrp-table" ref="table">
      <week-time-range-picker-thead :hasHalfHour="hasHalfHour" />
      <week-time-range-picker-tbody :hasHalfHour="hasHalfHour" :checkedDatas="cacheChecked" @drag="drag" @select="select" @moveout="moveout" />
      <div class="wtrp-byted-popover-wrapper">
        <transition name="transition-popover">
          <div class="ant-tooltip ant-tooltip-placement-top ant-tooltip-hidden" :style="popperStyle" v-if="isShowTip">
            <div class="ant-tooltip-content">
              <div class="ant-tooltip-arrow"></div>
              <div class="ant-tooltip-inner">{{currentTimeFormat}}</div>
            </div>
          </div>
        </transition>
      </div>
    </table>
  </div>
</template>

<script>
import weekTimeRangePickerThead from '@/components/weekTimeRangePickerThead.vue'
import weekTimeRangePickerTbody from '@/components/weekTimeRangePickerTbody.vue'

export default {
  name: 'vue-week-time-range-picker',
  components: {
    weekTimeRangePickerThead,
    weekTimeRangePickerTbody
  },
  props: {
    selectedData: {
      type: Array,
      default: () => []
    },
    hasHalfHour: { // 是否启用半小时
      type: Boolean,
      default: false
    }
  },
  watch: {
    selectedData (arr) {
      this.cacheChecked = arr
    }
  },
  data () {
    return {
      isDrag: false, // 判断是否处于拖拽状态
      isFocus: false, // 判断是否是由点击获取的焦点
      isMoveout: false, // 判断是否移出时间选择范围
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      startX: 0, // 记录起始点点击时e.clientX
      startY: 0, // 记录起始点点击时e.clientY
      startLayerX: 0, // 记录起始点对应td的左上角距table的x轴距离
      startLayerY: 0, // 记录起始点对应td的左上角距table的y轴距离
      leftX: 0, // 记录起始点点击时layerX - 该td左侧距table左侧的距离
      topY: 0, // 记录起始点点击时边界纵向偏差
      popperLeft: 0, // 记录提示框table左侧偏移值
      popperTop: 0, // 记录提示框相较于table底部偏移值
      currentVal: '', // 缓存当前td对应的星期和小时拼接后的字符串
      nextTime: '', // 缓存当前时间的下一时间，例如当前在 00:00位置，其下一时刻应该是00:30或者01:00(根据hasHalfHour确定)
      cacheChecked: [] // 缓存被选中的时间数据
    }
  },
  created () {
    this.cacheChecked = this.selectedData
  },
  mounted () {
    document.body.addEventListener('mouseup', this.handleMouseup)
    document.body.addEventListener('mousemove', this.handleMousemove)
  },
  computed: {
    setMaxWidth () {
      return this.hasHalfHour ? 'max-width: 830px;' : 'max-width: 450px;'
    },
    /**
     * @desc 框选范围样式
     */
    scheduleStyle () {
      return `left: ${this.left}px; top: ${this.top}px; width: ${this.width}px; height: ${this.height}px;`
    },
    /**
     * @desc 确定提示框位置
     */
    popperStyle () {
      return `transform: translate3d(${this.popperLeft}px, ${this.popperTop}px, 0)`
    },
    /**
     * @desc 提示框内容格式处理
     */
    currentTimeFormat () {
      return `${this.currentVal}~${this.nextTime}`
    },
    /**
     * @desc 控制提示框显隐
     */
    isShowTip () {
      return this.isFocus && !this.isMoveout
    }
  },
  methods: {
    /**
     * @desc 控制拖拽框样式。
     *       left和top主要根据e.clientX和e.clientY来获得，其中有边界问题，需要进行计算优化
     *       height和width必须是每个td高度/宽度的整数倍，这样可使拖拽框恰好覆盖每个td
     *       每个 td 宽 16，高 20。不能变动，不然有bug!
     *       如果向起始点左侧框选，则this.left = 起始点left - 起始点所在td的clientX + 16
     *       如果向起始点上方框选，则this.top = 起始点top - 起始点所在td的clientY + 20
     *       非点击仅仅是移动到时间范围时显示时间提示框
     */
    drag (type, clientX, clientY, layerX, layerY, iden, hour, value, isDrag) {
      if (type === 'up') {
        this.isDrag = false
        this.isFocus = false
        return
      }
      let left, top, width, height
      const factor = this.hasHalfHour ? 2 : 1 // 根据是否有半小时来确定td偏移的倍数
      // 将起始点所在td对应的时间，例如'10:00'转换成['10', '00']格式
      const hourMinuteArr = hour.split(':')
      // 确定起始点所在td对应该行第几个td，用来确定 起始点所在td的clientX和clientY
      const tdIndex = ~~hourMinuteArr[1] ? hourMinuteArr[0] * factor + 1 : hourMinuteArr[0] * factor
      if (type === 'down') {
        this.height = this.width = 0
        this.startX = clientX
        this.startY = clientY
        this.leftX = layerX - tdIndex * 16 - 60
        this.topY = layerY - iden * 20 - 40
        this.startLayerX = tdIndex * 16 + 60
        this.startLayerY = iden * 20 + 40
        this.left = this.startX - this.leftX
        this.top = this.startY - this.topY
        this.isFocus = false
        this.isDrag = true
      }
      if (type === 'move') {
        if (isDrag) {
          let diffX = layerX - this.startLayerX
          let diffY = layerY - this.startLayerY
          width = diffX > 0 ? diffX : 16 - diffX
          height = diffY > 0 ? diffY : 20 - diffY
          this.width = width % 20 === 0 && diffX > 0 ? Math.ceil(width / 16) * 16 + 1 : Math.ceil(width / 16) * 16
          this.height = height % 20 === 0 && diffY > 0 ? Math.ceil(height / 20) * 20 + 20 : Math.ceil(height / 20) * 20
          if (diffX < 0) {
            this.left = this.startX - this.leftX - this.width + 16
          } else {
            this.left = this.startX - this.leftX
          }
          if (diffY < 0) {
            this.top = this.startY - this.topY - this.height + 20
          } else {
            this.top = this.startY - this.topY
          }
        }
        this.isFocus = true
        this.tipPosition(iden, hour, value)
      }
    },
    /**
     * @param {string} iden 当前td所在的星期几
     * @desc 计算提示框的位置
     *       popperLeft: 计算提示框距table左侧偏移值，
     *       popperLeft = 该td距离 week-td 右侧的水平距离 - ? (根据带不带半小时来计算)
     *       ? ==> 依赖提醒框内容宽度，不带半小时的话 === 内容框宽度一半，正好是31 近似 32
     *       popperTop: 计算提示框距table下方偏移值，
     *       popperTop = 该td所在的星期距离thead的垂直高度 + thead高度 - (table实时高度 + 提醒框高度)
     *       bug修复：
     *          1.当选中超过7个间隔的时间段后，该星期会占两行，高度由21增加为42，所以需要遍历所选时间数据，确定一共占几行
     */
    tipPosition (iden, time, value) {
      let cacheChecked = this.cacheChecked
      const hour = ~~time.substring(0, 2)
      const minute = ~~time.substring(3)
      this.currentVal = value
      const tableHeight = this.$refs.table.clientHeight
      this.popperTop = (~~iden + 1) * 20 + 40 - tableHeight - 60
      // 只有小时
      if (!this.hasHalfHour) {
        this.nextTime = hour + 1 >= 10 ? `${hour +1 }:00` : `0${hour + 1}:00`
        this.popperLeft = (hour - 1) * 16 + 13
        return
      }
      if (minute === 30) {
        this.nextTime = hour + 1 >= 10 ? `${hour +1 }:00` : `0${hour + 1}:00`
        this.popperLeft = (hour * 2) * 16 + 13
        return
      }
      this.nextTime = time.substring(0, 2) + ':30'
      this.popperLeft = (hour * 2 - 1) * 16 + 13
    },
    /**
     * @desc 控制是否移出table可选时间范围
     */
    moveout (isMoveout) {
      this.isMoveout = isMoveout
    },
    handleMouseup (e) {
      if (e && !e.target.dataset.hour) {
        this.isDrag = false
      }
    },
    handleMousemove (e) {
      if (!e.target.dataset.hour) {
        this.isMoveout = true
      }
    },
    /**
     * @desc 获取被选中的数据。数据存在异步获取问题
     */
    select (cacheChecked) {
      this.$nextTick(() => {
        console.log(cacheChecked)
        this.cacheChecked = cacheChecked
        this.$emit('selectTimeRange', this.cacheChecked)
      })
    }
  },
  destroyed () {
    document.body.removeEventListener('mouseup', this.handleMouseup)
    document.body.removeEventListener('mousemove', this.handleMousemove)
  }
}
</script>

<style lang="less">
@import '../assets/less/base.less';
@import '../assets/less/index.less';
@import '../assets/less/time-range-picker-common.less';
</style>
