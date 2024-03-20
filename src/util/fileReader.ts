//@ts-ignore
import officeParser from 'officeparser';

export const fileReader = async (fileName:string): Promise<{data: string, error: undefined} | {data: undefined, error: Error}> => {
    try{
        const data = await officeParser.parseOfficeAsync(`${process.cwd()}/prompts/${fileName}`);
        if(!data){
            throw Error('File read but no prompt data found');
        }
        return {
            data,
            error: undefined
        };
    }
    catch(error){
        if(error instanceof Error){
            return {
                data: undefined,
                error
            };
        }
        console.log(error);
        return {
            data: undefined,
            error: new Error(`Something went wrong reading the prompt file. Original error: ${error}`)
        };
    }
}


export const hasErrors = (
    fileObj: {data: string, error: undefined} | {data: undefined, error: Error}
    ): fileObj is {data: undefined, error: Error} => {
        return fileObj.error !== undefined
}