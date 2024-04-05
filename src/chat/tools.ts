import { ChatCompletionTool } from "openai/resources";
import calculateLoanTermInYears from "../calculations/loanTerm.js";
import calculateLoanAmount from "../calculations/loanAmount.js";

interface ChatFunction {
    [name: string]: {
        definition: ChatCompletionTool;
        fn: (args: any) => number;
    }
}

const tools: ChatFunction = {
    calculateLoanTerm: {
        fn: calculateLoanTermInYears,
        definition: {
            type: 'function',
            function: {
                name: 'calculateLoanTerm',
                description: 'Calculates loan term (in years) based on the given loan amount, interest rate and monthly rate.',
                parameters: {
                    type: 'object',
                    properties: {
                        amount: {
                            type: 'number',
                            description: 'Total amount of the loan in euro (€)',
                        },
                        monthlyRate: {
                            type: 'number',
                            description: 'Monthly annuity rate in euro (€)',
                        },
                        interestRate: {
                            type: 'number',
                            description: 'Interest rate estimated by the bank, for example 3,2',
                        }
                    },
                    required: [
                        'amount',
                        'monthlyRate',
                        'interestRate'
                    ]
                    
                }
            },
        }
    },
    calculateLoanAmount: {
        fn: calculateLoanAmount,
        definition: {
            type: 'function',
            function: {
                name: 'calculateLoanAmount',
                description: 'Calculate loan amount based on the given monthly rate, transit time and interest rate.',
                parameters: {
                    type: 'object',
                    properties: {
                        transitTime: {
                            type: 'number',
                            description: 'Transit time of the loan',
                        },
                        monthlyRate: {
                            type: 'number',
                            description: 'Monthly rate in euro (€)',
                        },
                        interestRate: {
                            type: 'number',
                            description: 'Interest rate estimated by the bank, for example 3,2',
                        }   
                    },
                    required: [
                        'transitTime',
                        'monthlyRate',
                        'interestRate',
                    ]
                }
            }
        }
    }
}

export default tools;