<template>
  <tbody class="wtrp-tbody" 
    @mousedown="handleMousedown($event)" 
    @mouseup="handleMouseup($event)"
    @mousemove="handleMousemove($event)"
  >
    <tr class="wtrp-tbody-tr" v-for="(week, weekIndex) in weeks" :key="weekIndex">
      <td class="week-td">{{week.week}}</td>
      <td :colspan="colspan"
        v-for="(hour, index) in hours" 
        :key="index" 
        :data-hour="hour.time"
        :data-iden="week.iden"
        :data-value="`${week.week} ${hour.time}`"
        :class="hourClass(week.iden, hour)"
      ></td>
    </tr>
    <week-time-range-selected :hasHalfHour="hasHalfHour" :cacheChecked="cacheChecked" @empty="empty" />
  </tbody>
  
</template>

<script>
import { theadWithHalfHours, theadWithHours } from '@/config/thead.js'
import { weeks } from '@/config/tbody.js'
import weekTimeRangeSelected from './weekTimeRangeSelected.vue'
import { sort, sortHour, handleRange, handleDayRange, handleCheckedData } from '@/util'

export default {
  components: {
    weekTimeRangeSelected
  },
  props: {
    hasHalfHour: { // 是否启用半小时
      type: Boolean,
      default: true
    },
    checkedDatas: { // 已选中的数据
      type: Array,
      default: () => {
        return []
      }
    }
  },
  watch: {
    checkedDatas (val) {
      this.cacheChecked = val
    }
  },
  data () {
    return {
      weeks: weeks,
      hours: [],
      cacheChecked: this.checkedDatas, // 缓存当前被选中的时间数据
      cacheStart: {}, // 缓存mousedown的起始时间数据
      cacheEnd: {}, // 缓存mouseup的终点时间数据
      hasStart: false, // 判断mousedown时起始点是否在cacheChecked中
      isDrag: false,
    }
  },
  mounted () {
    this.hours = this.hasHalfHour ? theadWithHalfHours : theadWithHours
    document.body.addEventListener('mouseup', this.handleBodyMouseup)
  },
  computed: {
    /**
     * @description 根据是否有半小时来设置表格td
     */
    colspan () {
      return this.hasHalfHour ? '1' : '2'
    },
    /**
     * @desc 切换被选中时间对应td的样式
     */
    hourClass () {
      return function (iden, hour) {
        let cacheChecked = this.cacheChecked,
            isActive
        for (let i = 0; i < cacheChecked.length; i++) {
          isActive = cacheChecked[i].iden === iden && cacheChecked[i].times.indexOf(hour.time) !== -1
          if (isActive) {
            break
          }
        }
        return isActive ? 'wtrp-active-td' : 'wtrp-freeze-td'
      }
    }
  },
  methods: {
    handleBodyMouseup (e) {
      if (e && !e.target.dataset.hour) {
        self.isDrag = false
      }
    },
    /**
     * @desc mousedown事件时记录下对应的起始时间数据
     *       头条是根据起始点来确定选中或者取消选中的，所以应先判断起始点是否处于选中状态，
     *       如果是则框选范围内的时间全部取消选中，否则全部选中。
     */
    handleMousedown (e) {
      e.preventDefault()
      e.stopPropagation()
      this.isDrag = true
      this.setVal(e, 'cacheStart') && this.$emit('drag', 'down', e.clientX, e.clientY, e.layerX, e.layerY, this.cacheStart.iden, this.cacheStart.hour)
      this.isHasStart(this.cacheStart.iden, this.cacheStart.hour)
    },
    /**
     * @desc mouseup事件时记录下对应的终点时间数据，同时去计算选中的时间范围
     */
    handleMouseup (e) {
      e.preventDefault()
      e.stopPropagation()
      this.isDrag = false
      this.setVal(e, 'cacheEnd')
      this.clearCache('cacheStart')
      this.clearCache('cacheEnd')
      this.$emit('drag', 'up')
      this.$emit('select', this.cacheChecked)
    },
    handleMousemove (e) {
      if (!e.target.dataset.hour) {
        return
      }
      this.$emit('moveout', false)
      this.$emit('drag', 'move', e.clientX, e.clientY, e.layerX, e.layerY, e.target.dataset.iden, e.target.dataset.hour, e.target.dataset.value, this.isDrag)
    },
    /**
     * @desc 处理数据 移入/移出 cacheChecked。
     *       1.需要判断cacheChecked中该日期是否已存在该hour，若没有需要加入，否则删除
     *       2.需要判断cacheChecked中是否已存在该iden，若没有需要加入，若存在但是该iden中的hour全部取消选中则删除该iden
     */
    handleData (iden, hour) {
      let cacheChecked = this.cacheChecked
      const {has, idenIndex, index} = this.isHasStart(iden, hour)
      const hasStart = this.hasStart
      if (!has) {
        cacheChecked.push({
          iden: iden,
          times: [hour]
        })
        return
      }
      if (!hasStart) {
        cacheChecked[idenIndex].times.push(hour)
        return
      }
      const exist = cacheChecked[idenIndex].times.length === 1
      exist ? cacheChecked.splice(idenIndex, 1) : cacheChecked[idenIndex].times.splice(index, 1)
    },
    /**
     * @desc 触发事件时，抽出相同赋值代码
     */
    setVal (e, key) {
      if (e.target.dataset.hour) {
        let iden = e.target.dataset.iden,
            hour = e.target.dataset.hour
        this[key].iden = iden
        this[key].hour = hour
        this[key].group = iden + hour
        key === 'cacheStart' && this.isHasStart(iden, hour)
        key === 'cacheEnd' && this[key].group === this.cacheStart.group && this.handleData(iden, hour)
        key === 'cacheEnd' && this[key].group !== this.cacheStart.group && this.confirmRange(iden, hour)
        return true
      }
      return false
    },
    /**
     * @desc 清除缓存的cacheStart和cacheEnd
     */
    clearCache (key) {
      delete this[key].iden
      delete this[key].hour
      delete this[key].group
    },
    /**
     * @desc 清空所有数据
     */
    empty () {
      this.hasStart = false
      this.cacheChecked.length = 0
      this.clearCache('cacheStart')
      this.clearCache('cacheEnd')
      this.$forceUpdate()
    },
    /**
     * @desc 鉴于click和mousedown时都需要遍历数组去确定当前时间是否已经存在，所以抽出公共代码
     *       返回的值：
     *       has: 判断cacheChecked中是否存在该iden，即周一至周日的某天
     *       idenIndex: 该iden在cacheChecked中下标，
     *       index：该hour在cacheChecked中对应日期中的下标
     */
    isHasStart (iden, hour) {
      this.hasStart = false
      let cacheChecked = this.cacheChecked,
          l = cacheChecked.length,
          has = false,
          index,
          idenIndex
      for (let i = 0; i < l; i++) {
        if (cacheChecked[i].iden === iden) {
          idenIndex = i
          index = cacheChecked[i].times.indexOf(hour)
          has = true
          this.hasStart = index !== -1
          break
        }
      }
      return {has, idenIndex, index}
    },
    /**
     * @desc 根据 cacheStart 和 cacheEnd 确定时间范围，修改cacheChecked
     *       hasStart false 框选范围内 时间做选中操作
     *                true 框选范围内 时间做取消选中操作
     */
    confirmRange () {
      let daysArr = [this.cacheStart.iden, this.cacheEnd.iden],
          hoursArr = [this.cacheStart.hour, this.cacheEnd.hour],
          cacheChecked = this.cacheChecked,
          hasStart = this.hasStart;
      const dayRange = handleDayRange(daysArr.sort(sort))
      const timeRange = handleRange(this.hasHalfHour, hoursArr.sort(sortHour)) // 框选的时间范围
      for (let i = 0; i < dayRange.length; i++) {
        let {has, idenIndex} = this.isHasStart(dayRange[i])
        handleCheckedData({cacheChecked, hasStart, has, idenIndex, iden: dayRange[i], timeRange})
        // let temp = {
        //   iden: '',
        //   times: []
        // }
        // temp.iden = dayRange[i]
        // temp.times = []
        // console.log(temp)
        // for (let j = 0; j < timeRange.length; j++) {
        //   let index = !!has && cacheChecked[idenIndex].times.indexOf(timeRange[j])
        //   if (!!hasStart) {
        //     !!has && index >= 0 && cacheChecked[idenIndex].times.splice(index, 1)
        //     if (!!has && idenIndex >= 0 && cacheChecked[idenIndex].times.length === 0 && cacheChecked.splice(idenIndex, 1)) {
        //       break
        //     }
        //     continue
        //   } else {
        //     if (index === -1) {
        //       cacheChecked[idenIndex].times.push(timeRange[j])
        //       continue
        //     }
        //     temp.times.push(timeRange[j])
        //   }
        // }
        // !hasStart && !has && cacheChecked.push(temp)
      }
    },
  },
  destroyed () {
    document.body.removeEventListener('mouseup', this.handleBodyMouseup)
  }
}
</script>

<style lang="less">
.wtrp-freeze-td {
  background: #f5f5f5;
}

.wtrp-active-td {
  background-color: #0590FF;
}
</style>
