const { User } = require('./admin-panel/src/models/User.js');
const bcrypt = require('bcryptjs');

async function resetUserPassword() {
  try {
    const newPassword = 'user123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const [updatedRowsCount] = await User.update(
      { password: hashedPassword },
      { where: { email: 'user@socialdev.com' } }
    );
    
    if (updatedRowsCount > 0) {
      console.log('User password reset successfully');
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error resetting user password:', error);
  }
}

resetUserPassword();