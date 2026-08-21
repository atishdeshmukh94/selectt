const fs = require('fs');

// Add Banner Management to sidebar
const sidebarPath = 'd:/selectt/admin/src/layout/AppSidebar.tsx';
let content = fs.readFileSync(sidebarPath, 'utf8');

const oldEntry = `  {
    icon: <TableIcon />,
    name: "Report - Payment Transaction",
    path: "/reports/payments",
    role: "admin",
  },`;

const newEntry = `  {
    icon: <TableIcon />,
    name: "Report - Payment Transaction",
    path: "/reports/payments",
    role: "admin",
  },
  {
    icon: <PageIcon />,
    name: "Banner",
    path: "/banners",
    role: "admin",
  },`;

if (content.includes(oldEntry)) {
  content = content.replace(oldEntry, newEntry);
  fs.writeFileSync(sidebarPath, content, 'utf8');
  console.log('SUCCESS: Sidebar Banner link added.');
} else {
  console.log('Could not find sidebar target. Trying regex...');
  // Regex fallback
  content = content.replace(
    /(\s*\{\s*icon:\s*<TableIcon\s*\/>,\s*name:\s*"Report - Payment Transaction",[\s\S]*?role:\s*"admin",\s*\},)/,
    `$1\n  {\n    icon: <PageIcon />,\n    name: "Banner",\n    path: "/banners",\n    role: "admin",\n  },`
  );
  fs.writeFileSync(sidebarPath, content, 'utf8');
  if (content.includes('"Banner"')) {
    console.log('SUCCESS (regex): Sidebar Banner link added.');
  } else {
    console.log('ERROR: Could not add sidebar link.');
  }
}
