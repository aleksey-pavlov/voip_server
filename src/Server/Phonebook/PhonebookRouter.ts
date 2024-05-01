import { Router, Request, Response } from "express";

export function PhonebookRouter(): Router {
    
    let router = Router();

    router.get("/phonebooks", (req: Request, resp: Response) => {

        resp.json([ { "number": 123, "name": "Alex", "Male": "famale", "age": 30 }, { "number": "", "name": "", "Male": "", "age": 0 } ]);

    });

    router.get("/phonebook/:id", (req: Request, resp: Response) => {

    });

    return router;

}