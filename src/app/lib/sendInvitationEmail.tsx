import emailjs from "@emailjs/browser";

interface EmailData {
  to: string;
  inviteLink: string;
}

export async function sendEmail({ to, inviteLink }: EmailData) {
  return emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
    { to_email: to, invite_link: inviteLink },
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
  );
}
