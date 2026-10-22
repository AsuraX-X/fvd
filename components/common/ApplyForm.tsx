"use client";

import { submitApplication, type ApplyFormState } from "./actions";
import { uploadApplicationPortfolio } from "@/lib/blob-upload";
import { formatFileSize } from "@/lib/format-file-size";
import { APPLICATION_PORTFOLIO_MAX_BYTES } from "@/lib/upload-limits";
import { useDialog } from "@/contexts/DialogContext";
import TermsCheckbox from "@/components/legal/TermsCheckbox";
import { authClient } from "@/lib/auth-client";
import { signInWithIntentPath } from "@/lib/terms";
import { usePathname, useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

type LinkRow = { key: string; label: string; url: string };

let keyCounter = 0;
const nextKey = () => `row-${keyCounter++}`;

const initialState: ApplyFormState = null;

const ApplyForm = ({ close }: { close: () => void }) => {
  const { openDialog } = useDialog();
  const router = useRouter();
  const pathname = usePathname();
  const user = authClient.useSession().data?.user;
  // Email sign-ups use their email as `name`, so don't prefill that.
  const defaultName = user && user.name !== user.email ? user.name : "";
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [state, formAction, isPending] = useActionState(
    submitApplication,
    initialState,
  );

  useEffect(() => {
    if (state?.success) {
      close();
      openDialog("apply-success");
    } else if (state?.code === "UNAUTHENTICATED") {
      close();
      router.push(signInWithIntentPath(pathname, "apply"));
    }
  }, [state, close, openDialog, router, pathname]);

  const handlePortfolioChange = async (file: File | undefined) => {
    if (!file) {
      setPortfolioFile(null);
      setPortfolioUrl("");
      setPortfolioError(null);
      return;
    }

    if (file.size > APPLICATION_PORTFOLIO_MAX_BYTES) {
      setPortfolioError(
        `File exceeds the ${formatFileSize(APPLICATION_PORTFOLIO_MAX_BYTES)} limit.`,
      );
      return;
    }

    setPortfolioFile(file);
    setPortfolioUrl("");
    setPortfolioError(null);
    setPortfolioUploading(true);
    try {
      const url = await uploadApplicationPortfolio(file);
      setPortfolioUrl(url);
    } finally {
      setPortfolioUploading(false);
    }
  };

  const addLink = () => {
    setLinks((prev) => [...prev, { key: nextKey(), label: "", url: "" }]);
  };

  const removeLink = (key: string) => {
    setLinks((prev) => prev.filter((link) => link.key !== key));
  };

  return (
    <form className="space-y-4" action={formAction}>
      <div>
        <label className="form-label mb-2" htmlFor="name">
          Full Name *
        </label>
        <input
          // Remount once the session loads so the prefilled name appears.
          key={defaultName}
          type="text"
          className="form-input w-full min-w-70"
          name="name"
          id="name"
          defaultValue={defaultName}
          required
        />
        {user && (
          <p className="text-xs text-body mt-1">
            Applying as <strong>{user.email}</strong> — we&apos;ll send updates
            about your application here.
          </p>
        )}
      </div>
      <div>
        <label className="form-label mb-2" htmlFor="specialty">
          Specialty *
        </label>
        <input
          type="text"
          className="form-input w-full min-w-70"
          name="specialty"
          id="specialty"
          required
        />
      </div>
      <div>
        <label className="form-label mb-2" htmlFor="bio">
          Short bio *
        </label>
        <textarea
          className="text-sm w-full resize-none border border-secondary/20 focus-visible:border-secondary transition-colors focus-visible:outline-none rounded-lg p-2"
          name="bio"
          id="bio"
          maxLength={1200}
          rows={5}
          required
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="form-label">Links</p>
          <button
            type="button"
            onClick={addLink}
            className="uppercase text-xs bg-secondary/10 px-3 py-1 rounded-full border border-primary-light hover:border-secondary transition-colors"
          >
            Add link
          </button>
        </div>
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={link.key} className="flex gap-2 items-center">
              <input
                type="text"
                name={`links[${index}][label]`}
                defaultValue={link.label}
                className="form-input w-1/3"
                placeholder="Website, Instagram, ..."
              />
              <input
                type="text"
                name={`links[${index}][url]`}
                defaultValue={link.url}
                className="form-input flex-1"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => removeLink(link.key)}
                className="uppercase text-xs text-body hover:text-[#d35555] transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label mb-2" htmlFor="portfolio">
          Portfolio (PDF / image / ZIP, up to 15 MB)
        </label>
        <div className="flex items-center gap-3">
          <label
            htmlFor="portfolio"
            className="uppercase text-xs bg-secondary/10 px-4 py-2 rounded-full cursor-pointer border border-primary-light hover:border-secondary transition-colors"
          >
            {portfolioUploading
              ? "Uploading..."
              : portfolioFile
                ? "Change Portfolio"
                : "Upload Portfolio"}
          </label>
          {portfolioFile && (
            <span className="text-sm text-body">{portfolioFile.name}</span>
          )}
        </div>
        {portfolioError && (
          <p className="text-xs text-[#d35555] mt-1">{portfolioError}</p>
        )}
        <input
          className="hidden"
          type="file"
          id="portfolio"
          accept=".pdf,.zip,image/*"
          onChange={(e) => handlePortfolioChange(e.target.files?.[0])}
        />
        <input type="hidden" name="portfolioUrl" value={portfolioUrl} />
      </div>

      <TermsCheckbox checked={acceptedTerms} onChange={setAcceptedTerms} />

      <div className="flex flex-col gap-2">
        {state && !state.success && (
          <p className="text-sm text-[#d35555]">{state.message}</p>
        )}
        <button
          type="submit"
          disabled={isPending || portfolioUploading || !acceptedTerms}
          className="button-primary w-full disabled:opacity-60"
        >
          {isPending
            ? "Submitting..."
            : portfolioUploading
              ? "Uploading..."
              : "Submit application"}
        </button>
      </div>
    </form>
  );
};

export default ApplyForm;
