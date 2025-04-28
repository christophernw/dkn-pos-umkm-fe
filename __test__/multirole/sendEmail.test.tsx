// __tests__/sendEmail.test.ts
import { sendInvitationEmail, sendNotificationEmail } from "@/src/app/lib/emaillservice";
import emailjs from "@emailjs/browser";

jest.mock("@emailjs/browser", () => ({
  send: jest.fn(),
}));

describe("sendEmail", () => {
  it("should call emailjs.send with correct parameters", async () => {
    const mockSend = emailjs.send as jest.Mock;

    const emailData = {
      to: "recipient@example.com",
      inviteLink: "https://example.com/invite",
      senderName: "Sender Name",
      senderEmail: "sender@example.com",
    };

    mockSend.mockResolvedValueOnce({ status: 200 });

    const result = await sendInvitationEmail(emailData);

    expect(mockSend).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        to_email: emailData.to,
        invite_link: emailData.inviteLink,
        sender_name: emailData.senderName,
        sender_email: emailData.senderEmail,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );
    expect(result).toEqual({ status: 200 });
  });

  it("should throw error if emailjs.send fails", async () => {
    const mockSend = emailjs.send as jest.Mock;
  
    mockSend.mockRejectedValueOnce(new Error("Failed to send email"));
  
    const emailData = {
      to: "recipient@example.com",
      inviteLink: "https://example.com/invite",
      senderName: "Sender Name",
      senderEmail: "sender@example.com",
    };
  
    await expect(sendInvitationEmail(emailData)).rejects.toThrow("Failed to send email");
  });  
});

