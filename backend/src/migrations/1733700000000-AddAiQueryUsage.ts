import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiQueryUsage1733700000000 implements MigrationInterface {
    name = 'AddAiQueryUsage1733700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ai_query_usage table
        await queryRunner.query(`
            CREATE TABLE "ai_query_usage" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "queryTime" TIMESTAMP NOT NULL DEFAULT now(),
                "queryType" character varying(50) NOT NULL,
                CONSTRAINT "PK_ai_query_usage_id" PRIMARY KEY ("id")
            )
        `);

        // Create index on userId for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_ai_query_usage_userId" ON "ai_query_usage" ("userId")
        `);

        // Create index on queryTime for faster time-based queries
        await queryRunner.query(`
            CREATE INDEX "IDX_ai_query_usage_queryTime" ON "ai_query_usage" ("queryTime")
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "ai_query_usage"
            ADD CONSTRAINT "FK_ai_query_usage_userId"
            FOREIGN KEY ("userId")
            REFERENCES "users"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key
        await queryRunner.query(`
            ALTER TABLE "ai_query_usage" DROP CONSTRAINT "FK_ai_query_usage_userId"
        `);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_ai_query_usage_queryTime"`);
        await queryRunner.query(`DROP INDEX "IDX_ai_query_usage_userId"`);

        // Drop table
        await queryRunner.query(`DROP TABLE "ai_query_usage"`);
    }
}
