import calcMonthlyInterestRate from "./monthlyInterestRate.js"
interface CalculateLoanAmountArgs {
    monthlyRate: number;
    interestRate: number;
    transitTime: number;
}

const calculateLoanAmount = (args: CalculateLoanAmountArgs) => {
    const monthlyInterestRate = calcMonthlyInterestRate(args.interestRate);
    const monthlyInterestRateTransitTime = (1 + monthlyInterestRate) ** (args.transitTime * 12);
    return (args.monthlyRate * (monthlyInterestRateTransitTime - 1)) / (monthlyInterestRateTransitTime * monthlyInterestRate);
}
export default calculateLoanAmount;