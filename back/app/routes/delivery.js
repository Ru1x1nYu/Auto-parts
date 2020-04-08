const jwt = require('koa-jwt')
const Router = require('koa-router');
const router = new Router({prefix: '/delivery'});
const { createDelivery, searchPAndD, getDeliveryList, getInfoById, updated, delete: del } = require('../controllers/delivery')
const { secret } =require('../config');

const auth = jwt({ secret })
// router.get('/', auth, find);
// router.get('/getInfo', auth, getInfo)
// router.delete('/delete', auth, del)
// router.get('/getInfoById', auth, getInfoById)
router.get('/getDeliveryList', auth, getDeliveryList)
router.post('/searchPAndD', auth, searchPAndD)
// router.post('/verifyPassword', auth, verifyPassword)
// router.post('/update', auth, updated);
router.post('/createDelivery', auth, createDelivery);
// router.post('/login', login);

module.exports = router;