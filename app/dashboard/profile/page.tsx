import DangerZone from "@/components/dashboard/profile/DangerZone";
import NotificationSettings from "@/components/dashboard/profile/NotificationSettings";
import ProfileForm from "@/components/dashboard/profile/ProfileForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { signInPath } from "@/lib/terms";
import { redirect } from "next/navigation";

export const metadata = { title: "Profile" };

const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(signInPath("/dashboard/profile"));
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      links: { orderBy: { order: "asc" } },
      selectedProjects: { orderBy: { order: "asc" } },
    },
  });

  return (
    <div className="space-y-8">
      <ProfileForm
        userId={session.user.id}
        email={session.user.email}
        role={profile?.role ?? "USER"}
        profile={{
          avatar: profile?.avatar ?? session.user.image ?? null,
          firstName: profile?.firstName ?? "",
          surname: profile?.surname ?? "",
          location: profile?.location ?? "",
          headline: profile?.headline ?? "",
          website: profile?.website ?? "",
          bio: profile?.bio ?? "",
          specialty: profile?.specialty ?? "",
          rate: profile?.rate ?? null,
        }}
        links={
          profile?.links.map((link) => ({
            label: link.label,
            url: link.url,
          })) ?? []
        }
        selectedProjects={
          profile?.selectedProjects.map((project) => ({
            title: project.title,
            url: project.url,
            imageUrl: project.imageUrl,
          })) ?? []
        }
      />
      <NotificationSettings
        messageEmails={profile?.messageEmailNotifications ?? true}
      />
      <DangerZone
        role={profile?.role ?? "USER"}
        listingStatus={profile?.listingStatus ?? "LISTED"}
      />
    </div>
  );
};

export default page;
