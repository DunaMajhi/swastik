require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Attendance = require('./models/Attendance');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing
  await User.deleteMany({});
  await Lead.deleteMany({});
  await Attendance.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Admin Swastik',
    email: 'admin@swastikforce.com',
    password: 'admin123',
    role: 'admin',
    phone: '9800000001',
    department: 'Management',
    employeeId: 'ADM-001'
  });

  // Create employees
  const employees = await User.create([
    { name: 'Rahul Sharma', email: 'rahul@swastikforce.com', password: 'emp123', role: 'employee', phone: '9800000002', department: 'Sales', employeeId: 'EMP-001', target: 500000 },
    { name: 'Priya Singh', email: 'priya@swastikforce.com', password: 'emp123', role: 'employee', phone: '9800000003', department: 'Sales', employeeId: 'EMP-002', target: 400000 },
    { name: 'Amit Kumar', email: 'amit@swastikforce.com', password: 'emp123', role: 'employee', phone: '9800000004', department: 'Sales', employeeId: 'EMP-003', target: 600000 },
    { name: 'Kavita Patel', email: 'kavita@swastikforce.com', password: 'emp123', role: 'employee', phone: '9800000005', department: 'Marketing', employeeId: 'EMP-004', target: 300000 },
    { name: 'Vijay Mehta', email: 'vijay@swastikforce.com', password: 'emp123', role: 'employee', phone: '9800000006', department: 'Sales', employeeId: 'EMP-005', target: 450000 },
  ]);

  // Create sample leads
  const statuses = ['new', 'contacted', 'in-progress', 'proposal', 'closed-won', 'closed-lost'];
  const products = ['Solar Panel 5kW', 'Solar Panel 10kW', 'Battery Backup', 'Solar Pump', 'LED Street Light'];
  const sources = ['cold-call', 'referral', 'walk-in', 'online', 'other'];

  const leads = [];
  for (let i = 0; i < 40; i++) {
    const emp = employees[i % employees.length];
    const status = statuses[i % statuses.length];
    leads.push({
      assignedTo: emp._id,
      assignedBy: admin._id,
      clientName: `Client ${i + 1}`,
      clientPhone: `98000${10000 + i}`,
      product: products[i % products.length],
      amount: Math.floor(Math.random() * 200000) + 50000,
      status,
      priority: ['low', 'medium', 'high'][i % 3],
      source: sources[i % sources.length],
      closedAt: status.startsWith('closed') ? new Date() : null,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }
  await Lead.insertMany(leads);

  // Create attendance for today
  const today = new Date().toISOString().split('T')[0];
  for (const emp of employees.slice(0, 3)) {
    await Attendance.create({
      userId: emp._id,
      date: today,
      checkInTime: new Date(new Date().setHours(9, 0, 0)),
      checkInLat: 28.6139 + (Math.random() - 0.5) * 0.01,
      checkInLng: 77.2090 + (Math.random() - 0.5) * 0.01,
      checkInAddress: 'New Delhi Office',
      status: 'present'
    });
  }

  console.log('✅ Seed complete!');
  console.log('👑 Admin: admin@swastikforce.com / admin123');
  console.log('👤 Employee: rahul@swastikforce.com / emp123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
