import emailjs from "@emailjs/browser";
import {
  EmailType,
  InvitationEmailService,
  NotificationEmailService,
  createEmailService,
  sendInvitationEmail,
  sendRemovalNotificationEmail
} from "@/src/app/lib/emailservice"; // adjust path if needed

jest.mock("@emailjs/browser", () => ({
  send: jest.fn()
}));

const mockEnv = {
  NEXT_PUBLIC_EMAILJS_SERVICE_ID: "test_service_id",
  NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "test_public_key",
  NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "test_template_id",
  NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_REMOVAL: "test_template_id_removal"
};

beforeAll(() => {
  // Assign mock environment variables
  process.env = { ...process.env, ...mockEnv };
});

describe("EmailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("InvitationEmailService", () => {
    it("should send invitation email with correct params", async () => {
      const service = new InvitationEmailService();
      const data = {
        to: "test@example.com",
        inviteLink: "https://invite.link",
        senderName: "Admin",
        senderEmail: "admin@example.com"
      };

      (emailjs.send as jest.Mock).mockResolvedValue({ status: 200 });

      const response = await service.sendEmail(data);

      expect(emailjs.send).toHaveBeenCalledWith(
        mockEnv.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        mockEnv.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          to_email: data.to,
          invite_link: data.inviteLink,
          sender_name: data.senderName,
          sender_email: data.senderEmail
        },
        mockEnv.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );
      expect(response).toEqual({ status: 200 });
    });
  });

  describe("NotificationEmailService", () => {
    it("should send removal notification email with correct params", async () => {
      const service = new NotificationEmailService();
      const data = {
        to: "user@example.com",
        userName: "User",
        ownerName: "Owner",
        senderName: "Admin",
        senderEmail: "admin@example.com"
      };

      (emailjs.send as jest.Mock).mockResolvedValue({ status: 200 });

      const response = await service.sendEmail(data);

      expect(emailjs.send).toHaveBeenCalledWith(
        mockEnv.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        mockEnv.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_REMOVAL,
        {
          to_email: data.to,
          user_name: data.userName,
          owner_name: data.ownerName,
          sender_name: data.senderName,
          sender_email: data.senderEmail
        },
        mockEnv.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );
      expect(response).toEqual({ status: 200 });
    });

    it("should fallback to empty string for missing senderName/senderEmail", async () => {
      const service = new NotificationEmailService();
      const data = {
        to: "user@example.com",
        userName: "User",
        ownerName: "Owner",
        senderName: "",
        senderEmail: ""
      };

      (emailjs.send as jest.Mock).mockResolvedValue({ status: 200 });

      await service.sendEmail(data);

      expect(emailjs.send).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          sender_name: "",
          sender_email: ""
        }),
        expect.any(String)
      );
    });
  });

  describe("createEmailService", () => {
    it("should create InvitationEmailService when type is INVITATION", () => {
      const service = createEmailService(EmailType.INVITATION);
      expect(service).toBeInstanceOf(InvitationEmailService);
    });

    it("should create NotificationEmailService when type is NOTIFICATION", () => {
      const service = createEmailService(EmailType.NOTIFICATION);
      expect(service).toBeInstanceOf(NotificationEmailService);
    });

    it("should throw error for unsupported type", () => {
      expect(() => createEmailService("invalid" as EmailType)).toThrowError(
        "Unsupported email type: invalid"
      );
    });
  });

  describe("sendInvitationEmail", () => {
    it("should call sendEmail on InvitationEmailService", async () => {
      const data = {
        to: "invitee@example.com",
        inviteLink: "https://invite.link",
        senderName: "Admin",
        senderEmail: "admin@example.com"
      };

      (emailjs.send as jest.Mock).mockResolvedValue({ status: 200 });

      const response = await sendInvitationEmail(data);

      expect(response).toEqual({ status: 200 });
      expect(emailjs.send).toHaveBeenCalled();
    });
  });

  describe("sendRemovalNotificationEmail", () => {
    it("should call sendEmail on NotificationEmailService", async () => {
      const data = {
        to: "user@example.com",
        userName: "User",
        ownerName: "Owner",
        senderName: "Admin",
        senderEmail: "admin@example.com"
      };

      (emailjs.send as jest.Mock).mockResolvedValue({ status: 200 });

      const response = await sendRemovalNotificationEmail(data);

      expect(response).toEqual({ status: 200 });
      expect(emailjs.send).toHaveBeenCalled();
    });
  });
});
