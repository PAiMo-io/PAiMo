'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PageSkeleton from '../../../components/PageSkeleton'
import { useApi } from '../../../lib/useApi'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { useTranslation } from 'react-i18next'

interface Option { text: string; score: number }
interface Question { id?: string; question: string; options: Option[]; order?: number }
interface Part { id?: string; name: string; weight: number; multiplier: number; order?: number; questions: Question[] }

export default function PlacementManagementPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { request, loading, error } = useApi()
  const [parts, setParts] = useState<Part[]>([])
  const { t } = useTranslation('common')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/login'); return }
    if (!(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
      router.push('/')
      return
    }
    const fetchParts = async () => {
      const res = await request<{ parts: Part[] }>({ url: '/api/placement-parts', method: 'get' })
      setParts(res.parts)
    }
    fetchParts()
  }, [status, session, router, request])

  const handleSave = async (idx: number) => {
    const part = parts[idx]
    if (!part.name.trim()) return
    if (part.id) {
      await request({ url: `/api/placement-parts/${part.id}`, method: 'put', data: part })
    } else {
      const res = await request<{ id: string }>({ url: '/api/placement-parts', method: 'post', data: part })
      part.id = res.id
      setParts(prev => prev.map((p, i) => i === idx ? part : p))
    }
  }

  const handleDelete = async (idx: number) => {
    const part = parts[idx]
    if (part.id) {
      await request({ url: `/api/placement-parts/${part.id}`, method: 'delete' })
    }
    setParts(prev => prev.filter((_, i) => i !== idx))
  }

  if (status === 'loading' || loading) return <PageSkeleton />
  if (error) return <div className="p-4">{t('failedToLoad')}</div>

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">{t('placementManagement')}</h1>
      {parts.map((part, pidx) => (
        <div key={pidx} className="border p-4 space-y-4">
          <div className="space-y-2">
            <Input
              placeholder={t('partName') || 'Part Name'}
              value={part.name}
              onChange={e => {
                const val = e.target.value
                setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, name: val } : pp))
              }}
            />
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder={t('partWeight') || 'Weight'}
                value={part.weight}
                onChange={e => {
                  const val = parseFloat(e.target.value)
                  setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, weight: val } : pp))
                }}
                className="w-24"
              />
              <Input
                type="number"
                placeholder={t('partMultiplier') || 'Multiplier'}
                value={part.multiplier}
                onChange={e => {
                  const val = parseFloat(e.target.value)
                  setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, multiplier: val } : pp))
                }}
                className="w-24"
              />
            </div>
          </div>
          <div className="space-y-2">
            {part.questions.map((q, qidx) => (
              <div key={qidx} className="border p-2 space-y-2">
                <Input
                  placeholder={t('questionText') || 'Question'}
                  value={q.question}
                  onChange={e => {
                    const val = e.target.value
                    setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, questions: pp.questions.map((qq, j) => j === qidx ? { ...qq, question: val } : qq) } : pp))
                  }}
                />
                {q.options.map((o, oidx) => (
                  <div key={oidx} className="flex space-x-2">
                    <Input
                      placeholder={t('optionText') || 'Option'}
                      value={o.text}
                      onChange={e => {
                        const val = e.target.value
                        setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, questions: pp.questions.map((qq, j) => j === qidx ? { ...qq, options: qq.options.map((oo, k) => k === oidx ? { ...oo, text: val } : oo) } : qq) } : pp))
                      }}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder={t('optionScore') || 'Score'}
                      value={o.score}
                      onChange={e => {
                        const val = parseFloat(e.target.value)
                        setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, questions: pp.questions.map((qq, j) => j === qidx ? { ...qq, options: qq.options.map((oo, k) => k === oidx ? { ...oo, score: val } : oo) } : qq) } : pp))
                      }}
                      className="w-20"
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, questions: pp.questions.map((qq, j) => j === qidx ? { ...qq, options: [...qq.options, { text: '', score: 0 }] } : qq) } : pp))}
                >
                  {t('addOption')}
                </Button>
              </div>
            ))}
            <Button onClick={() => setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, questions: [...pp.questions, { question: '', options: [{ text: '', score: 0 }] }] } : pp))}>
              {t('addQuestion')}
            </Button>
          </div>
          <div className="space-x-2">
            <Button onClick={() => handleSave(pidx)}>{t('save')}</Button>
            <Button variant="destructive" onClick={() => handleDelete(pidx)}>{t('remove')}</Button>
          </div>
        </div>
      ))}
      <Button onClick={() => setParts(prev => [...prev, { name: '', weight: 1, multiplier: 1, questions: [] }])}>
        {t('addPart')}
      </Button>
    </div>
  )
}
