"use client";

import {
  updateExpertProfile,
  updateProfile,
  type ProfileFormState,
} from "@/app/dashboard/profile/actions";
import AvatarImage from "@/components/common/AvatarImage";
import ExpertProfileFields from "@/components/dashboard/profile/ExpertProfileFields";
import { authClient } from "@/lib/auth-client";
import { uploadImageToBlob } from "@/lib/blob-upload";
import { useActionState, useEffect, useRef, useState } from "react";

type ProfileFormProps = {
  userId: string;
  email: string;
  role: "ADMIN" | "EXPERT" | "USER";
  profile: {
    avatar: string | null;
    firstName: string;
    surname: string;
    location: string;
    headline: string;
    website: string;
    bio: string;
    specialty: string;
    rate: number | null;
  };
  links: { label: string; url: string }[];
  selectedProjects: { title: string; url: string; imageUrl: string }[];
};

const initialState: ProfileFormState = null;

const ProfileForm = ({
  userId,
  email,
  role,
  profile,
  links,
  selectedProjects,
}: ProfileFormProps) => {
  const isExpert = role === "EXPERT";
  const [state, formAction, isPending] = useActionState(
    isExpert ? updateExpertProfile : updateProfile,
    initialState,
  );

  const [avatarUrl, setAvatarUrl] = useState(profile.avatar ?? "");
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [expertUploading, setExpertUploading] = useState(false);

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const url = await uploadImageToBlob(userId, "avatar", file);
      setAvatarUrl(url);
      setAvatarPreview(url);
    } finally {
      setAvatarUploading(false);
    }
  };

  const maxLength = 1200;

  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const [char, setChar] = useState<number | null>(0);

  const handleInput = () => {
    // 2. Access the current character length via the ref
    const currentLength = textRef.current && textRef.current.value.length;

    // 3. Directly update the DOM element to show the new count
    setChar(currentLength);
  };

  useEffect(() => {
    console.log(char);
  }, [char]);

  useEffect(() => {
    if (state?.success) {
      authClient.$store.notify("$sessionSignal");
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="bg-primary-light space-y-8 w-175 p-6 rounded-2xl"
    >
      <div className="flex items-center gap-4">
        <div>
          <div className="size-16 rounded-full bg-secondary/10 overflow-hidden flex items-center justify-center">
            {avatarPreview && (
              <AvatarImage
                key={avatarPreview}
                src={avatarPreview}
                alt="Profile avatar"
                className="h-full w-full object-cover"
                fallback={
                  <span className="font-semibold">
                    {(profile.firstName || email || "U")[0].toUpperCase()}
                  </span>
                }
              />
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor="avatar"
            className="uppercase text-xs bg-secondary/10 px-4 py-2 rounded-full cursor-pointer border border-primary-light hover:border-secondary transition-colors"
          >
            {avatarUploading
              ? "Uploading..."
              : avatarPreview
                ? "Change Photo"
                : "Upload Photo"}
          </label>
          <input
            className="hidden"
            type="file"
            accept="image/*"
            id="avatar"
            onChange={(e) => handleAvatarChange(e.target.files?.[0])}
          />
          <input type="hidden" name="avatarUrl" value={avatarUrl} />
        </div>
        <button
          type="button"
          className="uppercase text-xs text-body hover:text-[#d35555] transition-colors"
        >
          Remove
        </button>
      </div>
      <div>
        <p className="form-label">EMAIL</p>
        <p className="text-sm">{email}</p>
      </div>
      <div className="grid gap-4 grid-cols-4">
        <div>
          <label className="form-label" htmlFor="firstName">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            defaultValue={profile.firstName}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="surname">
            Surname
          </label>
          <input
            type="text"
            name="surname"
            id="surname"
            defaultValue={profile.surname}
            className="form-input"
            required
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="location" className="form-label ">
            Location
          </label>
          <input
            type="text"
            name="location"
            id="location"
            defaultValue={profile.location}
            className="form-input"
            placeholder="Accra, GH"
          />
        </div>
      </div>
      <div>
        <label htmlFor="headline" className="form-label ">
          Headline
        </label>
        <input
          type="text"
          name="headline"
          id="headline"
          defaultValue={profile.headline}
          className="form-input"
          placeholder="What are you working?"
        />
      </div>
      <div>
        <label htmlFor="website" className="form-label ">
          Website
        </label>
        <input
          type="text"
          name="website"
          id="website"
          defaultValue={profile.website}
          className="form-input"
          placeholder="https://..."
        />
      </div>
      <div>
        <label htmlFor="bio" className="form-label mb-2">
          Bio
        </label>
        <textarea
          name="bio"
          id="bio"
          ref={textRef}
          onInput={handleInput}
          defaultValue={profile.bio}
          className="text-sm w-full border border-secondary/20 focus-visible:border-secondary transition-colors focus-visible:outline-none rounded-lg p-2"
          rows={8}
          maxLength={maxLength}
          placeholder="A few sentences about yourself"
        />
        <p className="text-right text-xs text-body mt-1">
          {char}/{maxLength}
        </p>
      </div>

      {isExpert && (
        <ExpertProfileFields
          userId={userId}
          specialty={profile.specialty}
          rate={profile.rate}
          links={links}
          selectedProjects={selectedProjects}
          onUploadingChange={setExpertUploading}
        />
      )}

      <div className="flex justify-between items-center">
        {state && (
          <p
            className={`text-sm ${state.success ? "text-secondary" : "text-[#d35555]"}`}
          >
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending || avatarUploading || expertUploading}
          className="button-primary disabled:opacity-60"
        >
          {isPending
            ? "Saving..."
            : avatarUploading || expertUploading
              ? "Uploading..."
              : "Save changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
