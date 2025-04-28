import emailjs from "@emailjs/browser";

interface BaseEmailData {
  to: string;
  senderName: string;
  senderEmail: string;
}

interface InvitationEmailData extends BaseEmailData {
  inviteLink: string;
}

interface NotificationEmailData extends BaseEmailData {
  userName: string;
  ownerName: string;
}

export enum EmailType {
  INVITATION = "invitation",
  NOTIFICATION = "notification"
}

abstract class EmailService<T extends BaseEmailData> {
  protected serviceId: string;
  protected publicKey: string;

  constructor() {
    this.serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
    this.publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;
  }

  abstract getTemplateId(): string;
  abstract prepareTemplateParams(data: T): Record<string, string>;

  async sendEmail(data: T): Promise<any> {
    return emailjs.send(
      this.serviceId,
      this.getTemplateId(),
      this.prepareTemplateParams(data),
      this.publicKey
    );
  }
}

export class InvitationEmailService extends EmailService<InvitationEmailData> {
  getTemplateId(): string {
    return process.env.NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID!;
  }

  prepareTemplateParams(data: InvitationEmailData): Record<string, string> {
    return {
      to_email: data.to,
      invite_link: data.inviteLink,
      sender_name: data.senderName,
      sender_email: data.senderEmail
    };
  }
}

export class NotificationEmailService extends EmailService<NotificationEmailData> {
  getTemplateId(): string {
    return process.env.NEXT_PUBLIC_EMAILJS_NOTIFICATION_TEMPLATE_ID!;
  }

  prepareTemplateParams(data: NotificationEmailData): Record<string, string> {
    return {
      to_email: data.to,
      user_name: data.userName,
      owner_name: data.ownerName,
      sender_name: data.senderName,
      sender_email: data.senderEmail
    };
  }
}

export function createEmailService(type: EmailType): EmailService<any> {
  switch (type) {
    case EmailType.INVITATION:
      return new InvitationEmailService();
    case EmailType.NOTIFICATION:
      return new NotificationEmailService();
    default:
      throw new Error(`Unsupported email type: ${type}`);
  }
}

export async function sendInvitationEmail(data: InvitationEmailData): Promise<any> {
  const emailService = createEmailService(EmailType.INVITATION) as InvitationEmailService;
  return emailService.sendEmail(data);
}

export async function sendNotificationEmail(data: NotificationEmailData): Promise<any> {
  const emailService = createEmailService(EmailType.NOTIFICATION) as NotificationEmailService;
  return emailService.sendEmail(data);
}
