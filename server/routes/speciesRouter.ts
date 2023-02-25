import express from 'express';
import { speciesGet, speciesGetById } from 'handlers/speciesHandler';
import { handlerWrapper } from '../utils/utils';

const router = express.Router();
const routerWrapper = express.Router();

router.get('/', handlerWrapper(speciesGet));
router.get('/:species_id', handlerWrapper(speciesGetById));

routerWrapper.use('/species', router);
routerWrapper.use('/v2/species', router);

export default routerWrapper;
