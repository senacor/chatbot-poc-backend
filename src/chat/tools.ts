import { ChatCompletionTool } from "openai/resources";
import calculateLoanTimeInYears from "../calculations/loanTime.js";
import calculateLoanPrincipal from "../calculations/loanPrincipal.js";

interface ChatFunction {
    [name: string]: {
        definition: ChatCompletionTool;
        fn: (args: any) => number;
    }
}

const tools: ChatFunction = {
    calculateLoanTerm: {
        fn: calculateLoanTimeInYears,
        definition: {
            type: 'function',
            function: {
                name: 'calculateLoanTerm',
                description: 'Calculates loan term (in years) based on the given loan amount, interest rate and monthly installment.',
                parameters: {
                    type: 'object',
                    properties: {
                        principal: {
                            type: 'number',
                            description: 'Principal of the loan in euro (€)',
                        },
                        monthlyInstallment: {
                            type: 'number',
                            description: 'Monthly installment in euro (€)',
                        },
                        interestRate: {
                            type: 'number',
                            description: 'Interest rate estimated by the bank, default value is 3,2',
                        }
                    },
                    required: [
                        'principal',
                        'monthlyInstallment',
                        'interestRate'
                    ]
                    
                }
            },
        }
    },
    calculateLoanPrincipal: {
        fn: calculateLoanPrincipal,
        definition: {
            type: 'function',
            function: {
                name: 'calculateLoanPrincipal',
                description: 'Calculate loan principal based on the given monthly installment, time and interest rate.',
                parameters: {
                    type: 'object',
                    properties: {
                        time: {
                            type: 'number',
                            description: 'Time of the loan',
                        },
                        monthlyInstallment: {
                            type: 'number',
                            description: 'Monthly installment in euro (€)',
                        },
                        interestRate: {
                            type: 'number',
                            description: 'Interest rate estimated by the bank, default value is 3,2',
                        }   
                    },
                    required: [
                        'time',
                        'monthlyInstallment',
                        'interestRate',
                    ]
                }
            }
        }
    }
}

export default tools;