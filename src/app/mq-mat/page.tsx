'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MatData {
  month: string
  monthlyMQ: number
  mat12: number
}

export default function MQMatPage() {
  const [data, setData] = useState<MatData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/gas?type=mat')
      if (!response.ok) {
        throw new Error('データの取得に失敗しました')
      }

      const result = await response.json()
      
      const formattedData = result.map((item: { month: string; monthlyMQ: number; mat12: number }) => ({
        month: item.month,
        monthlyMQ: Number(item.monthlyMQ) || 0,
        mat12: Number(item.mat12) || 0
      }))

      setData(formattedData)
    } catch (error) {
      setError(error instanceof Error ? error.message : '不明なエラー')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatTooltipValue = (value: number) => {
    return value.toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                戻る
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                <p>読み込み中...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                戻る
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchData} className="flex items-center gap-2">
                <RefreshCw size={16} />
                再試行
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              戻る
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              移動年計 (MAT)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatTooltipValue(value),
                      name === 'monthlyMQ' ? '月次MQ' : name === 'mat12' ? '移動年計' : name
                    ]}
                    labelFormatter={(label) => `月: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="monthlyMQ" 
                    fill="#8884d8" 
                    name="月次MQ"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mat12" 
                    stroke="#ff7300" 
                    strokeWidth={3}
                    name="移動年計"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
