// Realistic-ish plain-text fixtures mimicking the flattened text a PDF
// text-extraction library (pdf-parse) would hand back for a consumer
// credit report. These are NOT copies of real bureau layouts (which are
// proprietary and vary by version) — they're representative of the
// label:value / section-header structure the extractors in this
// directory are built to catch, used for manual eyeballing only (see
// run-fixtures.ts). Not a substitute for testing against real PDFs.

export const EXPERIAN_SAMPLE = `
Experian
www.experian.com
Credit Report prepared for John Q. Consumer

PERSONAL CREDIT REPORT

Credit Score: 642
FICO Score 642 based on Experian data

ACCOUNTS

CAPITAL ONE BANK USA NA
Account Type: Credit Card
Account Status: Open
Balance: $1,245
Credit Limit: $3,000
Opened Date: 03/2019
Payment Status: Current
Payment History: 111111111111

WELLS FARGO DEALER SERVICES
Account Type: Auto Loan
Account Status: Open
Balance: $18,450
Opened Date: 07/2021
Payment Status: Current

COLLECTIONS

PORTFOLIO RECOVERY ASSOCIATES
Original Creditor: Citibank
Collection Agency: Portfolio Recovery Associates
Amount: $540
Opened Date: 01/2022
First Delinquency Date: 11/2021
Falls Off Date: 11/2028
Status: Charged Off

INQUIRIES

Chase Bank - 02/10/2024 - Hard Inquiry
Discover - 11/05/2023 - Hard Inquiry

END OF REPORT
`;

export const EQUIFAX_SAMPLE = `
Equifax Information Services LLC
For questions visit equifax.com

Your VantageScore: 705

TRADELINES

SYNCHRONY BANK / AMAZON
Account Type: Retail Card
Account Status: Open
Balance: $320
Credit Limit: $2,500
Opened Date: 05/15/2020
Payment Status: Current

NAVIENT STUDENT LOANS
Account Type: Student Loan
Account Status: Open
Balance: $22,100
Opened Date: 09/2015
Payment Status: Current

INQUIRIES

Toyota Financial - 04/2024 - Hard Inquiry

END OF REPORT
`;

// A deliberately "unrecognized format" fixture — no labeled fields, no
// bureau letterhead, nothing our heuristics can confidently latch onto.
// Exercises the "still parse, just extract nothing" path.
export const UNRECOGNIZED_SAMPLE = `
Some Generic Report Export

Your accounts and balances are summarized below in a format our system
does not recognize. Card ending 1234, roughly two thousand dollars owed,
opened a few years ago. Loan for a car, balance around eighteen grand.

Thanks for using our service.
`;
