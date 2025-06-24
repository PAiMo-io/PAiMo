import { IUser } from '@/models/User'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface ArrangingEventSectionProps {
    groups: IUser[][]
    onGroupsChange: (updatedGroups: IUser[][]) => void
    onGenerateGroups: () => void
    onGenerateMatches: () => void
}

export default function ArrangingEventSection({ groups, onGroupsChange, onGenerateGroups, onGenerateMatches }: ArrangingEventSectionProps) {
    const moveUser = (fromGroup: number, toGroup: number, userIndex: number) => {
        // create a new copy of groups
        const updated = groups.map(group => [...group])
        const [user] = updated[fromGroup].splice(userIndex, 1)
        updated[toGroup].push(user)
        // notify parent
        onGroupsChange(updated)
    }

    return (
        <div>
            <div className="flex justify-start items-end gap-2 mb-4">
                <Button onClick={onGenerateGroups}>Generate Groups</Button>
                {groups && groups.length > 0 && <Button onClick={onGenerateMatches}>Generate Matches</Button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {groups.map((group, gi) => (
                    <Card key={gi} className="overflow-visible">
                        <CardHeader>
                            <CardTitle className="text-lg">Group {String.fromCharCode(65 + gi)}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {group.map((user, ui) => (
                                <div key={user.email} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <div>
                                        <div className="font-medium">{user.username || user.nickname || user.email}</div>
                                        {user.level != null && <div className="text-sm text-gray-500">Level: {user.level}</div>}
                                    </div>
                                    <div className="flex space-x-1">
                                        {gi > 0 && (
                                            <Button size="icon" variant="outline" onClick={() => moveUser(gi, gi - 1, ui)}>
                                                <ArrowUp size={16} />
                                            </Button>
                                        )}
                                        {gi < groups.length - 1 && (
                                            <Button size="icon" variant="outline" onClick={() => moveUser(gi, gi + 1, ui)}>
                                                <ArrowDown size={16} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
