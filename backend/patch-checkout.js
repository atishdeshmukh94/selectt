const fs = require('fs');
const filePath = 'd:/selectt/frontend/src/pages/CheckoutPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the uncontrolled checkbox with a controlled one
const oldCheckbox = `<input type="checkbox" className="w-5 h-5 accent-[#0C1B33] border-slate-300 rounded cursor-pointer" />`;
const newCheckbox = `<input
                      type="checkbox"
                      id="interested_in_loan"
                      checked={interestedInLoan}
                      onChange={e => setInterestedInLoan(e.target.checked)}
                      className="w-5 h-5 accent-[#0C1B33] border-slate-300 rounded cursor-pointer"
                    />`;

if (content.includes(oldCheckbox)) {
  content = content.replace(oldCheckbox, newCheckbox);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Checkbox updated.');
} else {
  console.log('ERROR: Could not find target checkbox text.');
  console.log('Looking for:', oldCheckbox);
}
