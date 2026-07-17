import fs from 'fs';

const content = fs.readFileSync('./src/components/SuperAdminView.jsx', 'utf8').toString();
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('block') || line.includes('delete') || line.includes('unblock') || line.includes('admin-users') || line.includes('handleBlock') || line.includes('handleDelete') || line.includes('handleUnblock') || line.includes('callAdminAction')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
