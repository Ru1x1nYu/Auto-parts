const jwt = require('koa-jwt')
const Router = require('koa-router');
const router = new Router({prefix: '/users'});
const { find, findById, create, getUsersList, getInfoById, verifyPassword, getInfo, updated, delete: del, login, checkOwner, listFollowing, follow, unfollow, listFollower, checkUserExist } = require('../controllers/users')
const { secret } =require('../config');

const auth = jwt({ secret })
router.get('/', auth, find);
router.get('/getInfo', auth, getInfo)
router.get('/delete', auth, del)
router.get('/getInfoById', auth, getInfoById)
router.get('/getUsersList', auth, getUsersList)
router.post('/verifyPassword', auth, verifyPassword)
router.put('/update', auth, updated);
router.post('/create', create);
router.post('/login', login);


module.exports = router;