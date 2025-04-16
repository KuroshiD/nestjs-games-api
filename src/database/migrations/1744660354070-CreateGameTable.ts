import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGameTable1744660354070 implements MigrationInterface {
    name = 'CreateGameTable1744660354070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "platforms" text, "releaseDate" date, "rating" double precision, "imageUrl" character varying, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "game"`);
    }

}
