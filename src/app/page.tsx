'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, TrendingUp, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MQ会計システム
          </h1>
          <p className="text-lg text-gray-600">
            データ入力・グラフ表示・移動年計分析
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Calculator className="mx-auto mb-4 text-blue-600" size={48} />
              <CardTitle className="text-xl">データ入力</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                日次データ（P, V, M, Q, F）を入力して自動計算
              </p>
              <Link href="/input">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  データ入力画面へ
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <TrendingUp className="mx-auto mb-4 text-green-600" size={48} />
              <CardTitle className="text-xl">MQグラフ</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                累積MQと固定費の推移を折れ線グラフで表示
              </p>
              <Link href="/mq-graph">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  MQグラフを見る
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="mx-auto mb-4 text-purple-600" size={48} />
              <CardTitle className="text-xl">移動年計</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                月次MQと12ヶ月移動年計を複合チャートで表示
              </p>
              <Link href="/mq-mat">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  移動年計を見る
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                LINE公式アカウント連携対応
              </h2>
              <p className="text-blue-700">
                各ページはLINEリッチメニューから直接アクセス可能です
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
