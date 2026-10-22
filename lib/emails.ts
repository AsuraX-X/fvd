import { after } from "next/server";
import { prisma } from "./prisma";
import { EMAIL_FROM, resend } from "./resend";

const APP_NAME = "FVDlance";
const BASE_URL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Escapes user-written text and keeps its line breaks.
const multiline = (value: string) => escapeHtml(value).replace(/\n/g, "<br />");

const firstName = (name: string) => escapeHtml(name.split(" ")[0]);

const paragraph = (html: string) => `<p style="margin:0 0 16px;">${html}</p>`;

const detailRows = (rows: [label: string, value: string | null][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:13px;">${rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;border-top:1px solid #ededed;width:110px;vertical-align:top;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#4a5565;">${label}</td><td style="padding:8px 0;border-top:1px solid #ededed;color:#0a0a0a;">${value}</td></tr>`,
    )
    .join("")}</table>`;

// Sends after the response is flushed (Vercel keeps the function alive via
// waitUntil), so a slow or failing email never delays or fails the action.
export const sendInBackground = (task: () => Promise<unknown>) => {
  after(async () => {
    try {
      await task();
    } catch (error) {
      console.error(error);
    }
  });
};

const getAdminEmails = async () => {
  const admins = await prisma.profile.findMany({
    where: { role: "ADMIN", user: { emailVerified: true } },
    select: { user: { select: { email: true } } },
  });
  return admins.map((admin) => admin.user.email);
};

// Email clients ignore stylesheets and CSS variables, so the brand palette from
// app/globals.css is inlined here as literal light-mode values.
const layout = ({
  heading,
  body,
  cta,
  footer,
}: {
  heading: string;
  body: string;
  cta?: { label: string; url: string };
  footer?: string;
}) => `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#ededed;font-family:Helvetica,Arial,sans-serif;color:#0a0a0a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ededed;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #b0b0b0;border-radius:16px;padding:40px 32px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#4a5565;">${APP_NAME}</p>
                <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-style:italic;font-weight:normal;font-size:32px;line-height:1.2;">${heading}</h1>
                <div style="font-size:14px;line-height:1.6;color:#4a5565;">${body}</div>
                ${
                  cta
                    ? `<p style="margin:32px 0;"><a href="${cta.url}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 24px;border-radius:999px;">${cta.label}</a></p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#4a5565;">Or paste this link into your browser:<br /><a href="${cta.url}" style="color:#393939;word-break:break-all;">${cta.url}</a></p>`
                    : ""
                }
                ${
                  footer
                    ? `<p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #ededed;font-size:12px;line-height:1.6;color:#4a5565;">${footer}</p>`
                    : ""
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const send = async (
  to: string | string[],
  subject: string,
  html: string,
  replyTo?: string,
) => {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    replyTo,
  });

  if (error) {
    throw new Error(`Failed to send "${subject}" email: ${error.message}`);
  }
};

export const sendVerificationEmail = (to: string, url: string) =>
  send(
    to,
    "Verify your email",
    layout({
      heading: "Verify your email",
      body: `<p style="margin:0;">Thanks for signing up to ${APP_NAME}. Please confirm your email address to activate your account.</p>`,
      cta: { label: "Verify email", url },
      footer:
        "If you didn't create this account, you can safely ignore this email.",
    }),
  );

export const sendPasswordResetEmail = (to: string, url: string) =>
  send(
    to,
    "Reset your password",
    layout({
      heading: "Reset your password",
      body: `<p style="margin:0;">We received a request to reset the password for your ${APP_NAME} account. This link expires in 1 hour.</p>`,
      cta: { label: "Reset password", url },
      footer:
        "If you didn't request a password reset, you can safely ignore this email — your password won't change.",
    }),
  );

export const sendWelcomeEmail = (
  to: string,
  name: string | null | undefined,
) => {
  // Email sign-ups use their email address as `name`, so only greet real names.
  const greeting =
    name && name !== to ? `Hi ${firstName(name)},` : "Hi there,";

  return send(
    to,
    `Welcome to ${APP_NAME}`,
    layout({
      heading: `Welcome to ${APP_NAME}`,
      body: `<p style="margin:0 0 16px;">${greeting}</p>
<p style="margin:0 0 16px;">Your account is ready. Browse our experts directory, save the people you'd like to work with, and message them directly.</p>
<p style="margin:0;">Head to your dashboard to complete your profile and get started.</p>`,
      cta: { label: "Go to dashboard", url: `${BASE_URL}/dashboard` },
      footer: "Questions? Just reply to this email and we'll help you out.",
    }),
  );
};

type EnquiryEmailData = { name: string; email: string; brief: string };

export const sendEnquiryReceivedEmail = (enquiry: EnquiryEmailData) =>
  send(
    enquiry.email,
    "We've received your enquiry",
    layout({
      heading: "Thanks for reaching out",
      body: `${paragraph(`Hi ${firstName(enquiry.name)},`)}
${paragraph("We've received your enquiry and a member of our team will get back to you soon. Here's a copy of what you sent:")}
<blockquote style="margin:0;padding:12px 16px;border-left:2px solid #b0b0b0;background:#f7f7f7;color:#393939;">${multiline(enquiry.brief)}</blockquote>`,
      footer: "Want to add something? Just reply to this email.",
    }),
  );

export const sendEnquiryAdminNotification = async (
  enquiry: EnquiryEmailData,
) => {
  const admins = await getAdminEmails();
  if (admins.length === 0) return;

  await send(
    admins,
    `New enquiry from ${enquiry.name}`,
    layout({
      heading: "New enquiry",
      body: `${detailRows([
        ["Name", escapeHtml(enquiry.name)],
        ["Email", escapeHtml(enquiry.email)],
        ["Brief", multiline(enquiry.brief)],
      ])}`,
      cta: { label: "View enquiries", url: `${BASE_URL}/admin/enquiries` },
      footer: `Replying to this email goes straight to ${escapeHtml(enquiry.name)}.`,
    }),
    enquiry.email,
  );
};

type ApplicationEmailData = {
  name: string;
  email: string;
  specialty: string;
  bio: string;
  portfolioUrl: string | null;
  links: { label: string; url: string }[];
};

export const sendApplicationReceivedEmail = (application: ApplicationEmailData) =>
  send(
    application.email,
    "We've received your application",
    layout({
      heading: "Application received",
      body: `${paragraph(`Hi ${firstName(application.name)},`)}
${paragraph(`Thanks for applying to join ${APP_NAME} as an expert. Our team reviews every application personally, and we'll email you as soon as we've made a decision.`)}
${paragraph("If you have an account, you can check the status of your application anytime from your dashboard.")}`,
      cta: {
        label: "View application",
        url: `${BASE_URL}/dashboard/application`,
      },
      footer: "Questions in the meantime? Just reply to this email.",
    }),
  );

export const sendApplicationAdminNotification = async (
  application: ApplicationEmailData,
) => {
  const admins = await getAdminEmails();
  if (admins.length === 0) return;

  const links = [
    ...(application.portfolioUrl
      ? [{ label: "Portfolio", url: application.portfolioUrl }]
      : []),
    ...application.links,
  ]
    // Applicant-supplied URLs: only link http(s), never javascript: and friends.
    .filter((link) => /^https?:\/\//i.test(link.url))
    .map(
      (link) =>
        `<a href="${escapeHtml(link.url)}" style="color:#393939;">${escapeHtml(link.label)}</a>`,
    )
    .join("<br />");

  await send(
    admins,
    `New expert application from ${application.name}`,
    layout({
      heading: "New expert application",
      body: detailRows([
        ["Name", escapeHtml(application.name)],
        ["Email", escapeHtml(application.email)],
        ["Specialty", escapeHtml(application.specialty)],
        ["Bio", multiline(application.bio)],
        ["Links", links || null],
      ]),
      cta: {
        label: "Review applications",
        url: `${BASE_URL}/admin/applications`,
      },
    }),
    application.email,
  );
};

export const sendApplicationApprovedEmail = (application: {
  name: string;
  email: string;
  hasAccount: boolean;
}) =>
  send(
    application.email,
    `You've been approved as a ${APP_NAME} expert`,
    layout({
      heading: "You're in",
      body: `${paragraph(`Hi ${firstName(application.name)},`)}
${paragraph(`Great news — your application to join ${APP_NAME} as an expert has been approved.`)}
${
  application.hasAccount
    ? paragraph(
        "Your expert profile is now set up. Add your links, selected projects and a photo from your dashboard so clients can get to know your work.",
      )
    : paragraph(
        "A member of our team will be in touch shortly about next steps for setting up your expert profile.",
      )
}`,
      cta: application.hasAccount
        ? { label: "Complete your profile", url: `${BASE_URL}/dashboard/profile` }
        : undefined,
      footer: "Questions? Just reply to this email.",
    }),
  );

const greet = (name: string | null | undefined) =>
  paragraph(name?.trim() ? `Hi ${firstName(name.trim())},` : "Hi there,");

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max).trimEnd()}…` : value;

const quote = (html: string) =>
  `<blockquote style="margin:0 0 16px;padding:12px 16px;border-left:2px solid #b0b0b0;background:#f7f7f7;color:#393939;">${html}</blockquote>`;

export const sendNewMessageEmail = (message: {
  to: string;
  recipientName: string;
  senderName: string;
  senderProfileId: string;
  content: string;
  attachmentCount: number;
}) => {
  const preview = message.content
    ? multiline(truncate(message.content, 300))
    : `<em>Sent ${message.attachmentCount === 1 ? "an attachment" : `${message.attachmentCount} attachments`}</em>`;

  return send(
    message.to,
    `New message from ${message.senderName}`,
    layout({
      heading: "You have a new message",
      body: `${greet(message.recipientName)}
${paragraph(`<strong style="color:#0a0a0a;">${escapeHtml(message.senderName)}</strong> sent you a message on ${APP_NAME}:`)}
${quote(preview)}`,
      cta: {
        label: "Reply",
        url: `${BASE_URL}/messages/${message.senderProfileId}`,
      },
      footer: `To reply, use the button above to open the conversation — replies to this email aren't delivered to ${escapeHtml(message.senderName)}. We only email you about the first unread message in a conversation. <a href="${BASE_URL}/dashboard/profile#notifications" style="color:#393939;">Turn off message emails</a>.`,
    }),
  );
};

export const sendNewReviewEmail = (review: {
  to: string;
  expertName: string;
  expertId: string;
  reviewerName: string;
  rating: number;
  comment: string;
}) =>
  send(
    review.to,
    `You received a ${review.rating}-star review`,
    layout({
      heading: "You have a new review",
      body: `${greet(review.expertName)}
${paragraph(`<strong style="color:#0a0a0a;">${escapeHtml(review.reviewerName)}</strong> left you a review:`)}
<p style="margin:0 0 8px;font-size:18px;letter-spacing:2px;color:#0a0a0a;">${"★".repeat(review.rating)}<span style="color:#b0b0b0;">${"★".repeat(5 - review.rating)}</span></p>
${quote(multiline(review.comment))}`,
      cta: {
        label: "View your profile",
        url: `${BASE_URL}/experts/${review.expertId}`,
      },
    }),
  );

export const sendExpertListingChangedEmail = (expert: {
  to: string;
  name: string;
  listed: boolean;
}) =>
  send(
    expert.to,
    expert.listed
      ? "Your profile is visible again"
      : "Your profile has been hidden from the directory",
    layout({
      heading: expert.listed
        ? "You're back in the directory"
        : "Your profile has been hidden",
      body: `${greet(expert.name)}
${
  expert.listed
    ? paragraph(
        `Our team has relisted your expert profile, so clients can find you in the ${APP_NAME} directory again.`,
      )
    : `${paragraph(`Our team has hidden your expert profile from the ${APP_NAME} directory. Clients can no longer find you there, and you can't relist it yourself.`)}
${paragraph("If you think this is a mistake or would like to know more, just reply to this email.")}`
}`,
      cta: expert.listed
        ? { label: "Go to dashboard", url: `${BASE_URL}/dashboard` }
        : undefined,
    }),
  );

export const sendExpertRevokedEmail = (expert: { to: string; name: string }) =>
  send(
    expert.to,
    `Your ${APP_NAME} expert status has changed`,
    layout({
      heading: "Your expert status has been removed",
      body: `${greet(expert.name)}
${paragraph(`Our team has removed expert status from your ${APP_NAME} account. Your profile no longer appears in the experts directory, but your account is still active and you can keep using ${APP_NAME} as a client.`)}
${paragraph("If you think this is a mistake or would like to know more, just reply to this email.")}`,
    }),
  );

export const sendAccountDeletedEmail = (to: string) =>
  send(
    to,
    `Your ${APP_NAME} account has been deleted`,
    layout({
      heading: "Your account has been deleted",
      body: `${paragraph(`This confirms that your ${APP_NAME} account and the data associated with it have been permanently deleted.`)}
${paragraph("Reviews you wrote stay on the site as \"Former member\", and any enquiries you sent are kept by our team.")}
${paragraph("Sorry to see you go — you're welcome back any time.")}`,
      footer:
        "If you didn't delete your account, reply to this email right away.",
    }),
  );

export const sendApplicationRejectedEmail = (application: {
  name: string;
  email: string;
}) =>
  send(
    application.email,
    `Your ${APP_NAME} application`,
    layout({
      heading: "Thank you for applying",
      body: `${paragraph(`Hi ${firstName(application.name)},`)}
${paragraph(`Thank you for your interest in joining ${APP_NAME} as an expert, and for the time you put into your application.`)}
${paragraph("After careful review, we're unable to offer you a place at this time. This isn't a judgement on the quality of your work — we're often limited by the specialties we're looking for at any given moment.")}
${paragraph("We wish you all the best, and hope our paths cross again.")}`,
    }),
  );
