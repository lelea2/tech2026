function topThreeCompanies(companies, profits) {
  const totals = new Map();

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const profit = profits[i];

    totals.set(
      company,
      (totals.get(company) || 0) + profit
    );
  }

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([company, totalProfit]) => ({
      company,
      totalProfit
    }));
}

// Example usage:
const companies = [
  "CompanyA",
  "CompanyB",
  "CompanyA",
  "CompanyC",
  "CompanyB",
  "CompanyD"
];
const profits = [100, 200, 150, 300, 250, 400];

console.log(topThreeCompanies(companies, profits));
// Output: [
//   { company: 'CompanyD', totalProfit: 400 },
//   { company: 'CompanyC', totalProfit: 300 },
//   { company: 'CompanyB', totalProfit: 450 }
// ]

// Time complexity: O(n log n) - due to sorting the entries
// Space complexity: O(n) - for storing the totals in a Map