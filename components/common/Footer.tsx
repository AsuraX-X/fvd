import { links, quickLinks, social } from "@/constants";
import Link from "next/link";
import Logo from "./Logo";

const Footer = () => {
  return (
    <section className="border-t border-t-primary-light ">
      <div className=" mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-12 py-15 border-b lg:gap-0 lg:flex-row border-b-primary-light ">
          <div className="space-y-6">
            <Logo />
            <p className="text-sm leading-6 text-body max-w-[40ch]">
              Building sustainable profitable brands through insights and
              relentless creative execution.
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <h5 className="mb-4 text-xs font-bold tracking-wide uppercase text-body/80">
                Quick Links
              </h5>
              <ul className="space-y-3 text-sm text-body">
                {quickLinks.map(({ label, link }) => (
                  <li key={label}>
                    <Link href={link}>{label}</Link>
                  </li>
                ))}
                <li>
                  <button>Contact us</button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-xs font-bold tracking-wide uppercase text-body/80">
                Studio
              </h5>
              <ul className="space-y-3 text-sm text-body">
                {links.map(({ label, link }) => (
                  <li key={label}>
                    <Link href={link}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-8 lg:justify-between lg:flex-row py-15">
          <p className="order-2 text-xs text-body/60">
            © 2026 FVDlance Creative Agency. All rights reserved.
          </p>
          <ul className="flex order-1 gap-4 text-sm lg:order-2 lg:w-fit w-full text-body">
            {social.map(({ label, link }) => (
              <li key={label}>
                <a href={link}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Footer;
