const fs = require('fs');
const filePath = 'd:/selectt/admin/src/pages/BookedCars.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add column header after Status
const oldHeader = `<th className="px-6 py-4">Status</th>\n                     <th className="px-6 py-4">Actions</th>`;
const newHeader = `<th className="px-6 py-4">Status</th>\n                     <th className="px-6 py-4">Loan Interest</th>\n                     <th className="px-6 py-4">Actions</th>`;

if (content.includes(oldHeader)) {
  content = content.replace(oldHeader, newHeader);
  console.log('Header column added.');
} else {
  console.log('WARNING: Could not find header target. Looking for alternative...');
  // Try with different quote style
  const oldHeader2 = '<th className="px-6 py-4">Status</th>';
  const idx = content.indexOf(oldHeader2);
  console.log('Index of Status header:', idx);
}

// 2. Add cell before Actions cell - look for the actions td
const oldStatusCell = `<td className="px-6 py-4">\n                         <span className={`;
const newStatusCell = `<td className="px-6 py-4" style={{minWidth:'120px'}}>\n                         <span className={`;

// Actually, let's look for a pattern to add Loan Interest cell
// We need to add a cell between Status and Actions cells
const oldActionsCell = `<td className="px-6 py-4">\n                          <div className="flex items-center gap-2">`;
const newLoanCell = `<td className="px-6 py-4">\n                          {b.interested_in_loan ? (\n                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">\n                              ✓ Interested\n                            </span>\n                          ) : (\n                            <span className="text-gray-400 text-xs font-medium">—</span>\n                          )}\n                        </td>\n                        <td className="px-6 py-4">\n                          <div className="flex items-center gap-2">`;

if (content.includes(oldActionsCell)) {
  content = content.replace(oldActionsCell, newLoanCell);
  console.log('Loan Interest cell added.');
} else {
  console.log('WARNING: Could not find actions cell target.');
  // Debug: print portion of content
  const idx2 = content.indexOf('flex items-center gap-2');
  console.log('Found flex items at index:', idx2);
  if (idx2 > -1) {
    console.log('Context:', content.substring(idx2 - 100, idx2 + 100));
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File written.');
