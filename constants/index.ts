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

export type UserProfile = {
  name?: string;
  email?: string;
  image?: string;
};
