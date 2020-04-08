const Router = require('koa-router')
const router = new Router();
const { index, upload, getHomeCount, getHomeChart, getPartChart, getHomePie, getProfitData } = require('../controllers/home')

router.get('/', index);
router.post('/upload', upload);
router.get('/getHomeCount', getHomeCount);
router.get('/getHomeChart', getHomeChart);
router.get('/getHomePie', getHomePie);
router.get('/part/getPartChart', getPartChart);
router.get('/getProfitData', getProfitData);

module.exports = router