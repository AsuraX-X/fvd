"use client";

import { quickLinks, social, studio } from "@/constants";
import { useDialog } from "@/contexts/DialogContext";
import { useRole } from "@/contexts/RoleContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";

const Footer = () => {
  const { openDialog } = useDialog();
  const role = useRole();
  const router = useRouter();

  return (
    <section className="border-t px-8 border-t-primary-light ">
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
                  <button
                    onClick={() => {
                      if (!role) {
                        router.push("/account?signin=true");
                        return;
                      }
                      openDialog("enquiry", { briefLabel: "Message" });
                    }}
                  >
                    Contact us
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-xs font-bold tracking-wide uppercase text-body/80">
                Studio
              </h5>
              <ul className="space-y-3 text-sm text-body">
                {studio.map(({ label, link }) => (
                  <li key={label}>
                    <Link href={link}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse lg:items-center gap-8 lg:justify-between lg:flex-row py-15">
          <p className="text-xs text-body/60">
            © 2026 FVDlance Creative Agency. All rights reserved.
          </p>
          <div className="flex text-sm text-body gap-4">
            <Link href={"/privacy-policy"}>Privacy Policy</Link>
            <Link href={"/terms-of-service"}>Terms of Service</Link>
          </div>
          <ul className="flex gap-4 text-sm lg:w-fit w-full text-body">
            {social.map(({ label, link }) => (
              <li key={label}>
                <a target="_blank" href={link}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Footer;
