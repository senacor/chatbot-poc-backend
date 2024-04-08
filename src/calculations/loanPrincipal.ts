import calcMonthlyInterestRate from "./monthlyInterestRate.js"
interface CalculateLoanAmountArgs {
    monthlyInstallment: number;
    interestRate: number;
    time: number;
}

const calculateLoanAmount = (args: CalculateLoanAmountArgs) => {
    const monthlyInterestRate = calcMonthlyInterestRate(args.interestRate);
    const monthlyInterestRateTransitTime = (1 + monthlyInterestRate) ** (args.time * 12);
    return (args.monthlyInstallment * (monthlyInterestRateTransitTime - 1)) / (monthlyInterestRateTransitTime * monthlyInterestRate);
}
export default calculateLoanAmount;