import writeXlsxFile from 'write-excel-file/browser'
import { dateRange, timeLabel, type Plan } from './plan.ts'

export function planWorkbook(plan: Plan) {
  const itinerary = [['日期', '时间', '事件', '链接', '备注']]
  const places = [['日期', '时间', '事件', '地点', '地址', '链接', '备注', '图片链接']]

  for (const date of dateRange(plan.start, plan.end)) {
    const blocks = plan.days[date] ?? []
    blocks.forEach((block, index) => {
      const time = timeLabel(blocks, index)
      itinerary.push([date, time, block.event, block.link, block.note])
      for (const place of block.places) {
        places.push([date, time, block.event, place.name, place.address, place.link, place.note, place.images.join('\n')])
      }
    })
  }

  return writeXlsxFile([
    { sheet: '每日行程', data: itinerary, stickyRowsCount: 1, columns: [14, 16, 32, 38, 40].map((width) => ({ width })) },
    { sheet: '地点详情', data: places, stickyRowsCount: 1, columns: [14, 16, 32, 28, 38, 38, 40, 42].map((width) => ({ width })) },
  ])
}

export async function exportPlan(plan: Plan) {
  const name = `行程-${plan.start}_${plan.end}.xlsx`
  const blob = await planWorkbook(plan).toBlob()
  const file = new File([blob], name, { type: blob.type })
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  try {
    link.click()
  } finally {
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
  }
}
