'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface GraphData {
  date: string
  dailyMQ: number
  cumMQ: number
  F: number
  displayDate: string
}

export default function MQGraphPage() {
  const [data, setData] = useState<GraphData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/gas?type=graph')
      if (!response.ok) {
        throw new Error('データの取得に失敗しました')
      }

      const result = await response.json()
      
      const formattedData = result.map((item: { date: string; dailyMQ: number; cumMQ: number; F: number }) => ({
        date: item.date,
        dailyMQ: Number(item.dailyMQ) || 0,
        cumMQ: Number(item.cumMQ) || 0,
        F: Number(item.F) || 0,
        displayDate: new Date(item.date).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
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
              MQグラフ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="displayDate"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatTooltipValue(value),
                      name === 'cumMQ' ? '累積MQ' : name === 'F' ? '固定費' : name
                    ]}
                    labelFormatter={(label) => `日付: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cumMQ" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="累積MQ"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="F" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="固定費"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
