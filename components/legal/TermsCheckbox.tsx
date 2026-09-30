import Link from "next/link";

type TermsCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const TermsCheckbox = ({ checked, onChange }: TermsCheckboxProps) => (
  <label className="flex items-start gap-3 text-xs text-body leading-5">
    <input
      type="checkbox"
      name="accept"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      required
      className="mt-0.5 accent-secondary"
    />
    <span>
      I have read and agree to the{" "}
      <Link href="/terms-of-service" target="_blank" className="link underline">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link href="/privacy-policy" target="_blank" className="link underline">
        Privacy Policy
      </Link>
      .
    </span>
  </label>
);

export default TermsCheckbox;
