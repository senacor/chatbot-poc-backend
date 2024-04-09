import formidable from 'formidable';
import { IncomingMessage } from 'http';
import fs from 'node:fs/promises';
import { fileReader } from '../util/fileReader.js';

const fileUpload = async (request: IncomingMessage, response: any) => {
    let file: formidable.File | null = null;
    let fileContent: string | null = null;
    try {
        const form = formidable({
            maxFileSize: 5 * 1024 * 1024, //5MB
            maxFiles: 1,
            keepExtensions: true,

        });
        file = (await form.parse(request))[1]?.['file']?.[0] ?? null;
        if (!file) {
            return response.status(400).send('File not present');
        }
        console.log(`File created ${file.filepath}`);
        switch(file.mimetype) {
            case 'text/plain':
                fileContent = await fs.readFile(file.filepath, {encoding: 'utf-8'});
                break;
            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                const fileConversionResult = await fileReader(file.filepath, true);
                fileContent = fileConversionResult.content ?? null;
                if (fileConversionResult.error) {
                    console.error(fileConversionResult.error);
                }
                console.log(fileConversionResult);
                break;
            default:
                throw (`Unsupported file type: ${file?.mimetype}`);
        }
        if (fileContent) {
            return response.status(200).send({
                content: fileContent,
                name: file.originalFilename,
        });
        } else {
            return response.status(400).send('Empty file or failed to extract content');
        }
    } catch (error) {
        console.log(error);
        return response.status(500).send('Failed to process file.');
    } finally {
        try {
            if (file) {
                fs.rm(file.filepath).then(() => console.log(`File removed: ${file?.filepath}`));
            }
        } catch (error) {
            console.log(error);
        }
    }

}
export default fileUpload;