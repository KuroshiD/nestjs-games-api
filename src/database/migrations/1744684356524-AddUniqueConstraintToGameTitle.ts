import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintToGameTitle1744684356524 implements MigrationInterface {
    name = 'AddUniqueConstraintToGameTitle1744684356524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "UQ_0152ed47a9e8963b5aaceb51e77" UNIQUE ("title")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "UQ_0152ed47a9e8963b5aaceb51e77"`);
    }

}
