const fs = require('fs');
const path = require('path');

const iconMap = {
    'bi-house': 'fa-solid fa-chart-line',
    'bi-list': 'fa-solid fa-bars',
    'bi-search': 'fa-solid fa-magnifying-glass',
    'bi-plus-lg': 'fa-solid fa-plus',
    'bi-arrow-left': 'fa-solid fa-arrow-left',
    'bi-person': 'fa-solid fa-user',
    'bi-pencil': 'fa-solid fa-pen',
    'bi-telephone': 'fa-solid fa-phone',
    'bi-briefcase': 'fa-solid fa-briefcase',
    'bi-arrow-clockwise': 'fa-solid fa-rotate',
    'bi-trash': 'fa-solid fa-trash',
    'bi-trash3': 'fa-solid fa-trash',
    'bi-lock': 'fa-solid fa-lock',
    'bi-copy': 'fa-solid fa-copy',
    'bi-people-fill': 'fa-solid fa-users',
    'bi-credit-card': 'fa-solid fa-dollar-sign',
    'bi-x-lg': 'fa-solid fa-xmark',
    'bi-chevron-expand': 'fa-solid fa-sort',
    'bi-person-x': 'fa-solid fa-user-xmark',
    'bi-calendar2-check': 'fa-solid fa-calendar-days',
    'bi-people': 'fa-solid fa-user-injured',
    'bi-person-badge': 'fa-solid fa-id-card',
    'bi-heart-pulse': 'fa-solid fa-notes-medical',
    'bi-calendar3': 'fa-solid fa-calendar-days',
    'bi-person-fill': 'fa-solid fa-user',
    'bi-gear': 'fa-solid fa-gear',
    'bi-box-arrow-left': 'fa-solid fa-right-from-bracket',
    'bi-bell-fill': 'fa-solid fa-bell',
    'bi-chevron-left': 'fa-solid fa-chevron-left',
    'bi-chevron-right': 'fa-solid fa-chevron-right',
    'bi-tooth': 'fa-solid fa-tooth',
    'bi-envelope': 'fa-solid fa-envelope',
    'bi-eye-slash': 'fa-solid fa-eye-slash',
    'bi-box-arrow-in-right': 'fa-solid fa-right-to-bracket',
    'bi-eye': 'fa-solid fa-eye',
    'bi-check2': 'fa-solid fa-circle-check',
    'bi-chevron-up': 'fa-solid fa-chevron-up',
    'bi-chevron-down': 'fa-solid fa-chevron-down',
    'bi-clock': 'fa-solid fa-clock-rotate-left',
    'bi-x-circle': 'fa-solid fa-circle-xmark',
    'bi-calendar-x': 'fa-solid fa-calendar-xmark',
    'bi-calendar2-plus': 'fa-solid fa-calendar-plus',
    'bi-exclamation-triangle': 'fa-solid fa-triangle-exclamation',
    'bi-person-lines-fill': 'fa-solid fa-address-book',
    'bi-person-plus': 'fa-solid fa-user-plus',
    'bi-exclamation-triangle-fill': 'fa-solid fa-triangle-exclamation'
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            if (dirPath.endsWith('.html') || dirPath.endsWith('.js')) {
                callback(dirPath);
            }
        }
    });
}

const frontendDir = 'c:\\\\Users\\\\João\\\\Documents\\\\Unip-Acadêmico\\\\JetBrains_codes\\\\Gestao-Clinica-Odontologica\\\\dentus-clinic\\\\Frontend';

walkDir(frontendDir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace the CDN link
    if (filePath.endsWith('.html')) {
        content = content.replace(
            /<link[^>]*bootstrap-icons[^>]*>/gi,
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>'
        );
    }

    // Replace icon classes in standard HTML format: class="bi bi-something" or similar
    // Using a regex to match the classes.
    const biRegex = /bi\\s+(bi-[\\w-]+)/g;
    content = content.replace(biRegex, (match, p1) => {
        return iconMap[p1] || p1; // if found in map, replace with fa classes, else keep as is (though bi will be removed)
    });

    // Sometimes only 'bi-something' is used (e.g. in JS strings or classes added dynamically without 'bi')
    // Or sometimes it's `<i class="bi-something"></i>`.
    // Let's do a more robust replacement for any remaining 'bi-*' that was not prefixed with 'bi '
    // We iterate over keys and replace them globally, but only if they are complete words
    for (const [biClass, faClass] of Object.entries(iconMap)) {
        // match bi-class as a whole word, optionally prefixed by 'bi ' which might have been missed
        // But wait, the previous replace already removed the 'bi ' part.
        // Let's just run a replace for all whole-word bi-classes.
        const regex = new RegExp(`\\\\b${biClass}\\\\b`, 'g');
        content = content.replace(regex, faClass);
    }

    // Clean up any stray "bi " classes that might have been left alone if they didn't match the first regex.
    // E.g. class="bi fa-solid fa-chart-line" -> class="fa-solid fa-chart-line"
    content = content.replace(/\\bbi\\s+(fa-solid)/g, '$1');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
});

