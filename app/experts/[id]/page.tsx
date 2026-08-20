import AvatarImage from "@/components/common/AvatarImage";
import ProjectDialog from "@/components/experts/ProjectDialog";
import SaveExpertButton from "@/components/experts/SaveExpertButton";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

const page = async ({ params }: PageProps) => {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      links: { orderBy: { order: "asc" } },
      selectedProjects: { orderBy: { order: "asc" } },
    },
  });

  if (!profile || profile.role !== "EXPERT") {
    notFound();
  }

  const isSaved = session
    ? Boolean(
        await prisma.savedExpert.findUnique({
          where: { userId_expertId: { userId: session.user.id, expertId: id } },
        }),
      )
    : false;

  const name = `${profile.firstName} ${profile.surname}`.trim();

  return (
    <main className="py-30 px-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <Link href={"/experts"}>
          <p className="text-body flex items-center gap-1 text-xs hover:text-secondary transition-colors">
            <ArrowLeft size={14} />
            All Experts
          </p>
        </Link>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative w-32 aspect-square rounded-2xl bg-secondary overflow-hidden">
            {profile.avatar ? (
              <AvatarImage
                key={profile.avatar}
                src={profile.avatar}
                alt={`${name} photo`}
                className="absolute inset-0 h-full w-full object-cover"
                fallback={
                  <span className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-primary">
                    {name[0]?.toUpperCase() ?? "U"}
                  </span>
                }
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-primary">
                {name[0]?.toUpperCase() ?? "U"}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-between">
            <div className="text-xs flex uppercase items-center gap-2">
              {profile.specialty && (
                <p className="bg-primary-light px-2 py-1 border border-secondary/20 rounded-full ">
                  {profile.specialty}
                </p>
              )}
              <p>Member since {profile.createdAt.getFullYear()}</p>
            </div>
            <h1 className="text-5xl">{name}</h1>
            {profile.headline && (
              <h2 className="text-body font-body!">{profile.headline}</h2>
            )}
          </div>
        </div>

        <SaveExpertButton
          expertId={id}
          initialSaved={isSaved}
          size={14}
          showLabel
          className="button-secondary flex items-center gap-1"
        />
      </div>

      <div className="grid gap-6 grid-cols-3">
        <div className="col-span-2 space-y-6">
          <div>
            <h3 className="uppercase font-body! text-xs mb-2 text-body">
              About
            </h3>
            <p className="text-sm">
              {profile.bio || "This expert hasn't added a bio yet."}
            </p>
          </div>
          {profile.selectedProjects.length > 0 && (
            <div>
              <h3 className="uppercase font-body! text-xs mb-4 text-body">
                Selected Work
              </h3>
              <div className="grid gap-2 grid-cols-2">
                {profile.selectedProjects.map((project) => (
                  <ProjectDialog
                    image={project.imageUrl}
                    title={project.title}
                    url={project.url}
                    key={project.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="bg-primary-light sticky top-25 space-y-2 px-4 py-4 rounded-2xl border border-secondary/20">
            <div>
              <p className="small-header mb-1">Rate</p>
              <p>
                {profile.rate
                  ? `from ¢${profile.rate.toLocaleString()}`
                  : "Rate on request"}
              </p>
            </div>
            {profile.links.length > 0 && (
              <div>
                <p className="small-header mb-1">Links</p>
                <ul>
                  {profile.links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 border-b w-fit border-primary-light hover:border-secondary transition-colors"
                      >
                        {link.label} <ArrowUpRight size={16} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link href={`/messages/${id}`}>
              <button className="button-primary mt-2 w-full">
                Start a conversation
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
