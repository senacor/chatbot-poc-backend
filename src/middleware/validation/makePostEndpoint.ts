import { Request, Response } from "express"
import { z } from "zod"

export const makePostEndpoint = <TBody>(
    schema: z.Schema<TBody>,
    callback: (
        req: Request<any, any, TBody, any>,
        res: Response
    ) => void
) => (req:Request, res:Response) => {
    
    const bodyValidation = schema.safeParse(req.body);
    if(!bodyValidation.success){
        return res
            .status(400)
            .send({
                status: 400,
                message: bodyValidation.error.message
            });
    }
    return callback(req, res);
}