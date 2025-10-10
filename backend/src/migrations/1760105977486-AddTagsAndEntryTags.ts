import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTagsAndEntryTags1760105977486 implements MigrationInterface {
    name = 'AddTagsAndEntryTags1760105977486'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tags table
        await queryRunner.query(`
            CREATE TABLE "tags" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "name" varchar(100) NOT NULL,
                "usageCount" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_tags" PRIMARY KEY ("id")
            )
        `);

        // Create entry_tags table (junction table)
        await queryRunner.query(`
            CREATE TABLE "entry_tags" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "entryId" uuid NOT NULL,
                "tagId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_entry_tags" PRIMARY KEY ("id")
            )
        `);

        // Create unique index on tags (userId, name)
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_tags_userId_name" ON "tags" ("userId", "name")
        `);

        // Create unique index on entry_tags (entryId, tagId)
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_entry_tags_entryId_tagId" ON "entry_tags" ("entryId", "tagId")
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "tags"
            ADD CONSTRAINT "FK_tags_userId"
            FOREIGN KEY ("userId")
            REFERENCES "users"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "entry_tags"
            ADD CONSTRAINT "FK_entry_tags_entryId"
            FOREIGN KEY ("entryId")
            REFERENCES "entries"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "entry_tags"
            ADD CONSTRAINT "FK_entry_tags_tagId"
            FOREIGN KEY ("tagId")
            REFERENCES "tags"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "entry_tags" DROP CONSTRAINT "FK_entry_tags_tagId"`);
        await queryRunner.query(`ALTER TABLE "entry_tags" DROP CONSTRAINT "FK_entry_tags_entryId"`);
        await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "FK_tags_userId"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_entry_tags_entryId_tagId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_tags_userId_name"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "entry_tags"`);
        await queryRunner.query(`DROP TABLE "tags"`);
    }
}
