const fs = require('fs');
const path = require('path');

// Check if the database directory exists and is writable
const dbDir = path.join(__dirname, '../database');
const dbPath = path.join(dbDir, 'store.db');

console.log('Database directory:', dbDir);
console.log('Database file path:', dbPath);

// Check if directory exists
if (fs.existsSync(dbDir)) {
    console.log('✓ Database directory exists');
    
    // Check permissions
    try {
        fs.accessSync(dbDir, fs.constants.W_OK);
        console.log('✓ Database directory is writable');
    } catch (err) {
        console.log('✗ Database directory is not writable:', err.message);
    }
} else {
    console.log('✗ Database directory does not exist');
}

// Check file permissions
if (fs.existsSync(dbPath)) {
    console.log('✓ Database file exists');
    
    try {
        fs.accessSync(dbPath, fs.constants.W_OK);
        console.log('✓ Database file is writable');
    } catch (err) {
        console.log('✗ Database file is not writable:', err.message);
    }
} else {
    console.log('! Database file does not exist yet');
}

// Try to create a simple test file to see if we have write permissions
const testPath = path.join(dbDir, 'test.txt');
try {
    fs.writeFileSync(testPath, 'test');
    console.log('✓ Can write to database directory');
    fs.unlinkSync(testPath); // Remove test file
    console.log('✓ Cleaned up test file');
} catch (err) {
    console.log('✗ Cannot write to database directory:', err.message);
}