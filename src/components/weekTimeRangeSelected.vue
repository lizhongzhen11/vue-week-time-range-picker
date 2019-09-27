<template>
  <tr class="wtrp-time-range-selected">
    <td colspan="49" class="wtrp-selected-td">
      <div class="wtrp-clearfix">
        <span class="wtrp-fl tip-text" v-if="cacheChecked.length === 0">可拖动鼠标选择时间段</span>
        <span class="wtrp-fl tip-text" v-if="cacheChecked.length !== 0">已选择时间段</span>
        <a class="wtrp-fr" @click="clear">清空选择</a>
      </div>
      <div class="wtrp-selected-td__selected-time" v-for="(item, index) in weekDays" :key="index">
        <p class="wtrp-flex">
          <span class="tip-text">{{item.week}}：</span>
          <span class="wtrp-flex-1">
            <span v-for="(time, timeIndex) in item.mergeTimes" :key="timeIndex">
              {{`${time[0]}~${time[time.length - 1]}`}}
            </span>
          </span>
        </p>
      </div>
    </td>
  </tr>
</template>

<script>
import {weekMaps} from '@/config/tbody.js'

export default {
  props: {
    hasHalfHour: { // 是否启用半小时
      type: Boolean,
      default: true
    },
    cacheChecked: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      weekMaps: weekMaps,
    }
  },
  computed: {
    /**
     * @desc 数据源，对数据源增加week和mergeTimes，方便展示
     */
    weekDays () {
      let cacheChecked = this.cacheChecked
      cacheChecked.sort(this.sort).map((item, index) => {
        cacheChecked[index].week = this.weekMaps.get(item.iden)
        cacheChecked[index].mergeTimes = this.mergeTimes(item.times.sort(this.sort))
      })
      return cacheChecked
    },
    /**
     * @desc 对被选中的时间转换格式进行展示
     */
    formmat () {
      return function (first, end, len, index) {
        return `${first > 9 ? `${first}:00` : `0${first}:00`}~${end > 9 ? `${end}:00` : `0${end}:00`}${len > 1 && index !== len - 1 ? '、' : ''}`
      }
    }
  },
  methods: {
    clear () {
      this.$emit('empty')
      this.$forceUpdate()
    },
    /**
     * @desc 对被选中的日期排序，
     *       按iden排：星期一 ~ 星期日
     *       按time排：00:00~23:00
     */
    sort (curr, next) {
      if (curr.iden) {
        return curr.iden - next.iden
      }
      // 对 00:00和00:30排序
      if (curr.substring(0, 2) === next.substring(0, 2)) {
        return curr.substring(3) - next.substring(3)
      }
      return curr.substring(0, 2) - next.substring(0, 2)
    },
    /**
     * @desc 合并times，将 [00:00, 01:00, 02:00]等不间隔的时间段合并
     *       如果带半小时，那么就需要 [00:00, 00:30, 01:00] 才能合并成[00:00, 01:00]
     */
    mergeTimes (times) {
      let mergeTimes = [ [times[0]] ]
      this.hasHalfHour ? this.handleMergeHalfHour(times, mergeTimes) : this.handleMergeHour(times, mergeTimes)
      return mergeTimes
    },
    /**
     * @description 只有小时的数据合并
     */
    handleMergeHour (times, mergeTimes) {
      times.forEach(item => {
        const lastMergeArr = mergeTimes.slice(-1)[0]
        const isNext = item.substring(0, 2) - lastMergeArr.slice(-1)[0].substring(0, 2) === 1
        if (isNext) {
          lastMergeArr.push(item)
        }
        if (!isNext && item !== times[0]) {
          mergeTimes.push([item])
        }
      })
    },
    /**
     * @description 带半小时的数据合并
     */
    handleMergeHalfHour (times, mergeTimes) {
      times.forEach(item => {
        const lastMergeArr = mergeTimes.slice(-1)[0]
        // 00:00-00:30 或者 00:30 - 01:00
        // 小时*100 + 0或50，半小时转成50
        const lastMergeItem = lastMergeArr.slice(-1)[0]
        const itemNum = item.substring(0, 2) * 100 + (item.substring(3) === '30' ? 50 : 0)
        const lastMergeNum = lastMergeItem.substring(0, 2) * 100 + (lastMergeItem.substring(3) === '30' ? 50 : 0)
        const isNext = itemNum - lastMergeNum === 50
        if (isNext) {
          lastMergeArr.push(item)
        }
        if (!isNext && item !== times[0]) {
          mergeTimes.push([item])
        }
      })
      mergeTimes.forEach((item, index) => {
        const hour = +item.slice(-1)[0].substring(0, 2)
        if (item.slice(-1)[0].substring(3) === '30') {
          hour > 8 ? item.push(`${hour + 1}:00`) : item.push(`0${hour + 1}:00`)
        } else {
          hour > 8 ? item.push(`${hour}:30`) : item.push(`0${hour}:30`)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "../assets/less/time-range-picker-select.less";
</style>