import { z } from "zod";
import { makeGetEndpoint } from "../middleware/validation/makeGetEndpoint.js";
import { getUserVisibleMessages } from "../util/messageStore.js";
import { IDENTITY_HEADER } from "./index.js";

//TODO: Rework type inference of fileReader
export const init = makeGetEndpoint(z.any(), async (_request, response) => {
    const identity = _request.header(IDENTITY_HEADER);
    if (!identity) {
        return response.status(400).send(`Missing ${IDENTITY_HEADER} header.`)
    }
    return response
        .status(200)
        .send(getUserVisibleMessages(identity));
});