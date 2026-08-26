import ApplyBtn from "@/components/home/ApplyBtn";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Not selected",
};

const page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/account?signin=true");
  }

  const application = await prisma.application.findFirst({
    where: { OR: [{ userId: session.user.id }, { email: session.user.email }] },
    orderBy: { createdAt: "desc" },
  });

  if (!application) {
    return (
      <div className="text-sm bg-primary-light max-w-120 space-y-4 p-4 rounded-2xl">
        <p className="text-body">
          You haven&apos;t applied to join the expert network yet.
        </p>
        <ApplyBtn content="Apply now" />
      </div>
    );
  }

  return (
    <div>
      <div className="text-sm bg-primary-light max-w-120 space-y-4 p-4 rounded-2xl">
        <p className="small-header mb-0">Status</p>
        <h2 className="text-2xl italic">
          {STATUS_LABEL[application.status]}
        </h2>
        <ul className="space-y-1">
          <li className="flex justify-between">
            <p className="text-body">Name</p>
            <p>{application.name}</p>
          </li>
          <li className="flex justify-between">
            <p className="text-body">Specialty</p>
            <p>{application.specialty}</p>
          </li>
          <li className="flex justify-between">
            <p className="text-body">Submitted</p>
            <p>{application.createdAt.toLocaleDateString()}</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default page;
