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
  // Handle both application form data and analytics data
  const formattedData = data.map(item => {
    // If item has attributes (application form data)
    if (item.attributes) {
      return {
        ...item.attributes,
        id: item.id,
        applicationDate: new Date(item.attributes.createdAt).toLocaleDateString(),
      };
    }
    // Otherwise, use item directly (analytics data)
    return item;
  });

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