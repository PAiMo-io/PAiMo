'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PageSkeleton from '../../../components/PageSkeleton'
import { useApi } from '../../../lib/useApi'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Label } from '../../../components/ui/label'
import { useTranslation } from 'react-i18next'

interface Option { text: string; score: number }
interface Question { id?: string; question: string; options: Option[]; order?: number }
interface Part { id?: string; name: string; weight: number; multiplier: number; order?: number; questions: Question[] }
interface Level { id?: string; code: string; name: string; min: number; max: number; order?: number }
interface UserRow { username: string; placementComplete: boolean; bypassPlacement?: boolean }

export default function PlacementManagementPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { request, loading, error } = useApi()
  const [parts, setParts] = useState<Part[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
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
    const fetchLevels = async () => {
      const res = await request<{ levels: Level[] }>({ url: '/api/placement-levels', method: 'get' })
      setLevels(res.levels)
    }
    const fetchUsers = async () => {
      const res = await request<{ users: UserRow[] }>({ url: '/api/users', method: 'get' })
      setUsers(res.users)
    }
    fetchParts()
    fetchLevels()
    fetchUsers()
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

  const handleSaveLevel = async (idx: number) => {
    const level = levels[idx]
    if (!level.name.trim() || !level.code.trim()) return
    if (level.id) {
      await request({ url: `/api/placement-levels/${level.id}`, method: 'put', data: level })
    } else {
      const res = await request<{ id: string }>({ url: '/api/placement-levels', method: 'post', data: level })
      level.id = res.id
      setLevels(prev => prev.map((l, i) => i === idx ? level : l))
    }
  }

  const handleDeleteLevel = async (idx: number) => {
    const level = levels[idx]
    if (level.id) {
      await request({ url: `/api/placement-levels/${level.id}`, method: 'delete' })
    }
    setLevels(prev => prev.filter((_, i) => i !== idx))
  }

  const handleResetPlacement = async (username: string) => {
    await request({ url: `/api/users/${username}/reset-placement`, method: 'post' })
  }

  const handleToggleBypass = async (username: string, value: boolean) => {
    await request({ url: '/api/users', method: 'put', data: { username, bypassPlacement: value } })
    setUsers(prev => prev.map(u => u.username === username ? { ...u, bypassPlacement: value } : u))
  }

  if (status === 'loading' || loading) return <PageSkeleton />
  if (error) return <div className="p-4">{t('failedToLoad')}</div>

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">{t('placementManagement')}</h1>
      {parts.map((part, pidx) => (
        <div key={pidx} className="border p-4 space-y-4">
          <div className="space-y-2">
            <div>
              <Label htmlFor={`part-name-${pidx}`} className="block">
                {t('partName')}
              </Label>
              <Input
                id={`part-name-${pidx}`}
                placeholder={t('partName') || 'Part Name'}
                value={part.name}
                onChange={e => {
                  const val = e.target.value
                  setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, name: val } : pp))
                }}
              />
            </div>
            <div className="flex space-x-2">
              <div>
                <Label htmlFor={`part-weight-${pidx}`} className="block">
                  {t('partWeight')}
                </Label>
                <Input
                  id={`part-weight-${pidx}`}
                  type="number"
                  placeholder={t('partWeight') || 'Weight'}
                  value={part.weight}
                  onChange={e => {
                    const val = parseFloat(e.target.value)
                    setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, weight: val } : pp))
                  }}
                  className="w-24"
                />
              </div>
              <div>
                <Label htmlFor={`part-multiplier-${pidx}`} className="block">
                  {t('partMultiplier')}
                </Label>
                <Input
                  id={`part-multiplier-${pidx}`}
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
          </div>
          <div className="space-y-2">
            {part.questions.map((q, qidx) => (
              <div key={qidx} className="border p-2 space-y-2">
                <div>
                  <Label htmlFor={`q-${pidx}-${qidx}`} className="block">
                    {t('questionText')}
                  </Label>
                  <Input
                    id={`q-${pidx}-${qidx}`}
                    placeholder={t('questionText') || 'Question'}
                    value={q.question}
                    onChange={e => {
                      const val = e.target.value
                      setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, questions: pp.questions.map((qq, j) => j === qidx ? { ...qq, question: val } : qq) } : pp))
                    }}
                  />
                </div>
                {q.options.map((o, oidx) => (
                  <div key={oidx} className="flex space-x-2">
                    <div className="flex-1">
                      <Label htmlFor={`q-${pidx}-${qidx}-opt-${oidx}-text`} className="block">
                        {t('optionText')}
                      </Label>
                      <Input
                        id={`q-${pidx}-${qidx}-opt-${oidx}-text`}
                        placeholder={t('optionText') || 'Option'}
                        value={o.text}
                        onChange={e => {
                          const val = e.target.value
                          setParts(prev => prev.map((pp, i) => i === pidx ? { ...pp, questions: pp.questions.map((qq, j) => j === qidx ? { ...qq, options: qq.options.map((oo, k) => k === oidx ? { ...oo, text: val } : oo) } : qq) } : pp))
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`q-${pidx}-${qidx}-opt-${oidx}-score`} className="block">
                        {t('optionScore')}
                      </Label>
                      <Input
                        id={`q-${pidx}-${qidx}-opt-${oidx}-score`}
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

      <h2 className="text-lg font-semibold pt-6">{t('placementLevels')}</h2>
      {levels.map((lvl, lidx) => (
        <div key={lidx} className="border p-4 space-y-2">
          <div className="flex space-x-2">
            <div>
              <Label htmlFor={`level-code-${lidx}`} className="block">
                {t('levelCode')}
              </Label>
              <Input
                id={`level-code-${lidx}`}
                placeholder={t('levelCode') || 'Code'}
                value={lvl.code}
                onChange={e => {
                  const val = e.target.value
                  setLevels(prev => prev.map((pp, i) => i === lidx ? { ...pp, code: val } : pp))
                }}
                className="w-24"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`level-name-${lidx}`} className="block">
                {t('levelName')}
              </Label>
              <Input
                id={`level-name-${lidx}`}
                placeholder={t('levelName') || 'Name'}
                value={lvl.name}
                onChange={e => {
                  const val = e.target.value
                  setLevels(prev => prev.map((pp, i) => i === lidx ? { ...pp, name: val } : pp))
                }}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <div>
              <Label htmlFor={`level-min-${lidx}`} className="block">
                {t('levelMin')}
              </Label>
              <Input
                id={`level-min-${lidx}`}
                type="number"
                placeholder={t('levelMin') || 'Min'}
                value={lvl.min}
                onChange={e => {
                  const val = parseFloat(e.target.value)
                  setLevels(prev => prev.map((pp, i) => i === lidx ? { ...pp, min: val } : pp))
                }}
                className="w-24"
              />
            </div>
            <div>
              <Label htmlFor={`level-max-${lidx}`} className="block">
                {t('levelMax')}
              </Label>
              <Input
                id={`level-max-${lidx}`}
                type="number"
                placeholder={t('levelMax') || 'Max'}
                value={lvl.max}
                onChange={e => {
                  const val = parseFloat(e.target.value)
                  setLevels(prev => prev.map((pp, i) => i === lidx ? { ...pp, max: val } : pp))
                }}
                className="w-24"
              />
            </div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => handleSaveLevel(lidx)}>{t('save')}</Button>
            <Button variant="destructive" onClick={() => handleDeleteLevel(lidx)}>{t('remove')}</Button>
          </div>
        </div>
      ))}
      <Button onClick={() => setLevels(prev => [...prev, { code: '', name: '', min: 0, max: 0 }])}>
        {t('addLevel')}
      </Button>

      <h2 className="text-lg font-semibold pt-6">{t('userPlacementStatus')}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">{t('username')}</th>
              <th className="border p-2 text-left">{t('placementStatus')}</th>
              <th className="border p-2 text-left">{t('bypassPlacement')}</th>
              <th className="border p-2 text-left">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-gray-50">
                <td className="border p-2">{u.username}</td>
                <td className="border p-2">{u.placementComplete ? t('completed') : t('notCompleted')}</td>
                <td className="border p-2">{u.bypassPlacement ? t('yes') : t('no')}</td>
                <td className="border p-2 space-x-2">
                  <Button size="sm" onClick={() => handleResetPlacement(u.username)}>{t('resetPlacement')}</Button>
                  {u.bypassPlacement ? (
                    <Button size="sm" variant="outline" onClick={() => handleToggleBypass(u.username, false)}>
                      {t('undoBypass')}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleToggleBypass(u.username, true)}>
                      {t('bypassPlacement')}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
