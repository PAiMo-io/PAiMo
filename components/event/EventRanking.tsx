'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApi } from '@/lib/useApi'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Avatar from 'boring-avatars'

interface RankingData {
  user: {
    id: string
    username: string
    email: string
    image?: string
    avatarUpdatedAt?: string | number | null
  }
  wins: number
  losses: number
  totalScore: number
  totalScoreMargin: number
  matchesPlayed: number
  winRate: number
  averageScore: number
}

interface EventRankingProps {
  eventId: string
}

export default function EventRanking({ eventId }: EventRankingProps) {
  const { t } = useTranslation('common')
  const { request } = useApi()
  const [rankings, setRankings] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [eventInfo, setEventInfo] = useState<{
    eventName: string
    totalParticipants: number
    totalMatches: number
  } | null>(null)

  // Define table columns
  const columns: ColumnDef<RankingData>[] = [
    {
      id: 'rank',
      header: '#',
      cell: ({ row }) => (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
          #{row.index + 1}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'user',
      header: 'Player',
      cell: ({ row }) => {
        const user = row.original.user
        const displayName = user.username || user.email || 'Unknown'
        return (
          <div className="flex items-center space-x-3">
            {user.image ? (
              <Image
                src={
                  user.image
                    ? `${user.image}${user.avatarUpdatedAt ? `?v=${new Date(user.avatarUpdatedAt).getTime()}` : ''}`
                    : ''
                }
                alt={displayName}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <Avatar size={32} name={displayName} variant="beam" />
            )}
            <span className="font-medium">{displayName}</span>
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'matchesPlayed',
      header: 'Matches',
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.matchesPlayed}
        </div>
      ),
    },
    {
      accessorKey: 'wins',
      header: 'Wins',
      cell: ({ row }) => (
        <div className="text-center font-semibold text-green-600">
          {row.original.wins}
        </div>
      ),
    },
    {
      accessorKey: 'losses',
      header: 'Losses',
      cell: ({ row }) => (
        <div className="text-center font-semibold text-red-600">
          {row.original.losses}
        </div>
      ),
    },
    {
      accessorKey: 'totalScore',
      header: 'Total Score',
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.totalScore}
        </div>
      ),
    },
    {
      accessorKey: 'totalScoreMargin',
      header: 'Score Margin',
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.totalScoreMargin > 0 ? '+' : ''}{row.original.totalScoreMargin}
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: rankings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true)
        const response = await request<{
          rankings: RankingData[]
          eventName: string
          totalParticipants: number
          totalMatches: number
        }>({
          url: `/api/eventRanking?eventId=${eventId}`,
          method: 'get'
        })

        setRankings(response.rankings)
        setEventInfo({
          eventName: response.eventName,
          totalParticipants: response.totalParticipants,
          totalMatches: response.totalMatches
        })
      } catch (error) {
        console.error('Failed to fetch event ranking:', error)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchRankings()
    }
  }, [eventId, request])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">{t('ranking')}</h1>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">{t('ranking')}</h1>
        {eventInfo && (
          <div className="flex gap-2">
            <Badge variant="outline">{eventInfo.totalParticipants} {t('participants')}</Badge>
            <Badge variant="outline">{eventInfo.totalMatches} {t('matches')}</Badge>
          </div>
        )}
      </div>

      {rankings.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {t('noResultsYet')}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-gray-50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-gray-500"
                    >
                      {t('noResultsYet')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
