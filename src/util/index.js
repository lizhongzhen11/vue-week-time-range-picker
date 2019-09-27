import { allHours, allWithHalfHours } from '@/config/thead'

/**
 * 
 * @param {*} curr 
 * @param {*} next 
 * @description 普通排序，用于 星期一~日 排序
 */
export const sort = (curr, next) => {
  return curr - next
}

/**
 * @description 对框选范围内的起止时间进行排序
 */
export const sortHour = (curr, next) => {
  return curr.substring(0, 2) - next.substring(0, 2)
}

/**
 * 
 * @param {*} hoursArr ["03:30", "06:30"]
 * @description 处理时间范围，将位于该时间范围内的所有时间段都放进数组中
 * 结果例如：["03:30", "04:00", "04:30", "05:00", "05:30", "06:00", "06:30"]
 */
export const handleRange = (hasHalfHour, hoursArr) => {
  let startIndex, endIndex
  // 没有半小时
  if (!hasHalfHour) {
    startIndex = allHours.indexOf(hoursArr[0])
    endIndex = allHours.indexOf(hoursArr[1])
    return allHours.slice(startIndex, endIndex + 1)
  }
  // 有半小时
  startIndex = allWithHalfHours.indexOf(hoursArr[0])
  endIndex = allWithHalfHours.indexOf(hoursArr[1])
  return allWithHalfHours.slice(startIndex, endIndex + 1)
}

/**
 * 
 * @param {*} arr 
 * @description 处理日期范围
 */
export const handleDayRange = (arr) => {
  let temp = []
  for (let i = arr[0]; i <= arr[1]; i++) {
    temp.push(String(i))
  }
  return temp
}

/**
 * 
 * @description 处理框选范围内的数据，构造成我所需要的数据结构，同时需要去重等逻辑步骤
 */
export const handleCheckedData = ({cacheChecked, hasStart, has, idenIndex, iden, timeRange}) => {
  let temp = { // 缓存数据，不要在循环中声明，否则会开辟多个内存空间
    iden: iden,
    times: []
  }
  let timeIndex = -1
  // 开始框选，此时处于起点td框内，只需要判断该td(时间)所处的日期是否在已选数据中，不在的话加进去
  if (!hasStart && !has) {
    cacheChecked.push(temp)
  }
  for (let i = 0; i < timeRange.length; i++) {
    // 查找当前时间是否之前已经被选中过了；例如之前的点击、框选行为
    timeIndex = !!has ? cacheChecked[idenIndex].times.indexOf(timeRange[i]) : -1
    // 取消选中；对已选中的时间范围进行删减
    if (hasStart && has) {
      timeIndex >= 0 && cacheChecked[idenIndex].times.splice(timeIndex, 1)
      if (cacheChecked[idenIndex].times.length === 0) {
        cacheChecked.splice(idenIndex, 1)
        break
      }
      continue
    } 
    // 框选时间范围
    if (!hasStart) {
      // 已选中数据中已存在该星期，只是没有该时间
      if (timeIndex === -1 && idenIndex >= 0) {
        cacheChecked[idenIndex].times.push(timeRange[i])
        continue
      }
      // 已选中数据中没有该星期数据
      temp.times.push(timeRange[i])
    }
  }
}