const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const searchTerms = ['transactions', 'categories', 'onAddCategory', 'onAddLaunch', 'handleAddCategory', 'handleAddLaunch'];

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    for (const term of searchTerms) {
                        if (line.includes(term)) {
                            console.log(`${path.basename(filePath)}:${idx+1}: ${line.trim()}`);
                            break;
                        }
                    }
                });
            } catch (e) {
                console.error(`Error reading ${filePath}: ${e.message}`);
            }
        }
    }
}

walk(srcDir);
