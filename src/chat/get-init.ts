import { z } from "zod";
import { makeGetEndpoint } from "../middleware/validation/makeGetEndpoint.js";

//TODO: Rework type inference of fileReader
export const init = makeGetEndpoint(z.any(), async (_request, response) => {

    return response
        .status(200)
        .send([
        {
            role: 'system',
            content: "Ask the user to provide the content of the file they want to chat about. Talk only about the content of the provided file."
        },
        {
            role: "assistant",
            content: "Hallo! Bitte laden Sie die Datei hoch, über die Sie chatten möchten."
        }
    ]);
});