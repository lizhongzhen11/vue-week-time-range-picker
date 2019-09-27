<template>
  <thead>
    <tr>
      <th rowspan="8" class="week-td">{{firstTd}}</th>
      <th colspan="24" v-for="(item, index) in timeRange" :key="index">
        {{item}}
      </th>
    </tr>
    <tr>
      <td :colspan="colspan" v-for="(hour, hourIndex) in hours">{{hour.hour}}</td>
    </tr>
  </thead>
</template>

<script>
import {theadFirstTd, theadTimeRange, theadWithHalfHours, theadWithHours} from '@/config/thead.js'

export default {
  props: {
    hasHalfHour: { // 是否启用半小时
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      firstTd: theadFirstTd,
      timeRange: theadTimeRange,
      hours: []
    }
  },
  mounted () {
    this.hours = this.hasHalfHour ? theadWithHalfHours : theadWithHours
  },
  computed: {
    colspan () {
      return this.hasHalfHour ? '1' : '2'
    }
  }
}
</script>