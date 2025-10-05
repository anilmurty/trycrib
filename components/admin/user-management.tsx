"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Crown, Shield, UserCheck, UserX } from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string
  created_at: string
}

interface UserManagementProps {
  currentUserId: string
  currentUserRole: string
}

export function UserManagement({ currentUserId, currentUserRole }: UserManagementProps) {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      setUsers(data || [])
      setLoading(false)
    }

    fetchUsers()
  }, [supabase])

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading users...</div>
  }

  const buyers = users.filter((u) => u.role === "buyer")
  const sellers = users.filter((u) => u.role === "seller")
  const admins = users.filter((u) => u.role === "admin")
  const superadmins = users.filter((u) => u.role === "superadmin")

  const handleRoleChange = async (userId: string, newRole: string, action: string) => {
    setActionLoading(userId)
    try {
      const { error } = await supabase.rpc('promote_to_admin', {
        target_user_id: userId,
        promoted_by: currentUserId
      })

      if (error) {
        console.error('Error changing role:', error)
        alert('Failed to change user role. You may not have permission.')
        return
      }

      // Refresh users list
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
      setUsers(data || [])
    } catch (error) {
      console.error('Error changing role:', error)
      alert('Failed to change user role.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDemoteAdmin = async (userId: string) => {
    setActionLoading(userId)
    try {
      const { error } = await supabase.rpc('demote_admin', {
        target_user_id: userId,
        demoted_by: currentUserId
      })

      if (error) {
        console.error('Error demoting admin:', error)
        alert('Failed to demote admin. You may not have permission.')
        return
      }

      // Refresh users list
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
      setUsers(data || [])
    } catch (error) {
      console.error('Error demoting admin:', error)
      alert('Failed to demote admin.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">All Users ({users.length})</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-slate-900">{buyers.length}</div>
              <p className="text-sm text-slate-600 mt-1">Buyers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-slate-900">{sellers.length}</div>
              <p className="text-sm text-slate-600 mt-1">Sellers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-slate-900">{admins.length}</div>
              <p className="text-sm text-slate-600 mt-1">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-slate-900">{superadmins.length}</div>
              <p className="text-sm text-slate-600 mt-1">Superadmins</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Users</h2>
        <div className="space-y-2">
          {users.slice(0, 10).map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.full_name || "No name"}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={
                        user.role === "superadmin" ? "default" : 
                        user.role === "admin" ? "secondary" : 
                        "outline"
                      }
                    >
                      {user.role === "superadmin" && <Crown className="h-3 w-3 mr-1" />}
                      {user.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                      {user.role}
                    </Badge>
                    <span className="text-sm text-slate-600">{new Date(user.created_at).toLocaleDateString()}</span>
                    {currentUserRole === "superadmin" && user.id !== currentUserId && (
                      <div className="flex gap-1">
                        {user.role === "buyer" || user.role === "seller" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRoleChange(user.id, "admin", "promote")}
                            disabled={actionLoading === user.id}
                            className="h-8 px-2"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Make Admin
                          </Button>
                        ) : user.role === "admin" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDemoteAdmin(user.id)}
                            disabled={actionLoading === user.id}
                            className="h-8 px-2"
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            Demote
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
