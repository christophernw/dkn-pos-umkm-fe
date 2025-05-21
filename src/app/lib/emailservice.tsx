import emailjs from "@emailjs/browser";

// Core data interfaces
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

// Abstract base class with core functionality
abstract class EmailService<T extends BaseEmailData> {
  protected serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  protected publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

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

// Concrete implementations
export class InvitationEmailService extends EmailService<InvitationEmailData> {
  getTemplateId = () => process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
  
  prepareTemplateParams = (data: InvitationEmailData) => ({
    to_email: data.to,
    invite_link: data.inviteLink,
    sender_name: data.senderName,
    sender_email: data.senderEmail
  });
}

export class NotificationEmailService extends EmailService<NotificationEmailData> {
  getTemplateId = () => process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_REMOVAL!;
  
  prepareTemplateParams = (data: NotificationEmailData) => ({
    to_email: data.to,
    user_name: data.userName,
    owner_name: data.ownerName,
    sender_name: data.senderName || "",
    sender_email: data.senderEmail || ""
  });
}

// Factory function
export function createEmailService(type: EmailType): EmailService<any> {
  const services = {
    [EmailType.INVITATION]: new InvitationEmailService(),
    [EmailType.NOTIFICATION]: new NotificationEmailService()
  };
  
  const service = services[type];
  if (!service) throw new Error(`Unsupported email type: ${type}`);
  return service;
}

// Helper functions for direct use
export const sendInvitationEmail = (data: InvitationEmailData) => 
  createEmailService(EmailType.INVITATION).sendEmail(data);

export const sendRemovalNotificationEmail = (data: NotificationEmailData) => 
  createEmailService(EmailType.NOTIFICATION).sendEmail(data);

