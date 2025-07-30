import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/enums/role.enum';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true,
});

async function seedUser() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  const existing = await userRepo.findOneBy({ email: 'admin@gmail.com' });
  if (existing) {
    console.log('✅ Admin user already exists!');
    return;
  }

  const hashedPassword = await bcrypt.hash('123456', 10);

  const adminUser = userRepo.create({
    fullName: 'Admin User',
    email: 'admin@gmail.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
  });

  await userRepo.save(adminUser);
  console.log('✅ Admin user seeded successfully');

  await AppDataSource.destroy();
}

seedUser().catch((err) => {
  console.error('❌ Failed to seed user:', err);
  process.exit(1);
});
