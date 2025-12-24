import { createClient as createServiceClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      stay_request_id,
      property_id,
      seller_agent_email,
      buyer_agent_email,
      buyer_agent_name,
      buyer_name,
      buyer_email,
      property_title,
      property_location,
      check_in,
      check_out,
      message,
    } = body

    if (!seller_agent_email || !buyer_agent_email || !message) {
      return NextResponse.json({ 
        error: "seller_agent_email, buyer_agent_email, and message are required" 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(seller_agent_email) || !emailRegex.test(buyer_agent_email)) {
      return NextResponse.json({ 
        error: "Invalid email address format" 
      }, { status: 400 })
    }

    // Initialize Resend client
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: "RESEND_API_KEY environment variable is not set" 
      }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Fetch property image from database if property_id is provided
    let propertyImage: string | null = null
    if (property_id) {
      try {
        const supabase = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const { data: propertyData } = await supabase
          .from("properties")
          .select("images, original_image_urls")
          .eq("id", property_id)
          .single()
        
        if (propertyData) {
          propertyImage = propertyData.images && propertyData.images.length > 0 
            ? propertyData.images[0] 
            : propertyData.original_image_urls && propertyData.original_image_urls.length > 0
            ? propertyData.original_image_urls[0]
            : null
        }
      } catch (error) {
        console.error("Error fetching property image:", error)
        // Continue without image if fetch fails
      }
    }

    // Construct base URL for property links (keep dynamic for local dev)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const propertyUrl = property_id ? `${baseUrl}/properties/${property_id}` : null
    // Use production URL for auth links
    const loginUrl = `https://www.trycrib.com/auth?tab=login`
    const signupUrl = `https://www.trycrib.com/auth?tab=signup&role=agent`

    // Create email content (without buyer information)
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Stay Request Coordination</h2>
        <p>Hello,</p>
        <p><strong>${buyer_agent_name}</strong> (${buyer_agent_email}) has requested to coordinate a stay at the following property:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${propertyImage ? `
            <div style="margin-bottom: 15px;">
              ${propertyUrl ? `<a href="${propertyUrl}" style="display: block; text-decoration: none;">` : ''}
                <img src="${propertyImage}" alt="${property_title}" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; display: block;" />
              ${propertyUrl ? `</a>` : ''}
            </div>
          ` : ''}
          <h3 style="margin-top: 0; margin-bottom: 10px;">
            ${propertyUrl ? `<a href="${propertyUrl}" style="color: #059669; text-decoration: none;">${property_title}</a>` : property_title}
          </h3>
          <p style="margin: 5px 0;"><strong>Location:</strong> ${property_location}</p>
          ${check_in ? `<p style="margin: 5px 0;"><strong>Requested Check-in:</strong> ${new Date(check_in).toLocaleDateString()}</p>` : ''}
          ${check_out ? `<p style="margin: 5px 0;"><strong>Requested Check-out:</strong> ${new Date(check_out).toLocaleDateString()}</p>` : ''}
          ${propertyUrl ? `<p style="margin-top: 10px;"><a href="${propertyUrl}" style="color: #059669; text-decoration: underline; font-size: 14px;">View property on TryCrib →</a></p>` : ''}
        </div>

        <div style="margin: 20px 0;">
          <p><strong>Message from ${buyer_agent_name}:</strong></p>
          <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #059669; border-radius: 4px; white-space: pre-wrap;">${message}</div>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <a href="${loginUrl}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Login to Respond</a>
          <a href="${signupUrl}" style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Create Account</a>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Please respond to ${buyer_agent_email} to coordinate the stay details.
        </p>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The TryCrib Team
        </p>
      </div>
    `

    // Send email
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "TryCrib <noreply@trycrib.com>",
      to: seller_agent_email,
      replyTo: buyer_agent_email,
      subject: `Stay Request Coordination: ${property_title}`,
      html: emailContent,
    })

    if (result.error) {
      console.error("Resend API error:", result.error)
      return NextResponse.json({ 
        error: `Failed to send email: ${JSON.stringify(result.error)}` 
      }, { status: 500 })
    }

    console.log("Email sent successfully to seller's agent:", seller_agent_email)

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully",
      emailId: result.data?.id
    })

  } catch (error) {
    console.error("Error sending email to seller's agent:", error)
    return NextResponse.json({ 
      error: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
