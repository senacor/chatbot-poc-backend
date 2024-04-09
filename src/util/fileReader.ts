//@ts-ignore
import officeParser from 'officeparser';
import { z } from 'zod';

const FileReaderSuccess = z.object({
    content: z.string(),
    error: z.undefined()
});

const FileReaderError = z.object({
    content: z.undefined(),
    error: z.string(),
})

export type FileReaderSuccess = z.infer<typeof FileReaderSuccess>;
export type FileReaderError = z.infer<typeof FileReaderError>;

const stringParser = z.string();

export const fileReader = async (fileName:string, isPath?: boolean): Promise<FileReaderSuccess | FileReaderError> => {
    try{
        const data = await officeParser.parseOfficeAsync(isPath ? fileName : `${process.cwd()}/prompts/${fileName}`);
        const validatedData = stringParser.safeParse(data);
        if(!validatedData.success){
            return {
                content: undefined,
                error: `Error reading the file ${fileName}.\n${validatedData.error.message}`,
            };
        }
        return {
            content: data,
            error: undefined
        };
    }
    catch(error){
        console.error(error);
        if(error instanceof Error){
            return {
                content: undefined,
                error: `Unexpected error reading the file ${fileName}.\n${error.stack}`,
            };
        }
        return {
            content: undefined,
            error: `Unexpected error reading prompt file ${fileName}`,
        };
    }
}

export const parseFileReaderResponse = (data: FileReaderSuccess | FileReaderError): data is FileReaderSuccess => {
    return FileReaderSuccess.safeParse(data).success;
}