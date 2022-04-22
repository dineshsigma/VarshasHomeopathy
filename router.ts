import * as express from 'express'

import { v4 as uuid } from 'uuid';
import cors from 'cors'


class Router{

    
    constructor(server: express.Express) {
        const router = express.Router()



        router.get('/', (req: express.Request, res: express.Response) => {
            res.json({
                message: `"dhfvbhsvfhjdbvhjvhjdvhjvhj`
            })
        })


    }


}


export default Router