const jsonwebtoken = require('jsonwebtoken')
const { secret } = require('../config')
const User = require('../models/users');
const clonedeep = require('clonedeep')

class UsersCtl {
  async find(ctx) {
    ctx.set('Allow','GET, POST')
    // ctx.set('Content-Type', 'application/x-www-form-urlencoded')  
    ctx.body = await User.find();
  }

  async findById(ctx) {
    const { fields = '' } = ctx.query;
    const selectFields = fields&&fields.split(';').filter(item => item).map(item => ' +'+item).join('');
    const user = await User.findById(ctx.params.id).select(selectFields);
    if (!user) {
      ctx.throw(409,'用户不存在');
    }
    ctx.body = user
  }

  async verifyPassword(ctx) {
    const { password } = ctx.request.body
    const {_id} = ctx.state.user
    const user = await User.findById(_id, {password:1});
    if (!user) {
      ctx.throw(409,'用户不存在');
    }
    const dbPassword = user.password
    if (dbPassword === password) {
      ctx.body = {
        code: 200,
        mes: '密码验证正确',
        data:''
      }
    } else {
      ctx.throw(403, '密码不正确，请重新输入')
    }
  }

  async getUsersList(ctx) {
    ctx.set('Allow','GET, POST')
    // ctx.set('Content-Type', 'application/x-www-form-urlencoded')
    let { access } = ctx.state.user
    if (!access.includes('super_admin')) {
      ctx.throw(403, '没有超级管理员权限')
    }
    ctx.body = await User.find();
  }

  async getInfoById(ctx) {
    // const { token } = ctx.query
    let { id } = ctx.request.query
    const user = await User.findById(id).select('+userName +_id +access +avatar +access');
    if (!user) {
      ctx.throw(409,'用户不存在');
    }
    ctx.status = 200
    ctx.body = {
      code: 200,
      mes: '请求用户数据成功',
      data: user
    }
  }

  async getInfo(ctx) {
    // const { token } = ctx.query
    let {_id} = ctx.state.user
    const user = await User.findById(_id).select('+userName +_id +access +avatar +access');
    if (!user) {
      ctx.throw(409,'用户不存在');
    }
    const {userName} = user
    let newToken = jsonwebtoken.sign({_id, userName}, secret, {expiresIn: '7d'});

    const data = Object.assign(user.toObject(), {token :newToken})

    ctx.status = 200
    ctx.body = {
      code: 200,
      mes: '请求用户数据成功',
      data
    }
  }

  async create(ctx) {
    ctx.verifyParams({
      userName: { type: 'string', required: true },
      password: { type: 'string', required: true, select: false },
      sex: { type: 'string', required: false },
      age: { type: 'string', required: false },
      // deparment: { type: 'string', required: false },
      phone: { type: 'string', required: false },
      email: { type: 'string', required: false },
      access: { type: 'array', required: false, select: false },
      // IDCard: { type: 'string', required: false, select: false }
    });
    let {authorization} = ctx.headers
    authorization = authorization.split(' ')[1]
    const {access} = jsonwebtoken.verify(authorization, secret)
    if (!access.includes('super_admin')) {
      ctx.throw(403, '用户没有权限')
    }
    const { userName } = ctx.request.body
    const repeatedUser = await User.findOne({ userName })
    if(repeatedUser) {
      ctx.throw(409,'用户已经存在')
    }
    const user = await new User(ctx.request.body).save();
    ctx.body = {
      code: 200,
      mes: '添加用户成功!',
      data: user
    };
  }

  async checkOwner (ctx, next) {
    if(ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, '没有权限进行操作');
    }
    await next();
  }
  async updated(ctx) {
    ctx.verifyParams({
      userName: { type: 'string', required: true },
      password: { type: 'string', required: true, select: false },
      sex: { type: 'string', required: false },
      age: { type: 'string', required: false },
      deparment: { type: 'string', required: false },
      phone: { type: 'string', required: false },
      email: { type: 'string', required: false },
      access: { type: 'array', required: false, select: false },
      IDCard: { type: 'string', required: false, select: false }
    });
    let { authorization } = ctx.headers
    authorization = authorization.split(' ')[1]
    const { _id, access } = jsonwebtoken.verify(authorization, secret) // token的人
    const requestId = ctx.request.body._id // 要被修改的人
    if (access.includes('super_admin') || _id === requestId) {
      const user = await User.findByIdAndUpdate(requestId, ctx.request.body, {new: true})
      if (!user) {
        ctx.throw(404, '用户不存在');
      }
      ctx.body = {
        code: 200,
        msg: '更新信息成功',
        data: user
      }
    }
  }

  async delete(ctx) {
    let { authorization } = ctx.headers
    authorization = authorization.split(' ')[1]
    const { _id, access } = jsonwebtoken.verify(authorization, secret)
    const requestId = ctx.query.id
    if (_id === requestId) {
      ctx.throw(406, '删除帐号不能为本人账号')
    }
    if (access.includes('super_admin')) {
      const user = await User.findByIdAndRemove(ctx.query.id, { new: false})
      if (!user) {
        ctx.throw(404, '用户不存在')
      }
      ctx.body = {
        code: 200,
        msg: '删除帐号成功',
        data: user
      }
    }
  }
  
  async login(ctx) {
    ctx.verifyParams({
      userName: {type: 'string', required: true},
      password: {type: 'string', required: true}
    });
    const user = await User.findOne(ctx.request.body);
    if(!user) {
      ctx.throw(401, '用户名或密码不正确')
    }
    const { _id, userName, access } = user;
    let token = jsonwebtoken.sign({_id, userName, access}, secret, {expiresIn: '7d'});
    ctx.body = {
      code: 200,
      mes: '登陆成功',
      data: { token }
    }
  }

  
  async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id,{following:1}).populate('following');
    if(!user){
      ctx.throw(404)
    } else {
      ctx.body = {
        mes:user.following
      }
    }
  }

  async listFollower (ctx) {
    const user = await User.find({following: ctx.params.id})
    ctx.body = user
  }

  async checkUserExist (ctx, next) {
    const user = await User.findById(ctx.params.id)
    if(!user) {
      ctx.throw(404, '用户不存在')
    }
    await next()
  }

  async follow(ctx) {
    if(ctx.params.id !== ctx.state.user._id) {
      const me = await User.findById(ctx.state.user._id).select('+following')
      if(!(me.following&&me.following.map(item=>item.toString()).includes(ctx.params.id))) {
        me.following.push(ctx.params.id)
        const user = await me.save()
        ctx.body = {
          code: 200,
          mes: user
        }
      } else {
        ctx.body = {
          code: 200, 
          mes:'已经关注了'
        }
      }
      ctx.status = 200
    } else {
      ctx.status = 202
      ctx.body = {
        code: 202,
        mes: '不能关注自己'
      }
    }
  }
  async unfollow(ctx,) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map(item => item.toString()).indexOf(ctx.params.id)
    if(index > -1) {
      me.following.splice(index, 1)
      const user = await me.save()
      ctx.body = {
        code: 200,
        mes: user
      }
    }
    ctx.status = 204
  }
}

module.exports = new UsersCtl();