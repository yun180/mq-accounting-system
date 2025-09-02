'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, ArrowLeft } from 'lucide-react'

interface FormData {
  date: string
  P: string
  V: string
  M: string
  Q: string
  F: string
  PQ: number
  VQ: number
  MQ: number
  G: number
}

export default function InputPage() {
  const [data, setData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    P: '', V: '', M: '', Q: '', F: '',
    PQ: 0, VQ: 0, MQ: 0, G: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const updateCalculations = (field: keyof FormData, value: string) => {
    const newData = { ...data, [field]: value }
    
    const P = parseFloat(newData.P) || 0
    const V = parseFloat(newData.V) || 0
    const M = parseFloat(newData.M) || 0
    const Q = parseFloat(newData.Q) || 0
    const F = parseFloat(newData.F) || 0

    newData.PQ = P * Q
    newData.VQ = V * Q
    newData.MQ = M * Q
    newData.G = newData.MQ - F

    setData(newData)
  }

  const saveData = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const sharedToken = process.env.NEXT_PUBLIC_SHARED_TOKEN || ''

      const payload = {
        date: data.date,
        P: parseFloat(data.P) || 0,
        V: parseFloat(data.V) || 0,
        M: parseFloat(data.M) || 0,
        Q: parseFloat(data.Q) || 0,
        F: parseFloat(data.F) || 0,
        shared_token: sharedToken
      }

      const response = await fetch('/api/gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.ok) {
        setMessage('データが正常に保存されました')
        setData({
          date: new Date().toISOString().split('T')[0],
          P: '', V: '', M: '', Q: '', F: '',
          PQ: 0, VQ: 0, MQ: 0, G: 0
        })
      } else {
        throw new Error(result.error || '保存に失敗しました')
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const inputFields = [
    { key: 'P' as const, label: 'P' },
    { key: 'V' as const, label: 'V' },
    { key: 'M' as const, label: 'M' },
    { key: 'Q' as const, label: 'Q' },
    { key: 'F' as const, label: 'F' }
  ]

  const calculatedFields = [
    { key: 'PQ' as const, label: 'PQ', formula: 'P × Q' },
    { key: 'VQ' as const, label: 'VQ', formula: 'V × Q' },
    { key: 'MQ' as const, label: 'MQ', formula: 'M × Q' },
    { key: 'G' as const, label: 'G', formula: 'MQ - F' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              戻る
            </Button>
          </Link>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              データ入力
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                日付
              </label>
              <Input
                type="date"
                value={data.date}
                onChange={(e) => updateCalculations('date', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">入力項目</h3>
              {inputFields.map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <Input
                    type="number"
                    value={data[field.key]}
                    onChange={(e) => updateCalculations(field.key, e.target.value)}
                    placeholder="数値を入力"
                    className="w-full"
                    step="0.01"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">自動計算結果</h3>
              {calculatedFields.map(field => (
                <div key={field.key} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <div>
                    <span className="font-medium">{field.label}</span>
                    <span className="text-xs text-gray-500 ml-2">({field.formula})</span>
                  </div>
                  <span className="font-mono text-lg">
                    {data[field.key].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={saveData}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save size={16} />
              {isLoading ? '保存中...' : 'データを保存'}
            </Button>

            {message && (
              <div className={`p-3 rounded ${
                message.includes('エラー') 
                  ? 'bg-red-100 text-red-700 border border-red-300' 
                  : 'bg-green-100 text-green-700 border border-green-300'
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
