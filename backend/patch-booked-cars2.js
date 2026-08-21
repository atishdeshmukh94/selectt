const fs = require('fs');
const filePath = 'd:/selectt/admin/src/pages/BookedCars.tsx';
let content = fs.readFileSync(filePath, 'utf8');

let changed = false;

// Add column header: Insert "Loan Interest" th before "Actions" th
content = content.replace(
  /<th className="px-6 py-4">Actions<\/th>/,
  `<th className="px-6 py-4">Loan Interest</th>\n                     <th className="px-6 py-4">Actions</th>`
);

// Add table cell: Insert Loan Interest td right before the Actions td
// The Actions td starts with <td className="px-6 py-4"> followed by <div className="flex items-center gap-2">
content = content.replace(
  /<td className="px-6 py-4">\s*<div className="flex items-center gap-2">/,
  `<td className="px-6 py-4">\n                          {b.interested_in_loan ? (\n                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">✓ Interested</span>\n                          ) : (\n                            <span className="text-gray-400 text-xs font-medium">—</span>\n                          )}\n                        </td>\n                        <td className="px-6 py-4">\n                          <div className="flex items-center gap-2">`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patch applied successfully.');

// Verify the changes
if (content.includes('Loan Interest')) {
  console.log('VERIFIED: Loan Interest column header found.');
} else {
  console.log('ERROR: Loan Interest header not found after patch.');
}
if (content.includes('interested_in_loan')) {
  console.log('VERIFIED: interested_in_loan cell found.');
} else {
  console.log('ERROR: interested_in_loan cell not found after patch.');
}
