/**
 * Export all seeded users to a JSON file for inspection.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

async function exportUsers() {
    await mongoose.connect(process.env.DATABASE_URL);
    const users = await User.find({}).select('+password').lean();
    
    const output = users.map((u, i) => ({
        '#': i + 1,
        name: u.name,
        email: u.email,
        anonymousName: u.anonymousName,
        primaryGoal: u.primaryGoal,
        interests: (u.secondaryGoals || []).join(', '),
        location: u.location,
        role: u.role,
        picture: u.picture,
        friendsCount: (u.friends || []).filter(f => f.accepted).length,
        pendingRequests: (u.friendRequests || []).length,
        createdAt: u.createdAt?.toISOString().split('T')[0],
    }));

    // Write JSON
    const outPath = path.join(__dirname, 'users_export.json');
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
    
    // Print as table to console
    console.log(JSON.stringify(output));

    await mongoose.connection.close();
}

exportUsers();
