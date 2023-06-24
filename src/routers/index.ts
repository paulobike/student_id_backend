import express, { Router, RouterOptions } from 'express';
import { IndexController } from '../controllers';
import { sendErrorResponse, sendSuccessResponse } from '../utils/sendResponse';

const routerOptions: RouterOptions = {
    mergeParams: true,
    strict: false,
    caseSensitive: true,
}

const router: Router = Router(routerOptions);
const indexController = new IndexController(sendErrorResponse, sendSuccessResponse);

/** DO NESTED ROUTING HERE */
router.get('/', indexController.helloWorld.bind(indexController));

router.use('*', indexController.notFound.bind(indexController));

export default router;