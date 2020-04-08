const jwt = require('koa-jwt')
const Router = require('koa-router');
const router = new Router({prefix: '/parts'});
const { create, getPartsList, getNotice, getPartsReport, getDateReport, searchDateReport, searchPartsReport, searchPAndD, getInfoById, getPAndDList, updated, delete: del } = require('../controllers/parts')
const { secret } =require('../config');

const auth = jwt({ secret })
// router.get('/', auth, find);
// router.get('/getInfo', auth, getInfo)
router.delete('/delete', auth, del)
router.get('/getInfoById', auth, getInfoById)
router.get('/getNotice', auth, getNotice)
router.get('/getPartsList', auth, getPartsList)
router.get('/getPartsReport', auth, getPartsReport)
router.get('/getDateReport', auth, getDateReport)
router.get('/getPAndDList', auth, getPAndDList)
router.post('/searchPAndD', auth, searchPAndD)
router.post('/searchPartsReport', auth, searchPartsReport)
router.post('/searchDateReport', auth, searchDateReport)
// router.post('/verifyPassword', auth, verifyPassword)
router.put('/update', auth, updated);
router.post('/create', auth, create);
// router.post('/login', login);

module.exports = router;