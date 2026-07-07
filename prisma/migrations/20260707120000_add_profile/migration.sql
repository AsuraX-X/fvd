-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('admin','expert','user');
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "profile" (
    "id" TEXT NOT NULL,
    "avatar" TEXT,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "location" TEXT,
    "headline" TEXT,
    "website" TEXT,
    "bio" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- Create indexes (no IF NOT EXISTS to ensure compatibility with older Postgres versions)
CREATE UNIQUE INDEX "profile_email_key" ON "profile"("email");
CREATE UNIQUE INDEX "profile_userId_key" ON "profile"("userId");

ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Trigger: create a Profile row automatically after a User is inserted
-- Use a safe function that won't fail the transaction if profile insertion errors occur
CREATE OR REPLACE FUNCTION create_profile_after_user_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Attempt to insert a profile for the new user. Use BEGIN/EXCEPTION to avoid
    -- failing the parent transaction if something goes wrong during profile creation.
    BEGIN
        INSERT INTO "profile" (
            "id", "userId", "email", "firstName", "surname", "createdAt", "updatedAt", "role"
        ) VALUES (
            NEW."id",
            NEW."id",
            NEW."email",
            split_part(coalesce(NEW."name", ''), ' ', 1),
            (CASE WHEN position(' ' IN coalesce(NEW."name", '')) > 0 THEN ltrim(substring(coalesce(NEW."name", '') FROM position(' ' IN coalesce(NEW."name", '')))) ELSE '' END),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            'user'
        );
    EXCEPTION WHEN OTHERS THEN
        -- swallow errors and continue; log via NOTICE for visibility
        PERFORM pg_notify('profile_creation_error', concat('user_id=', NEW."id", ' err=', SQLERRM));
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_profile_after_user_insert
AFTER INSERT ON "user"
FOR EACH ROW
EXECUTE PROCEDURE create_profile_after_user_insert();
