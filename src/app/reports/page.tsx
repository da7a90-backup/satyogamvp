'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PivotTable } from '@/components/reports/pivot-table'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { generateMockData } from '@/lib/mock-data'

interface Application {
  id: number
  attributes: {
    email: string
    firstName: string
    lastName: string
    programType: string
    programDate: string
    nationality: string
    status: string
    createdAt: string
    [key: string]: any
  }
}

export default function ReportsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Using mock data instead of API call
    const mockData = generateMockData(100)
    setApplications(mockData)
    setIsLoading(false)
  }, [])

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(applications.map(app => ({
      'Application ID': app.id,
      Email: app.attributes.email,
      'First Name': app.attributes.firstName,
      'Last Name': app.attributes.lastName,
      Program: app.attributes.programType,
      'Program Date': new Date(app.attributes.programDate).toLocaleDateString(),
      Nationality: app.attributes.nationality,
      'Marital Status': app.attributes.maritalStatus,
      'Membership Status': app.attributes.membershipStatus,
      'Has Health Conditions': app.attributes.hasHealthConditions ? 'Yes' : 'No',
      'Has Dietary Restrictions': app.attributes.hasDietaryRestrictions ? 'Yes' : 'No',
      'Application Status': app.attributes.status,
      'Created At': new Date(app.attributes.createdAt).toLocaleDateString()
    })))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Applications')
    XLSX.writeFile(wb, 'retreat-applications.xlsx')
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Retreat Applications Report</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Total Applications: {applications.length}
            </p>
          </div>
          <Button onClick={downloadExcel}>
            <Download className="mr-2 h-4 w-4" />
            Download Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <h3 className="text-lg font-medium">Quick Stats</h3>
              <div className="grid grid-cols-4 gap-4">
                {['shakti', 'sevadhari', 'darshan'].map(program => (
                  <Card key={program}>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium capitalize">{program}</p>
                      <p className="text-2xl font-bold">
                        {applications.filter(app => app.attributes.programType === program).length}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">Acceptance Rate</p>
                    <p className="text-2xl font-bold">
                      {Math.round((applications.filter(app => app.attributes.status === 'accepted').length / applications.length) * 100)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <PivotTable data={applications} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}