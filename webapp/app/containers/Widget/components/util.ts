import {
  DEFAULT_SPLITER,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_FONT_FAMILY,
  PIVOT_CELL_PADDING,
  PIVOT_CELL_BORDER,
  PIVOT_LINE_HEIGHT,
  PIVOT_MAX_CONTENT_WIDTH,
  PIVOT_CHART_ELEMENT_MIN_WIDTH,
  PIVOT_CHART_ELEMENT_MAX_WIDTH,
  PIVOT_CONTAINER_PADDING,
  PIVOT_CHART_METRIC_AXIS_MIN_SIZE,
  PIVOT_CHART_POINT_LIMIT,
  PIVOT_BORDER,
  PIVOT_XAXIS_SIZE,
  PIVOT_YAXIS_SIZE,
  PIVOT_TITLE_SIZE,
  PIVOT_XAXIS_ROTATE_LIMIT,
  PIVOT_XAXIS_TICK_SIZE,
  PIVOT_CANVAS_AXIS_SIZE_LIMIT
} from '../../../globalConstants'
import { DimetionType } from './Pivot/Pivot'
import { IChartLine, IChartUnit, IChartInfo } from './Pivot/Chart'
import widgetlibs from '../../../assets/json/widgetlib'
import { uuid } from '../../../utils/util'

export function getAggregatorLocale (agg) {
  switch (agg) {
    case 'sum': return '总计'
    case 'avg': return '平均数'
    case 'count': return '计数'
    case 'distinct': return '去重计数'
    case 'max': return '最大值'
    case 'min': return '最小值'
    case 'median': return '中位数'
    case 'percentile': return '百分位'
    case 'stddev': return '标准偏差'
    case 'var': return '方差'
  }
}

export function encodeMetricName (name) {
  return `${name}${DEFAULT_SPLITER}${uuid(8, 16)}`
}

export function decodeMetricName (encodedName) {
  return encodedName.split(DEFAULT_SPLITER)[0]
}

export function spanSize (arr, i, j) {
  if (i !== 0) {
    let noDraw = true
    for (let x = 0; x <= j; x += 1) {
      if (arr[i - 1][x] !== arr[i][x]) {
        noDraw = false
      }
    }
    if (noDraw) {
      return -1
    }
  }

  let len = 0
  while (i + len < arr.length) {
    let stop = false
    for (let x = 0; x <= j; x += 1) {
      if (arr[i][x] !== arr[i + len][x]) {
        stop = true
      }
    }
    if (stop) {
      break
    }
    len++
  }
  return len
}

export function naturalSort (a, b): number {
  const rx = /(\d+)|(\D+)/g
  const rd = /\d/
  const rz = /^0/

  if ((b != null) && (a == null)) {
    return -1
  }
  if ((a != null) && (b == null)) {
    return 1
  }
  if (typeof a === 'number' && isNaN(a)) {
    return -1
  }
  if (typeof b === 'number' && isNaN(b)) {
    return 1
  }
  const na = +a
  const nb = +b
  if (na < nb) {
    return -1
  }
  if (na > nb) {
    return 1
  }
  if (typeof a === 'number' && typeof b !== 'number') {
    return -1
  }
  if (typeof b === 'number' && typeof a !== 'number') {
    return 1
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return 0
  }
  if (isNaN(nb) && !isNaN(na)) {
    return -1
  }
  if (isNaN(na) && !isNaN(nb)) {
    return 1
  }
  const sa = String(a)
  const sb = String(b)
  if (sa === sb) {
    return 0
  }
  if (!(rd.test(sa) && rd.test(sb))) {
    return (sa > sb
      ? 1
      : -1)
  }
  const ra = sa.match(rx)
  const rb = sb.match(rx)
  while (ra.length && rb.length) {
    const a1 = ra.shift()
    const b1 = rb.shift()
    if (a1 !== b1) {
      if (rd.test(a1) && rd.test(b1)) {
        return Number(a1.replace(rz, '.0')) - Number(b1.replace(rz, '.0'))
      } else {
        return (a1 > b1
          ? 1
          : -1)
      }
    }
  }
  return ra.length - rb.length
}

export const getTextWidth = (
  text: string,
  fontWeight: string = DEFAULT_FONT_WEIGHT,
  fontSize: string = DEFAULT_FONT_SIZE,
  fontFamily: string = DEFAULT_FONT_FAMILY
): number => {
  const canvas = this.canvas || (this.canvas = document.createElement('canvas'))
  const context = canvas.getContext('2d')
  context.font = `${fontWeight} ${fontSize} ${fontFamily}`
  const metrics = context.measureText(text)
  return Math.ceil(metrics.width)
}

export const getPivotContentTextWidth = (
  text: string,
  fontWeight: string = DEFAULT_FONT_WEIGHT,
  fontSize: string = DEFAULT_FONT_SIZE,
  fontFamily: string = DEFAULT_FONT_FAMILY
): number => {
  return Math.min(getTextWidth(text, fontWeight, fontSize, fontFamily), PIVOT_MAX_CONTENT_WIDTH)
}

export function getPivotCellWidth (width: number): number {
  return width + PIVOT_CELL_PADDING * 2 + PIVOT_CELL_BORDER * 2
}

export function getPivotCellHeight (height?: number): number {
  return (height || PIVOT_LINE_HEIGHT) + PIVOT_CELL_PADDING * 2 + PIVOT_CELL_BORDER
}

export const getTableBodyWidth = (direction: DimetionType, containerWidth, rowHeaderWidths) => {
  const title = rowHeaderWidths.length && PIVOT_TITLE_SIZE
  const rowHeaderWidthSum = direction === 'row'
    ? rowHeaderWidths.slice(0, rowHeaderWidths.length - 1).reduce((sum, r) => sum + getPivotCellWidth(r), 0)
    : rowHeaderWidths.reduce((sum, r) => sum + getPivotCellWidth(r), 0)
  return containerWidth - PIVOT_CONTAINER_PADDING * 2 - PIVOT_BORDER * 2 - rowHeaderWidthSum - PIVOT_YAXIS_SIZE - title
}

export const getTableBodyHeight = (direction: DimetionType, containerHeight, columnHeaderCount) => {
  const title = columnHeaderCount && PIVOT_TITLE_SIZE
  const realColumnHeaderCount = direction === 'col' ? Math.max(columnHeaderCount - 1, 0) : columnHeaderCount
  return containerHeight - PIVOT_CONTAINER_PADDING * 2 - PIVOT_BORDER * 2 - realColumnHeaderCount * getPivotCellHeight() - PIVOT_XAXIS_SIZE - title
}

export function getChartElementSize (
  direction: DimetionType,
  tableBodySideLength: number[],
  chartElementCountArr: number[]
): number {
  let chartElementCount
  let side

  if (direction === 'col') {
    chartElementCount = Math.max(1, chartElementCountArr[0])
    side = tableBodySideLength[0]
  } else {
    chartElementCount = Math.max(1, chartElementCountArr[1])
    side = tableBodySideLength[1]
  }

  const sizePerElement = side / chartElementCount

  return sizePerElement > PIVOT_CHART_ELEMENT_MAX_WIDTH
    ? PIVOT_CHART_ELEMENT_MAX_WIDTH
    : sizePerElement < PIVOT_CHART_ELEMENT_MIN_WIDTH
      ? PIVOT_CHART_ELEMENT_MIN_WIDTH
      : Math.floor(sizePerElement)
}

export function shouldTableBodyCollapsed (
  direction: DimetionType,
  multiCoordinate: boolean,
  tableBodyHeight: number,
  rowKeyLength: number,
  elementSizeArr: number[]
): boolean {
  const elementSize = multiCoordinate ? elementSizeArr[1] : elementSizeArr[0]
  return direction === 'row' && tableBodyHeight > rowKeyLength * elementSize
}

// export function getChartElementSizeAndShouldCollapsed (
//   direction: DimetionType,
//   tableBodySideLength: number[],
//   chartElementCountArr: number[]
// ): {elementSize: number, shouldCollapsed: boolean} {
//   let chartElementCount
//   let side

//   if (direction === 'col') {
//     chartElementCount = Math.max(1, chartElementCountArr[0])
//     side = tableBodySideLength[0]
//   } else {
//     chartElementCount = Math.max(1, chartElementCountArr[1])
//     side = tableBodySideLength[1]
//   }

//   const sizePerElement = side / chartElementCount

//   return sizePerElement > PIVOT_CHART_ELEMENT_MAX_WIDTH
//     ? { elementSize: PIVOT_CHART_ELEMENT_MAX_WIDTH, shouldCollapsed: direction === 'row' && true }
//     : sizePerElement < PIVOT_CHART_ELEMENT_MIN_WIDTH
//       ? { elementSize: PIVOT_CHART_ELEMENT_MIN_WIDTH, shouldCollapsed: false }
//       : {
//           elementSize: Math.floor(sizePerElement),
//           shouldCollapsed: direction === 'row' && side > chartElementCount * sizePerElement
//         }
// }

export function getChartUnitMetricWidth (tableBodyWidth, colKeyCount: number, metricCount: number): number {
  const realContainerWidth = Math.max(tableBodyWidth, colKeyCount * metricCount * PIVOT_CHART_METRIC_AXIS_MIN_SIZE)
  return realContainerWidth / colKeyCount / metricCount
}

export function getChartUnitMetricHeight (tableBodyHeight, rowKeyCount: number, metricCount: number): number {
  const realContainerHeight = Math.max(tableBodyHeight, rowKeyCount * metricCount * PIVOT_CHART_METRIC_AXIS_MIN_SIZE)
  return realContainerHeight / rowKeyCount / metricCount
}

export function checkChartEnable (dimetionsCount: number, metricsCount: number, charts: IChartInfo | IChartInfo[]): boolean {
  const chartArr = Array.isArray(charts) ? charts : [charts]
  for (const chart of chartArr) {
    const { requireDimetions, requireMetrics } = chart
    if (dimetionsCount < requireDimetions || metricsCount < requireMetrics) {
      return false
    }
  }
  return true
}

export function getAxisInterval (max, splitNumber) {
  const roughInterval = Math.floor(max / splitNumber)
  const divisor = Math.pow(10, (`${roughInterval}`.length - 1))
  return (Math.floor(roughInterval / divisor) + 1) * divisor
}

export function getChartPieces (total, lines) {
  if (lines === 1) {
    return lines
  }
  const eachLine = total / lines
  const pct = Math.abs(eachLine - PIVOT_CHART_POINT_LIMIT) / PIVOT_CHART_POINT_LIMIT
  return pct < 0.2
    ? lines
    : eachLine > PIVOT_CHART_POINT_LIMIT
      ? lines
      : getChartPieces(total, Math.round(lines / 2))

}

export function metricAxisLabelFormatter (value) {
  if (value >= Math.pow(10, 9) && value < Math.pow(10, 12)) {
    return `${precision(value / Math.pow(10, 9))}B`
  } else if (value >= Math.pow(10, 6) && value < Math.pow(10, 9)) {
    return `${precision(value / Math.pow(10, 6))}M`
  } else if (value >= Math.pow(10, 3) && value < Math.pow(10, 6)) {
    return `${precision(value / Math.pow(10, 3))}K`
  } else {
    return value
  }

  function precision (num) {
    return num >= 10 ? Math.floor(num) : num.toFixed(1)
  }
}

export function getPivot () {
  return widgetlibs[0]
}

export function getScatter () {
  return widgetlibs[3]
}

export function getChartViewMetrics (metrics, requireMetrics) {
  const auxiliaryMetrics = Math.max((Array.isArray(requireMetrics) ? requireMetrics[0] : requireMetrics) - 1, 0)
  metrics.slice().splice(1, auxiliaryMetrics)
  return metrics
}

export function getAxisData (type: 'x' | 'y', rowKeys, colKeys, rowTree, colTree, tree, metrics, drawingData, dimetionAxis) {
  const { elementSize, unitMetricWidth, unitMetricHeight, multiCoordinate } = drawingData
  const data: IChartLine[] = []
  const chartLine: IChartUnit[] = []
  let axisLength = 0

  let renderKeys
  let renderTree
  let sndKeys
  let sndTree
  let renderDimetionAxis
  let unitMetricSide
  let polarMetricSide

  if (type === 'x') {
    renderKeys = colKeys
    renderTree = colTree
    sndKeys = rowKeys
    sndTree = rowTree
    renderDimetionAxis = 'col'
    unitMetricSide = unitMetricWidth
    polarMetricSide = unitMetricHeight
  } else {
    renderKeys = rowKeys
    renderTree = rowTree
    sndKeys = colKeys
    sndTree = colTree
    renderDimetionAxis = 'row'
    unitMetricSide = unitMetricHeight
    polarMetricSide = unitMetricWidth
  }

  if (renderKeys.length) {
    renderKeys.forEach((keys, i) => {
      const flatKey = keys.join(String.fromCharCode(0))
      const { records } = renderTree[flatKey]

      if (dimetionAxis === renderDimetionAxis) {
        const nextKeys = renderKeys[i + 1] || []
        let lastUnit = chartLine[chartLine.length - 1]
        if (!lastUnit || lastUnit.ended) {
          lastUnit = {
            width: 0,
            records: [],
            ended: false
          }
          chartLine.push(lastUnit)
        }
        lastUnit.records.push({
          key: keys[keys.length - 1],
          value: records[0]
        })
        if (keys.length === 1 && i === renderKeys.length - 1 ||
            keys[keys.length - 2] !== nextKeys[nextKeys.length - 2]) {
          const unitLength = lastUnit.records.length * (multiCoordinate ? polarMetricSide : elementSize)
          axisLength += unitLength
          lastUnit.width = unitLength
          lastUnit.ended = true
        }
        if (!nextKeys.length) {
          data.push({
            key: flatKey,
            data: chartLine.slice()
          })
        }
      } else {
        axisLength += unitMetricSide
        chartLine.push({
          width: unitMetricSide,
          records: [{
            key: keys[keys.length - 1],
            value: records[0]
          }],
          ended: true
        })
        if (i === renderKeys.length - 1) {
          data.push({
            key: flatKey,
            data: chartLine.slice()
          })
        }
      }
    })
  } else {
    if (dimetionAxis !== renderDimetionAxis) {
      data.push({
        key: uuid(8, 16),
        data: [{
          width: unitMetricSide,
          records: [{
            key: '',
            value: sndKeys.length ? Object.values(sndTree)[0] : tree[0] ? tree[0][0] : []
          }],
          ended: true
        }]
      })
      axisLength = unitMetricSide
    }
  }

  return {
    data: axisDataCutting(type, dimetionAxis, metrics, axisLength, data),
    length: axisLength
  }
}

export function axisDataCutting (type: 'x' | 'y', dimetionAxis, metrics, axisLength, data) {
  if (axisLength > PIVOT_CANVAS_AXIS_SIZE_LIMIT) {
    const result = []
    data.forEach((line) => {
      let blockLine = {
        key: `${uuid(8, 16)}${line.key}`,
        data: []
      }
      let block = {
        key: '',
        length: 0,
        data: [blockLine]
      }
      line.data.forEach((unit, index) => {
        const unitWidth = type === 'x' && dimetionAxis === 'row' || type === 'y' && dimetionAxis === 'col'
          ? unit.width * metrics.length
          : unit.width
        if (block.length + unitWidth > PIVOT_CANVAS_AXIS_SIZE_LIMIT) {
          block.key = `${index}${block.data.map((d) => d.key).join(',')}`
          result.push(block)
          blockLine = {
            key: `${uuid(8, 16)}${line.key}`,
            data: []
          }
          block = {
            key: '',
            length: 0,
            data: [blockLine]
          }
        }
        block.length += unitWidth
        blockLine.data.push(unit)
        if (index === line.data.length - 1) {
          block.key = `${index}${block.data.map((d) => d.key).join(',')}`
          result.push(block)
        }
      })
    })
    return result
  } else {
    return [{
      key: 'block',
      data,
      length: axisLength
    }]
  }
}

export function getXaxisLabel (elementSize) {
  return function (label) {
    const originLabel = label
    const ellipsis = '…'
    const limit = elementSize > PIVOT_XAXIS_ROTATE_LIMIT ? elementSize : PIVOT_XAXIS_SIZE - PIVOT_XAXIS_TICK_SIZE
    while (getTextWidth(label) > limit) {
      label = label.substring(0, label.length - 1)
    }
    return label === originLabel
      ? label
      : `${label.substring(0, label.length - 1)}${ellipsis}`
  }
}
