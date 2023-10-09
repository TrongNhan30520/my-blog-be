import { DataSourceOptions, DataSource } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 33061,
  username: 'root',
  password: '12345',
  database: 'blog-nestjs',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  migrationsTableName: 'custom_migration_table',
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
