import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function StatsCard({ title, value, icon: Icon, trend, className }) {
  return (
    <Card className={cn('border-border/50', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p
                className={cn('text-xs font-medium', trend > 0 ? 'text-green-600' : 'text-red-500')}
              >
                {trend > 0 ? '+' : ''}
                {trend}% vs last month
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
