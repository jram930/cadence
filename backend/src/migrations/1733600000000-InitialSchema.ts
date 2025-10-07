import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1733600000000 implements MigrationInterface {
    name = 'InitialSchema1733600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "passwordHash" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_username" UNIQUE ("username"),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);

        // Create entries table
        await queryRunner.query(`
            CREATE TABLE "entries" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" text NOT NULL,
                "mood" character varying NOT NULL,
                "entryDate" date NOT NULL,
                "userId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_entries_id" PRIMARY KEY ("id")
            )
        `);

        // Create index on userId for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_entries_userId" ON "entries" ("userId")
        `);

        // Create unique index on userId + entryDate (one entry per day per user)
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_entries_userId_entryDate" ON "entries" ("userId", "entryDate")
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "entries"
            ADD CONSTRAINT "FK_entries_userId"
            FOREIGN KEY ("userId")
            REFERENCES "users"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key
        await queryRunner.query(`
            ALTER TABLE "entries" DROP CONSTRAINT "FK_entries_userId"
        `);

        // Drop entries table and its indexes
        await queryRunner.query(`DROP INDEX "IDX_entries_userId_entryDate"`);
        await queryRunner.query(`DROP INDEX "IDX_entries_userId"`);
        await queryRunner.query(`DROP TABLE "entries"`);

        // Drop users table
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
