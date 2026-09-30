export const links = [
  { label: "Home", link: "/" },
  { label: "Experts", link: "/experts" },
  { label: "Services", link: "/services" },
  { label: "About", link: "/about" },
];
export const studio = [
  { label: "Home", link: "/" },
  { label: "Services", link: "/services" },
];
export const dashBoardLinks = [
  { label: "Saved experts", link: "/dashboard/experts" },
  { label: "Messages", link: "/dashboard/messages" },
  { label: "My application", link: "/dashboard/application" },
  { label: "Profile", link: "/dashboard/profile" },
];
export const adminLinks = [
  { label: "Overview", link: "/admin/overview" },
  { label: "Applications", link: "/admin/applications" },
  { label: "Experts", link: "/admin/experts" },
  { label: "Users", link: "/admin/users" },
  { label: "Enquiries", link: "/admin/enquiries" },
];
export const quickLinks = [
  { label: "FAQ's", link: "/faqs" },
  { label: "About us", link: "/about" },
  { label: "Experts", link: "/experts" },
];
export const social = [
  { label: "Instagram", link: "https://www.instagram.com/fvdlance" },
  { label: "TikTok", link: "https://www.tiktok.com/@fvdlance1" },
  { label: "Gumroad", link: "https://lancefire610.gumroad.com" },
];
export const strats = [
  "Visual Identity Guide",
  "Illustration",
  "Storyboard",
  "Animation & Motion Graphics",
  "CGI Design & Animation",
];
export const prods = [
  "Experiential Campaign",
  "Experiential Activation",
  "Direction & Editorial",
  "Post Production & Finishing",
];

export const faqs = [
  {
    question: "How do I sign up?",
    answer:
      "Create an account from the sign-up flow, verify your email, and complete the short profile setup so your presence is ready for discovery.",
  },
  {
    question: "How do I get my profile to be noticed?",
    answer:
      "Use a clear bio, a strong profile image, relevant skills, and examples of your work. Profiles that are complete, specific, and visually polished tend to stand out more.",
  },
  {
    question: "How do I set up an engaging page to attract clients?",
    answer:
      "Lead with what you do best, keep your messaging concise, showcase your best work first, and make it easy for visitors to understand your value within a few seconds.",
  },
  {
    question: "How do I earn?",
    answer:
      "You earn by presenting your expertise clearly and converting profile visits into client interest, enquiries, and paid work opportunities.",
  },
  {
    question: "How do I get paid?",
    answer:
      "Payments are handled after work has been agreed with a client. Once a project is confirmed, follow the payment process shared through the portal or your client agreement.",
  },
  {
    question: "What ethics guide the use of the Fvdlance portal?",
    answer:
      "Use the portal honestly, respect client and creator privacy, represent your experience truthfully, and avoid spam, misleading claims, or abusive behavior.",
  },
  {
    question: "How do I get my profile published to a wider audience?",
    answer:
      "Keep your profile complete and active, add strong visuals and work samples, and make sure your details reflect the type of clients you want to attract.",
  },
  {
    question: "Who will see my profile?",
    answer:
      "Your profile may be seen by visitors browsing Fvdlance, potential clients, and people exploring experts who match their needs.",
  },
  {
    question: "How do I manage my profile?",
    answer:
      "Go to your dashboard or profile settings to update your bio, image, services, and portfolio whenever you need to keep your page current.",
  },
  {
    question: "Who sees my profile and where?",
    answer:
      "Your profile can appear in the public expert directory, on your public profile page, and in places where your expertise is surfaced to interested visitors.",
  },
  {
    question: "How do I leave a review for an expert?",
    answer:
      "Sign in, open the expert's profile, pick a rating from 1 to 5 stars, and write a short review of your experience working with them. You'll need a verified email to post.",
  },
  {
    question: "Can I edit my review?",
    answer:
      "Yes. You can leave one review per expert, and returning to their profile lets you update your rating and comment at any time.",
  },
  {
    question: "Can experts review themselves?",
    answer:
      "No. Experts can't leave reviews on their own profile, so every rating reflects feedback from someone else.",
  },
  {
    question: "Can I temporarily hide my expert profile?",
    answer:
      "Yes. Go to Dashboard → Profile → Danger Zone and choose \"Unlist me\" to hide your profile from the directory while you're not taking on work. Choose \"List me again\" whenever you're ready to return.",
  },
  {
    question: "Why is my profile unlisted by an admin?",
    answer:
      "An admin may unlist a profile that needs review or doesn't meet the portal's guidelines. While it's unlisted by an admin you can't relist it yourself — contact us and we'll help get it back up.",
  },
  {
    question: "How do I check if my expert profile is listed?",
    answer:
      "Your listing status is shown next to your role at the top of your dashboard: Listed, Unlisted, or Unlisted by admin.",
  },
  {
    question: "Can I stop being an expert?",
    answer:
      "Yes. Choose \"Remove expert status\" in the Danger Zone of your profile settings. Your public profile will be hidden and your account becomes a regular client account. Reviews you've received are kept, and you can re-apply later.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Go to Dashboard → Profile → Danger Zone, type DELETE to confirm, and select Delete. This permanently removes your account, profile, messages, and saved experts, and can't be undone.",
  },
  {
    question: "What happens to my reviews if I delete my account?",
    answer:
      "Reviews you've written stay on the experts' profiles so their ratings remain accurate, but they're shown as \"Former member\" instead of your name and photo.",
  },
];

// Mirrors the review_comment_length_check constraint in the add_review migration.
export const REVIEW_MAX_LENGTH = 2000;

export type UserProfile = {
  name?: string;
  email?: string;
  image?: string;
};
