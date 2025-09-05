import { Admin } from './src/models/Admin.js';
import bcrypt from 'bcryptjs';

async function resetAdminPassword() {
  try {
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const [updatedRowsCount] = await Admin.update(
      { password: hashedPassword },
      { where: { email: 'admin@socialdev.com' } }
    );
    
    if (updatedRowsCount > 0) {
      console.log('Admin password reset successfully');
    } else {
      console.log('Admin not found');
    }
  } catch (error) {
    console.error('Error resetting admin password:', error);
  }
}

resetAdminPassword();