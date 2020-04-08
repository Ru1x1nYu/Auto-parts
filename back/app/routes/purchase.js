const jwt = require('koa-jwt')
const Router = require('koa-router');
const router = new Router({prefix: '/purchase'});
const { createPurchase, searchPAndD, getPurchaseList, getInfoById } = require('../controllers/purchase')
const { secret } =require('../config');

const auth = jwt({ secret })
// router.get('/', auth, find);
// router.get('/getInfo', auth, getInfo)
// router.delete('/delete', auth, del)
// router.get('/getInfoById', auth, getInfoById)
router.get('/getPurchaseList', auth, getPurchaseList)
router.post('/searchPAndD', auth, searchPAndD)
// router.post('/verifyPassword', auth, verifyPassword)
// router.post('/update', auth, updated);
router.post('/createPurchase', auth, createPurchase);
// router.post('/login', login);

module.exports = router;