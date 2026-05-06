import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRole1738789300000 implements MigrationInterface {
  name = 'AddUserRole1738789300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const existsResult: Array<{ total: number }> = await queryRunner.query(`
      SELECT COUNT(*) AS total
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'role'
    `);

    const roleExists = Number(existsResult?.[0]?.total ?? 0) > 0;
    if (!roleExists) {
      await queryRunner.query(
        "ALTER TABLE `users` ADD `role` ENUM('ADMIN', 'DELIVERER') NOT NULL DEFAULT 'DELIVERER' AFTER `nombre`",
      );
    }

    const configured = process.env.ADMIN_USER_EMAIL ?? 'admin@fastdelivery.local';
    const adminEmails = configured
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    for (const adminEmail of adminEmails) {
      await queryRunner.query("UPDATE `users` SET `role` = 'ADMIN' WHERE LOWER(`email`) = ?", [adminEmail]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const existsResult: Array<{ total: number }> = await queryRunner.query(`
      SELECT COUNT(*) AS total
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'role'
    `);

    const roleExists = Number(existsResult?.[0]?.total ?? 0) > 0;
    if (roleExists) {
      await queryRunner.query('ALTER TABLE `users` DROP COLUMN `role`');
    }
  }
}
