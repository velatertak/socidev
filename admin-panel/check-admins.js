import { Admin } from './src/models/Admin.js';

async function checkAdmins() {
  try {
    const admins = await Admin.findAll();
    console.log('Admin users:', admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
  }
}

checkAdmins();