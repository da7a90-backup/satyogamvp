'use client'

import { useState } from 'react'
import PivotTableUI from 'react-pivottable/PivotTableUI'
import TableRenderers from 'react-pivottable/TableRenderers'
import Plot from 'react-plotly.js'
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers'
import 'react-pivottable/pivottable.css'

// Create Plotly renderers
const PlotlyRenderers = createPlotlyRenderers(Plot)

interface PivotTableProps {
  data: any[]
}

export function PivotTable({ data }: PivotTableProps) {
  const formattedData = data.map(item => ({
    ...item.attributes,
    id: item.id,
    applicationDate: new Date(item.attributes.createdAt).toLocaleDateString(),
  }))

  const [pivotState, setPivotState] = useState({})

  return (
    <div className="mt-4 overflow-auto">
      {/* @ts-ignore */}
      <PivotTableUI 
        data={formattedData}
        onChange={s => setPivotState(s)}
        renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
        {...pivotState}
      />
    </div>
  )
}