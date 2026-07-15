import ProfileForm from "@/components/dashboard/ProfileForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/account?signin=true");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div>
      <ProfileForm
        email={session.user.email}
        profile={{
          avatar: profile?.avatar ?? session.user.image ?? null,
          firstName: profile?.firstName ?? "",
          surname: profile?.surname ?? "",
          location: profile?.location ?? "",
          headline: profile?.headline ?? "",
          website: profile?.website ?? "",
          bio: profile?.bio ?? "",
        }}
      />
    </div>
  );
};

export default page;
