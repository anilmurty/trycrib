"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Mail } from "lucide-react"
import { toast } from "sonner"

interface InviteClientModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function InviteClientModal({
  open,
  onClose,
  onSuccess,
}: InviteClientModalProps) {
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"buyer" | "seller">("buyer")

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      toast.error("Please enter the client's first name")
      return
    }

    if (!email.trim()) {
      toast.error("Please enter the client's email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/agent/invite-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          role: role,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invitation')
      }

      const result = await response.json()
      const successMessage = result.message || `We've invited ${firstName} to join TryCrib`
      toast.success(successMessage)
      
      // Reset form
      setFirstName("")
      setLastName("")
      setEmail("")
      setRole("buyer")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error sending invitation:", error)
      toast.error(error instanceof Error ? error.message : "Failed to send invitation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Invite a Client
          </DialogTitle>
          <DialogDescription>
            Send an invitation email to a client to join TryCrib. They'll receive an email with instructions to create an account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Enter last name (optional)"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Client Role *</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "buyer" | "seller")}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !firstName.trim() || !email.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
