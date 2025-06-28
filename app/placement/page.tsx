'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PageSkeleton from '@/components/PageSkeleton'
import { useApi } from '@/lib/useApi'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

function PlacementClient() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { request, loading, error } = useApi()
  const [parts, setParts] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string,string>>({})
  const { t } = useTranslation('common')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/login'); return }
    if (session.user?.placementComplete || session.user?.bypassPlacement) { router.push('/'); return }
    const fetchParts = async () => {
      try {
        const res = await request<{ parts: any[] }>({ url: '/api/placement-parts', method: 'get' })
        setParts(res.parts)
      } catch (e) {
        console.error('Failed to load placement questions', e)
      }
    }
    fetchParts()
  }, [status, session, router, request])

  const calculateLevel = () => {
    return parts.reduce((total, part) => {
      const partScore = (part.questions || []).reduce((pt: number, q: any) => {
        const idx = parseInt(answers[q.id] || '', 10)
        const opt = isNaN(idx) ? null : q.options[idx]
        return pt + (opt?.score || 0)
      }, 0)
      return total + partScore * (part.multiplier || 1) * (part.weight || 1)
    }, 0)
  }

  const handleSubmit = async () => {
    const level = calculateLevel()
    try {
      await request({ url: '/api/placement', method: 'post', data: { level } })
      await update()
      router.push('/')
    } catch {
      // ignore
    }
  }

  if (status === 'loading' || loading) return <PageSkeleton />
  if (error) return <div className='p-4'>{t('failedToLoad')}</div>

  return (
    <div className='p-4 space-y-4 max-w-md mx-auto'>
      <h1 className='text-xl font-semibold'>{t('placementTitle')}</h1>
      {parts.map(part => (
        <div key={part.id} className='space-y-2'>
          <h3 className='font-semibold'>{part.name}</h3>
          {part.questions.map((q: any) => (
            <div key={q.id} className='space-y-1'>
              <Label className='block'>{q.question}</Label>
              <Select value={answers[q.id]} onValueChange={val => setAnswers(prev => ({ ...prev, [q.id]: val }))}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder={q.question} />
                </SelectTrigger>
                <SelectContent>
                  {q.options.map((opt: any, idx: number) => (
                    <SelectItem key={idx} value={String(idx)}>{opt.text}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      ))}
      <Button className='w-full' onClick={handleSubmit}>{t('placementSubmit')}</Button>
    </div>
  )
}

export default function PlacementPage() {
  return (
    <Suspense>
      <PlacementClient />
    </Suspense>
  )
}
