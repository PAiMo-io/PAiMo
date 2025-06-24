'use client'

import React from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { useTranslation } from 'react-i18next'

export const EVENT_STEPS = [
  'preparing',
  'registration',
  'arranging-matches',
  'match-running',
  'ended',
] as const

export type EventStep = typeof EVENT_STEPS[number]

const stepI18nKeyMap: Record<(typeof EVENT_STEPS)[number], string> = {
  'preparing': 'preparing',
  'registration': 'registration',
  'arranging-matches': 'arrangingMatches',
  'match-running': 'matchRunning',
  'ended': 'ended',
};

export interface StepIndicatorProps {
  step: EventStep
}

interface StepProps {
  title: string
  isCompleted?: boolean
  isActive?: boolean
}

const Step = ({ title, isCompleted, isActive }: StepProps) => {
  return (
    <div className="flex items-center shrink-0">
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center',
            isCompleted
              ? 'border-primary bg-primary text-primary-foreground'
              : isActive
                ? 'border-primary'
                : 'border-muted'
          )}
        >
          {isCompleted ? (
            <Check className="w-4 h-4" />
          ) : (
            <span className="text-sm font-medium">
              {title[0].toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <div className="ml-4">
        <p
          className={cn(
            'text-sm font-medium',
            isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {title}
        </p>
      </div>
    </div>
  )
}

export default function StepIndicator({ step }: StepIndicatorProps) {
  const currentIndex = EVENT_STEPS.indexOf(step)
  const { t } = useTranslation('common')
  return (
    <div className="flex flex-nowrap items-center gap-4 mb-4 overflow-x-auto">
      {EVENT_STEPS.map((s, index) => {
        const titleKey = stepI18nKeyMap[s];
        return (
        <React.Fragment key={s}>
          <Step
            title={t(titleKey)}
            isCompleted={index < currentIndex}
            isActive={index === currentIndex}
          />
          {index < EVENT_STEPS.length - 1 && (
            <ChevronRight className="text-muted-foreground shrink-0" />
          )}
        </React.Fragment>
        )
})}
    </div>
  )
}
