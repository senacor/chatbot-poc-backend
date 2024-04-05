import calcMonthlyInterestRate from "./monthlyInterestRate.js";
interface CalculateLoanTermInYearsArguments {
    amount: number;
    monthlyRate: number;
    interestRate: number;
}

const calculateLoanTermInYears = (args: CalculateLoanTermInYearsArguments) => {
    const percentagePerMonth = calcMonthlyInterestRate(args.interestRate);
    return (-1 * Math.log(1 - (args.amount / args.monthlyRate) * percentagePerMonth) / Math.log(percentagePerMonth + 1)) / 12
}
export default calculateLoanTermInYears;