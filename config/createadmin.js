const Admin = require('../Schema/Schema_setting_admin/models/adminmodels');  // ปรับ path ตามโครงสร้างโปรเจคของคุณ
const createAdmin = async () => {
    try {
        const admin = await Admin.findOne({ username: 'admin' });
        if (!admin) {
            const newAdmin = new Admin({
                username: 'admin',
                password: 'adminpassword',  // เก็บรหัสผ่านเป็น plain text
                email: 'admin@example.com',
                role: 'admin'
            });
            await newAdmin.save();
            console.log('Admin account created with username: admin');
        } else {
            console.log('Admin account already exists');
        }
    } catch (error) {
        console.error('Error creating admin account:', error);
    }
};

module.exports = createAdmin;