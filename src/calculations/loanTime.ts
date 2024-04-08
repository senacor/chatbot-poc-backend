import calcMonthlyInterestRate from "./monthlyInterestRate.js";
interface CalculateLoanTermInYearsArguments {
    principal: number;
    monthlyInstallment: number;
    interestRate: number;
}

const calculateLoanTimeInYears = (args: CalculateLoanTermInYearsArguments) => {
    const percentagePerMonth = calcMonthlyInterestRate(args.interestRate);
    return (-1 * Math.log(1 - (args.principal / args.monthlyInstallment) * percentagePerMonth) / Math.log(percentagePerMonth + 1)) / 12
}
export default calculateLoanTimeInYears;