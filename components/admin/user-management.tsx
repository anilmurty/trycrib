"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string
  created_at: string
}

export function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">All Users ({users.length})</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    <span className="text-sm text-slate-600">{new Date(user.created_at).toLocaleDateString()}</span>
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
