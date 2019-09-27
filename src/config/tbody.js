export const weeks = [
  {
    iden: '0',
    week: '星期一'
  },
  {
    iden: '1',
    week: '星期二'
  },
  {
    iden: '2',
    week: '星期三'
  },
  {
    iden: '3',
    week: '星期四'
  },
  {
    iden: '4',
    week: '星期五'
  },
  {
    iden: '5',
    week: '星期六'
  },
  {
    iden: '6',
    week: '星期日'
  }
]

const weekMaps = new Map()
weeks.forEach((item) => {
  weekMaps.set(item.iden, item.week)
})

export {weekMaps}