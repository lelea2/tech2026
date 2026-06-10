import { useState } from "react";

export default function MortgageCalculator() {
  const [form, setForm] = useState({
    loanAmount: "",
    interestRate: "",
    loanTerm: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function calculateMortgage(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    const principal = Number(form.loanAmount);
    const annualRate = Number(form.interestRate);
    const years = Number(form.loanTerm);

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(annualRate) ||
      !Number.isFinite(years)
    ) {
      setError("Please enter valid numbers only.");
      return;
    }

    if (principal <= 0 || annualRate < 0 || years <= 0) {
      setError("Loan amount and loan term must be greater than 0. Interest rate cannot be negative.");
      return;
    }

    const numberOfPayments = years * 12;
    const monthlyRate = annualRate / 100 / 12;

    let monthlyPayment;

    if (monthlyRate === 0) {
      monthlyPayment = principal / numberOfPayments;
    } else {
      monthlyPayment =
        principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    setResult({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
    });
  }

  const inputClass = "w-full px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded focus:outline-none focus:border-orange-500 text-white placeholder-slate-500";
  const labelClass = "block text-xs text-slate-400 uppercase tracking-wide mb-1";

  return (
    <div className="w-full max-w-sm space-y-6">
      <form onSubmit={calculateMortgage} className="space-y-4">
        <div>
          <label className={labelClass}>Loan amount ($)</label>
          <input
            name="loanAmount"
            value={form.loanAmount}
            onChange={handleChange}
            placeholder="300000"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Annual interest rate (%)</label>
          <input
            name="interestRate"
            value={form.interestRate}
            onChange={handleChange}
            placeholder="6.5"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Loan term (years)</label>
          <input
            name="loanTerm"
            value={form.loanTerm}
            onChange={handleChange}
            placeholder="30"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
        >
          Calculate
        </button>
      </form>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {result && (
        <div className="rounded border border-slate-700 bg-slate-800/50 divide-y divide-slate-700">
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-slate-400">Monthly payment</span>
            <span className="font-medium text-white">${result.monthlyPayment}</span>
          </div>
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-slate-400">Total payment</span>
            <span className="font-medium text-white">${result.totalPayment}</span>
          </div>
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-slate-400">Total interest</span>
            <span className="font-medium text-orange-400">${result.totalInterest}</span>
          </div>
        </div>
      )}
    </div>
  );
}
