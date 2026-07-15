export const links = [
  { label: "Home", link: "/" },
  { label: "Experts", link: "/experts" },
  { label: "Services", link: "/services" },
  { label: "About", link: "/about" },
];
export const dashBoardLinks = [
  { label: "Saved experts", link: "/dashboard/experts" },
  { label: "Messages", link: "/dashboard/messages" },
  { label: "My application", link: "/dashboard/application" },
  { label: "Profile", link: "/dashboard/profile" },
];
export const quickLinks = [
  { label: "FAQ's", link: "/faqs" },
  { label: "About us", link: "/about" },
  { label: "Experts", link: "/experts" },
];
export const social = [
  { label: "Instagram", link: "" },
  { label: "LinkedIn", link: "" },
  { label: "X (Twitter)", link: "" },
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
