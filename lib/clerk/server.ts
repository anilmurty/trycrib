import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function getCurrentUserProfile() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  return profile
}

export async function requireAuth() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  return userId
}

export async function requireRole(allowedRoles: string[]) {
  const userId = await requireAuth()
  const profile = await getCurrentUserProfile()

  if (!profile || !allowedRoles.includes(profile.role)) {
    throw new Error("Forbidden")
  }

  return { userId, profile }
}
