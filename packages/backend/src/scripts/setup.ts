import readline from 'node:readline';
import { initializeDatabase } from '../config/database';
import { UserModel } from '../models/User';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const setup = async () => {
  console.log('\n=== OTP Manager - Initial Setup ===\n');

  await initializeDatabase();

  const { data: existingUsers } = await UserModel.findAll();

  if (existingUsers.length > 0) {
    console.log('Users already exist in the database.');
    const proceed = await question('Do you want to create another admin user? (yes/no): ');

    if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('\nCreate the first admin user:\n');

  const username = await question('Enter admin username: ');

  if (!username || username.trim().length === 0) {
    console.log('Error: Username cannot be empty.');
    rl.close();
    return;
  }

  const existingUser = await UserModel.findByUsername(username.trim());
  if (existingUser) {
    console.log(`Error: User "${username}" already exists.`);
    rl.close();
    return;
  }

  const password = await question('Enter admin password: ');

  if (!password || password.length < 6) {
    console.log('Error: Password must be at least 6 characters long.');
    rl.close();
    return;
  }

  try {
    const admin = await UserModel.create({
      username: username.trim(),
      password,
      role: 'admin',
    });

    console.log('\n✓ Admin user created successfully!');
    console.log(`  Username: ${admin.username}`);
    console.log(`  Role: ${admin.role}`);
    console.log('\nYou can now start the server and login with these credentials.\n');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }

  rl.close();
};

setup();
