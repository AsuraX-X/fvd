import "dotenv/config";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "EXPERT";
};

const SEED_USERS: SeedUser[] = [
  {
    name: "Admin",
    email: "admin@example.com",
    password: "Password123!",
    role: "ADMIN",
  },
  {
    name: "Expert",
    email: "expert@example.com",
    password: "Password123!",
    role: "EXPERT",
  },
];

async function seedUser({ name, email, password, role }: SeedUser) {
  const existing = await prisma.profile.findUnique({ where: { email } });

  const userId = existing
    ? existing.userId
    : (await auth.api.signUpEmail({ body: { name, email, password } })).user
        .id;

  await prisma.profile.update({ where: { userId }, data: { role } });

  console.log(`${existing ? "Updated" : "Created"} ${role} -> ${email}`);
}

async function main() {
  for (const user of SEED_USERS) {
    await seedUser(user);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
