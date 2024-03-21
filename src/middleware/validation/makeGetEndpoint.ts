import { Request, Response } from "express"
import { z } from "zod"

export const makeGetEndpoint = <TQuery>(
    schema: z.Schema<TQuery>,
    callback: (
        req: Request<any, any, any, TQuery>,
        res: Response
    ) => void
) => (req:Request, res:Response) => {
    
    const bodyValidation = schema.safeParse(req.query);
    if(!bodyValidation.success){
        return res
            .status(400)
            .send({
                status: 400,
                message: bodyValidation.error.message
            });
    }
    return callback(req as any, res);
}