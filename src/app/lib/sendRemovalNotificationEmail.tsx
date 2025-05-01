// src/app/lib/sendRemovalNotificationEmail.tsx
import emailjs from "@emailjs/browser";

interface RemovalEmailData {
  to: string;
  userName: string;
  ownerName: string;
}

/**
 * Send a notification email to a user who has been removed from a toko
 * 
 * This function uses EmailJS to send the email. It requires proper configuration
 * in your environment variables:
 * - NEXT_PUBLIC_EMAILJS_SERVICE_ID
 * - NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_REMOVAL (new template for removals)
 * - NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
 * 
 * @param data Email data including recipient, user name, and owner name
 * @returns Promise from EmailJS
 */
export async function sendRemovalNotificationEmail({ to, userName, ownerName }: RemovalEmailData) {
  return emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_REMOVAL!, // You'll need to create this template
    { 
      to_email: to, 
      user_name: userName,
      owner_name: ownerName
    },
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
  );
}