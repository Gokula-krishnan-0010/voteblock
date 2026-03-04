import bcrypt from 'bcrypt';

async function main() {
  // New user data
  const email = 'sesharudh.0422@gmail.com'; // test email
  const password = 'sesharudh123'; // test password

  // Hash the password (await the Promise)
  const hash = await bcrypt.hash(password, 12);

  console.log(`User ${email} hash: ${hash}`);
}

// Call the main function
main().catch(err => console.error(err));
