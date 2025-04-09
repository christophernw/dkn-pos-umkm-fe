import emailjs from "@emailjs/browser";

interface EmailData {
  to: string;
  inviteLink: string;
  senderName: string;
  senderEmail: string;
}

export async function sendEmail({ to, inviteLink, senderName, senderEmail }: EmailData) {
  return emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
    { 
      to_email: to, 
      invite_link: inviteLink,
      sender_name: senderName,
      sender_email: senderEmail 
    },
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
  );
}