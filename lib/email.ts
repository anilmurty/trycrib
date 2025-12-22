import "server-only"
import { Resend } from "resend"

// Initialize Resend client lazily
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set")
  }
  return new Resend(apiKey)
}

interface StayRequestEmailData {
  agentEmail: string
  agentName: string
  buyerName: string
  buyerEmail: string
  propertyAddress: string
  propertyCity: string
  propertyState: string
  propertyTitle: string
  propertyImage?: string
  propertyUrl: string
  checkInDate?: string
  checkOutDate?: string
  message?: string
}

interface PropertyListingRequestEmailData {
  agentEmail: string
  agentName: string
  sellerName: string
  sellerEmail: string
  propertyAddress: string
  propertyCity: string
  propertyState: string
  propertyZip: string
  requestType: "existing_property" | "new_property"
  propertyImage?: string
  propertyUrl?: string
  message?: string
}

/**
 * Send email to buyer's agent when a buyer requests a stay
 */
export async function sendStayRequestEmail(data: StayRequestEmailData) {
  try {
    const { agentEmail, agentName, buyerName, buyerEmail, propertyAddress, propertyCity, propertyState, propertyTitle, propertyImage, propertyUrl, checkInDate, checkOutDate, message } = data

    // Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }

    console.log("Sending email via Resend:", {
      to: agentEmail,
      from: process.env.RESEND_FROM_EMAIL || "TryCrib <noreply@trycrib.com>",
      subject: `Stay Request: ${propertyTitle}`,
    })

    // Construct base URL for CTA links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const loginUrl = `${baseUrl}/auth?tab=login`
    const signupUrl = `${baseUrl}/auth?tab=signup&role=agent`

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Stay Request from Your Client</h2>
        <p>Hello ${agentName},</p>
        <p>Your client <strong>${buyerName}</strong> (${buyerEmail}) has requested a stay at the following property:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${propertyImage ? `
            <div style="margin-bottom: 15px;">
              <a href="${propertyUrl}" style="display: block; text-decoration: none;">
                <img src="${propertyImage}" alt="${propertyTitle}" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; display: block;" />
              </a>
            </div>
          ` : ''}
          <h3 style="margin-top: 0; margin-bottom: 10px;">
            <a href="${propertyUrl}" style="color: #1e40af; text-decoration: none;">${propertyTitle}</a>
          </h3>
          <p style="margin: 5px 0;"><strong>Address:</strong> <a href="${propertyUrl}" style="color: #3b82f6; text-decoration: none;">${propertyAddress}, ${propertyCity}, ${propertyState}</a></p>
          ${checkInDate ? `<p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkInDate}</p>` : ''}
          ${checkOutDate ? `<p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOutDate}</p>` : ''}
          <p style="margin-top: 10px;">
            <a href="${propertyUrl}" style="color: #3b82f6; text-decoration: underline; font-size: 14px;">View property on TryCrib →</a>
          </p>
        </div>

        ${message ? `
          <div style="margin: 20px 0;">
            <p><strong>Message from ${buyerName}:</strong></p>
            <p style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px;">${message}</p>
          </div>
        ` : ''}

        <div style="margin: 30px 0; text-align: center;">
          <a href="${loginUrl}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Login to Coordinate Stay</a>
          <a href="${signupUrl}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Create Account</a>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Please review this request and coordinate with the seller's agent to arrange the stay.
        </p>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The TryCrib Team
        </p>
      </div>
    `

    const resend = getResendClient()
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "TryCrib <noreply@trycrib.com>",
      to: agentEmail,
      subject: `Stay Request: ${propertyTitle}`,
      html: emailContent,
    })

    console.log("Resend API response:", {
      success: result.data ? true : false,
      id: result.data?.id,
      error: result.error,
    })

    if (result.error) {
      throw new Error(`Resend API error: ${JSON.stringify(result.error)}`)
    }

    if (!result.data) {
      throw new Error("Resend API returned no data")
    }

    return { success: true, id: result.data.id }
  } catch (error: any) {
    console.error("Error sending stay request email:", error)
    console.error("Error type:", typeof error)
    console.error("Error message:", error?.message)
    console.error("Error response:", error?.response)
    throw error
  }
}

/**
 * Send email to seller's agent when a seller requests their property to be listed
 */
export async function sendPropertyListingRequestEmail(data: PropertyListingRequestEmailData) {
  try {
    const { agentEmail, agentName, sellerName, sellerEmail, propertyAddress, propertyCity, propertyState, propertyZip, requestType, propertyImage, propertyUrl, message } = data

    // Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }

    console.log("Sending property listing request email via Resend:", {
      to: agentEmail,
      from: process.env.RESEND_FROM_EMAIL || "TryCrib <noreply@trycrib.com>",
      subject: `Property Listing Request: ${propertyAddress}`,
    })

    // Construct base URL for CTA links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const loginUrl = `${baseUrl}/auth?tab=login`
    const signupUrl = `${baseUrl}/auth?tab=signup&role=agent`
    const dashboardUrl = `${baseUrl}/dashboard/seller`

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Property Listing Request from Your Client</h2>
        <p>Hello ${agentName},</p>
        <p>Your client <strong>${sellerName}</strong> (${sellerEmail}) has requested to list their property for stays:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${propertyImage ? `
            <div style="margin-bottom: 15px;">
              ${propertyUrl ? `<a href="${propertyUrl}" style="display: block; text-decoration: none;">` : ''}
                <img src="${propertyImage}" alt="${propertyAddress}" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; display: block;" />
              ${propertyUrl ? `</a>` : ''}
            </div>
          ` : ''}
          <p style="margin: 5px 0;"><strong>Request Type:</strong> ${requestType === "existing_property" ? "Existing Property" : "New Property"}</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${propertyUrl ? `<a href="${propertyUrl}" style="color: #059669; text-decoration: none;">${propertyAddress}</a>` : propertyAddress}</p>
          <p style="margin: 5px 0;"><strong>City:</strong> ${propertyCity}</p>
          <p style="margin: 5px 0;"><strong>State:</strong> ${propertyState}</p>
          <p style="margin: 5px 0;"><strong>ZIP:</strong> ${propertyZip}</p>
          ${propertyUrl ? `
            <p style="margin-top: 10px;">
              <a href="${propertyUrl}" style="color: #059669; text-decoration: underline; font-size: 14px;">View property on TryCrib →</a>
            </p>
          ` : ''}
        </div>

        ${message ? `
          <div style="margin: 20px 0;">
            <p><strong>Message from ${sellerName}:</strong></p>
            <p style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #10b981; border-radius: 4px;">${message}</p>
          </div>
        ` : ''}

        <div style="margin: 30px 0; text-align: center;">
          <a href="${loginUrl}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Login to Review Request</a>
          <a href="${signupUrl}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Create Account</a>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Please review this request and complete the property setup in your <a href="${dashboardUrl}" style="color: #059669; text-decoration: underline;">dashboard</a> to make it available for stays.
        </p>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The TryCrib Team
        </p>
      </div>
    `

    const resend = getResendClient()
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "TryCrib <noreply@trycrib.com>",
      to: agentEmail,
      subject: `Property Listing Request: ${propertyAddress}`,
      html: emailContent,
    })

    console.log("Resend API response:", {
      success: result.data ? true : false,
      id: result.data?.id,
      error: result.error,
    })

    if (result.error) {
      throw new Error(`Resend API error: ${JSON.stringify(result.error)}`)
    }

    if (!result.data) {
      throw new Error("Resend API returned no data")
    }

    return { success: true, id: result.data.id }
  } catch (error: any) {
    console.error("Error sending property listing request email:", error)
    console.error("Error type:", typeof error)
    console.error("Error message:", error?.message)
    console.error("Error response:", error?.response)
    throw error
  }
}

interface InviteClientEmailData {
  agentFirstName: string
  agentEmail: string
  clientFirstName: string
  clientLastName: string
  clientEmail: string
  clientRole: "buyer" | "seller"
}

/**
 * Send invitation email to a client from an agent
 */
export async function sendInviteClientEmail(data: InviteClientEmailData) {
  try {
    const { agentFirstName, agentEmail, clientFirstName, clientLastName, clientEmail, clientRole } = data

    // Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }

    console.log("Sending client invitation email via Resend:", {
      to: clientEmail,
      from: process.env.RESEND_FROM_EMAIL || "TryCrib <noreply@trycrib.com>",
      subject: `${agentFirstName} has invited you to join TryCrib`,
      role: clientRole,
    })

    // Construct base URL for CTA links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const signupUrl = `${baseUrl}/auth?tab=signup`

    // Tailor email content based on role
    const isSeller = clientRole === "seller"
    const platformDescription = isSeller 
      ? "a platform that allows home sellers to earn money while their home is listed and attract more serious buyers, faster."
      : "a platform that helps buyers experience homes before purchasing them."
    
    const benefitsList = isSeller
      ? `
        <ul style="line-height: 1.8;">
          <li>Earn 2-3x typical rental rates while your home is on the market</li>
          <li>Offset carrying costs, staging fees, utility expenses and more</li>
          <li>Attract serious, pre-qualified buyers who are genuinely interested in purchasing</li>
        </ul>
      `
      : `
        <ul style="line-height: 1.8;">
          <li>Browse homes currently on the market</li>
          <li>Request short-term stays to experience living in a home before making an offer</li>
          <li>Make confident purchasing decisions</li>
        </ul>
      `

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">You've been invited to TryCrib</h2>
        <p>Hello ${clientFirstName}${clientLastName ? ` ${clientLastName}` : ''},</p>
        
        <p>
          <strong>${agentFirstName}</strong> has invited you to join TryCrib, ${platformDescription}
        </p>

        <p>
          TryCrib allows you to:
        </p>
        ${benefitsList}

        <div style="margin: 30px 0; text-align: center;">
          <a href="${signupUrl}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Create Your Account</a>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          If you have any questions, feel free to reach out to ${agentFirstName} at ${agentEmail}.
        </p>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The TryCrib Team
        </p>
      </div>
    `

    const resend = getResendClient()
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "TryCrib <noreply@trycrib.com>",
      to: clientEmail,
      replyTo: agentEmail,
      subject: `${agentFirstName} has invited you to join TryCrib`,
      html: emailContent,
    })

    console.log("Resend API response:", {
      success: result.data ? true : false,
      id: result.data?.id,
      error: result.error,
    })

    if (result.error) {
      throw new Error(`Resend API error: ${JSON.stringify(result.error)}`)
    }

    if (!result.data) {
      throw new Error("Resend API returned no data")
    }

    return { success: true, id: result.data.id }
  } catch (error: any) {
    console.error("Error sending invite client email:", error)
    console.error("Error type:", typeof error)
    console.error("Error message:", error?.message)
    throw error
  }
}

interface ConfirmAgentEmailData {
  agentFirstName: string
  agentEmail: string
  agentName: string
  clientFirstName: string
  clientLastName: string
  clientEmail: string
  clientRole: "buyer" | "seller"
}

/**
 * Send confirmation email to existing user asking them to confirm agent relationship
 */
export async function sendConfirmAgentEmail(data: ConfirmAgentEmailData) {
  try {
    const { agentFirstName, agentEmail, agentName, clientFirstName, clientLastName, clientEmail, clientRole } = data

    // Validate Resend API key
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }

    console.log("Sending agent confirmation email via Resend:", {
      to: clientEmail,
      from: process.env.RESEND_FROM_EMAIL || "TryCrib <noreply@trycrib.com>",
      subject: `${agentFirstName} wants to work with you on TryCrib`,
    })

    // Construct base URL for CTA links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const settingsUrl = `${baseUrl}/settings`

    const isSeller = clientRole === "seller"
    const roleText = isSeller ? "seller" : "buyer"

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Agent Connection Request</h2>
        <p>Hello ${clientFirstName}${clientLastName ? ` ${clientLastName}` : ''},</p>
        
        <p>
          <strong>${agentFirstName}</strong> (${agentName}) has requested to work with you as your ${roleText}'s agent on TryCrib.
        </p>

        <p>
          To connect with ${agentFirstName}, please visit your settings and add them as your agent.
        </p>

        <div style="margin: 30px 0; text-align: center;">
          <a href="${settingsUrl}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Update Agent Settings</a>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          If you have any questions, feel free to reach out to ${agentFirstName} at ${agentEmail}.
        </p>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The TryCrib Team
        </p>
      </div>
    `

    const resend = getResendClient()
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "TryCrib <noreply@trycrib.com>",
      to: clientEmail,
      replyTo: agentEmail,
      subject: `${agentFirstName} wants to work with you on TryCrib`,
      html: emailContent,
    })

    console.log("Resend API response:", {
      success: result.data ? true : false,
      id: result.data?.id,
      error: result.error,
    })

    if (result.error) {
      throw new Error(`Resend API error: ${JSON.stringify(result.error)}`)
    }

    if (!result.data) {
      throw new Error("Resend API returned no data")
    }

    return { success: true, id: result.data.id }
  } catch (error: any) {
    console.error("Error sending confirm agent email:", error)
    console.error("Error type:", typeof error)
    console.error("Error message:", error?.message)
    throw error
  }
}
