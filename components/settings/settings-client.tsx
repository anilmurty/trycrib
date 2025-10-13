"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { toast } from "sonner"
import { Edit2, Save, X } from "lucide-react"

interface SettingsClientProps {
  profile: {
    id: string
    full_name: string | null
    email: string | null
    role: string | null
  } | null
  roleProfile: {
    agent_name: string | null
    agent_email: string | null
    agent_phone: string | null
  } | null
  userId: string
}

export function SettingsClient({ profile, roleProfile, userId }: SettingsClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agentInfo, setAgentInfo] = useState({
    agent_name: roleProfile?.agent_name || "",
    agent_email: roleProfile?.agent_email || "",
    agent_phone: roleProfile?.agent_phone || ""
  })

  const supabase = createClient()

  const handleSave = async () => {
    if (!profile?.role || (profile.role !== "buyer" && profile.role !== "seller")) {
      toast.error("Invalid user role")
      return
    }

    setLoading(true)
    try {
      const tableName = profile.role === "buyer" ? "buyer_profiles" : "seller_profiles"
      
      const { error } = await supabase
        .from(tableName)
        .update({
          agent_name: agentInfo.agent_name || null,
          agent_email: agentInfo.agent_email || null,
          agent_phone: agentInfo.agent_phone || null
        })
        .eq("id", userId)

      if (error) {
        console.error("Error updating agent info:", error)
        toast.error("Failed to update agent information")
        return
      }

      toast.success("Agent information updated successfully")
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating agent info:", error)
      toast.error("Failed to update agent information")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setAgentInfo({
      agent_name: roleProfile?.agent_name || "",
      agent_email: roleProfile?.agent_email || "",
      agent_phone: roleProfile?.agent_phone || ""
    })
    setIsEditing(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-2">Manage your account information</p>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <p className="text-slate-900 mt-1">{profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <p className="text-slate-900 mt-1">{profile?.email || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <p className="text-slate-900 mt-1 capitalize">{profile?.role || "Not set"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Agent Information for Buyers and Sellers */}
            {(profile?.role === "buyer" || profile?.role === "seller") && (
              <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Agent Information</CardTitle>
                      <CardDescription>
                        Your {profile.role === "buyer" ? "buyer's" : "seller's"} agent contact details
                      </CardDescription>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="agent_name">Agent Name</Label>
                        <Input
                          id="agent_name"
                          value={agentInfo.agent_name}
                          onChange={(e) => setAgentInfo(prev => ({ ...prev, agent_name: e.target.value }))}
                          placeholder="Enter agent name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="agent_email">Agent Email</Label>
                        <Input
                          id="agent_email"
                          type="email"
                          value={agentInfo.agent_email}
                          onChange={(e) => setAgentInfo(prev => ({ ...prev, agent_email: e.target.value }))}
                          placeholder="Enter agent email"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="agent_phone">Agent Phone</Label>
                        <Input
                          id="agent_phone"
                          value={agentInfo.agent_phone}
                          onChange={(e) => setAgentInfo(prev => ({ ...prev, agent_phone: e.target.value }))}
                          placeholder="Enter agent phone"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleSave}
                          disabled={loading}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={loading}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Agent Name</label>
                        <p className="text-slate-900 mt-1">{roleProfile?.agent_name || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Agent Email</label>
                        <p className="text-slate-900 mt-1">{roleProfile?.agent_email || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Agent Phone</label>
                        <p className="text-slate-900 mt-1">{roleProfile?.agent_phone || "Not provided"}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
