# vue-week-time-range-picker

## 用法 | usage
```html
<vue-week-time-range-picker :hasHalfHour="true" :selectedData="selectedData" @selectTimeRange="selectTimeRange" />
```

```js
import vueWeekTimeRangePicker from 'vue-week-time-range-picker'
export default {
  components: {
    vueWeekTimeRangePicker
  },
  methods: {
    selectTimeRange (checked) {
      console.log(checked)
    }
  }
}
```

## API

- hasHalfHour: true | false (默认带半小时 | default with half-hour)
- selectedData: [
    {
      iden: '3',
      mergeTimes: [['02:30', '03:00']],
      times: ['02:30'],
      week: '星期四'
    }
  ]
- selectTimeRange: 接收选中的时间 | receive selected time

## 图示

1. hour
<img src="./src/assets/hour.gif">

2. half-hour
<img src="./src/assets/halfhour.gif">


## 兼容性 | compatible
|          | chrome |  edge  |
|  ----    |  ----  |  ----  |
| version  |   77   |   44   |

### 注意
1. 测试发现，edge浏览器中会受margin和padding影响，从而导致框选有偏差，建议不要对其父元素使用margin和padding。
2. 测试发现，直接引入时，左侧偏移位置有出入，目前修复，待反馈。
