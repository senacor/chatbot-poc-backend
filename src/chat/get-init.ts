import { z } from "zod";
import { makeGetEndpoint } from "../middleware/validation/makeGetEndpoint.js";
import { addMessages, getUserVisibleMessages } from "../util/messageStore.js";
import { IDENTITY_HEADER } from "./index.js";

//TODO: Rework type inference of fileReader
export const init = makeGetEndpoint(z.any(), async (_request, response) => {
    const identity = _request.header(IDENTITY_HEADER);
    if (!identity) {
        return response.status(400).send(`Missing ${IDENTITY_HEADER} header.`)
    }
    addMessages(identity, [
        {
            role: 'system',
            content: "Ask the user to provide the content of the file they want to chat about. Talk only about the content of the provided file."
        },
        {
            role: "assistant",
            content: "Hallo! Bitte laden Sie die Datei hoch, über die Sie chatten möchten."
        }
    ]);
    return response
        .status(200)
        .send(getUserVisibleMessages(identity));
});