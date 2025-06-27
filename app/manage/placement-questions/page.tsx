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

export default function PlacementQuestionsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { request, loading, error } = useApi()
  const [questions, setQuestions] = useState<Question[]>([])
  const { t } = useTranslation('common')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/login'); return }
    if (!(session.user?.role === 'super-admin' || session.user?.role === 'admin')) {
      router.push('/')
      return
    }
    const fetchQ = async () => {
      const res = await request<{ questions: Question[] }>({ url: '/api/placement-questions', method: 'get' })
      setQuestions(res.questions)
    }
    fetchQ()
  }, [status, session, router, request])

  const handleSave = async (idx: number) => {
    const q = questions[idx]
    if (!q.question.trim()) return
    if (q.id) {
      await request({ url: `/api/placement-questions/${q.id}`, method: 'put', data: q })
    } else {
      const res = await request<{ id: string }>({ url: '/api/placement-questions', method: 'post', data: q })
      q.id = res.id
      setQuestions(prev => prev.map((qq, i) => i === idx ? q : qq))
    }
  }

  const handleDelete = async (idx: number) => {
    const q = questions[idx]
    if (q.id) {
      await request({ url: `/api/placement-questions/${q.id}`, method: 'delete' })
    }
    setQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  if (status === 'loading' || loading) return <PageSkeleton />
  if (error) return <div className="p-4">{t('failedToLoad')}</div>

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">{t('placementManagement')}</h1>
      {questions.map((q, qidx) => (
        <div key={qidx} className="border p-4 space-y-2">
          <Input
            placeholder={t('questionText') || 'Question'}
            value={q.question}
            onChange={e => {
              const val = e.target.value
              setQuestions(prev => prev.map((qq, i) => i === qidx ? { ...qq, question: val } : qq))
            }}
          />
          {q.options.map((o, oidx) => (
            <div key={oidx} className="flex space-x-2">
              <Input
                placeholder={t('optionText') || 'Option'}
                value={o.text}
                onChange={e => {
                  const val = e.target.value
                  setQuestions(prev => prev.map((qq, i) => i === qidx ? { ...qq, options: qq.options.map((oo, j) => j === oidx ? { ...oo, text: val } : oo) } : qq))
                }}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder={t('optionScore') || 'Score'}
                value={o.score}
                onChange={e => {
                  const val = parseInt(e.target.value, 10)
                  setQuestions(prev => prev.map((qq, i) => i === qidx ? { ...qq, options: qq.options.map((oo, j) => j === oidx ? { ...oo, score: val } : oo) } : qq))
                }}
                className="w-20"
              />
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => setQuestions(prev => prev.map((qq, i) => i === qidx ? { ...qq, options: [...qq.options, { text: '', score: 0 }] } : qq))}
          >
            {t('addOption')}
          </Button>
          <div className="space-x-2">
            <Button onClick={() => handleSave(qidx)}>{t('save')}</Button>
            <Button variant="destructive" onClick={() => handleDelete(qidx)}>{t('remove')}</Button>
          </div>
        </div>
      ))}
      <Button onClick={() => setQuestions(prev => [...prev, { question: '', options: [{ text: '', score: 0 }] }])}>
        {t('addQuestion')}
      </Button>
    </div>
  )
}
