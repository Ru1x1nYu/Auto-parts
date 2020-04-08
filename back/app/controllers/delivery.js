const mongoose = require('mongoose')
const { secret } = require('../config')
const Parts = require('../models/parts');
const Purchase = require('../models/purchase')
const Delivery = require('../models/delivery')
const clonedeep = require('clonedeep')

class DeliveryCtl {
  async getDeliveryList(ctx) {
    ctx.set('Allow','GET, POST')
    // ctx.set('Content-Type', 'application/x-www-form-urlencoded')
    const data = await Delivery.find().populate('operator', 'userName').populate('partsId', 'stock model name barCode apply kind brand color photoUrl price')
    ctx.body = {
      code: 200,
      msg: '请求数据成功',
      data
    }
  }

  async searchPAndD (ctx) {
    ctx.set('Allow','GET, POST')
    const { pageSize = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) -1
    const pageSizes = Math.max(pageSize * 1, 10)
    // ctx.set('Content-Type', 'application/x-www-form-urlencoded')
    let parts = await Parts.find({
      $and: [
        { 'name': new RegExp(ctx.request.body.name) },
        { 'model': new RegExp(ctx.request.body.model) },
        { 'barCode': new RegExp(ctx.request.body.barCode) },
        { 'apply': new RegExp(ctx.request.body.apply) },
        { 'kind': new RegExp(ctx.request.body.kind) },
      ]
    }, {_id: 1})
    let nParts = parts.map(item => {
      let nItem = item.toObject()
      nItem.partsId = nItem._id.toHexString()
      delete nItem._id
      return nItem
    })
    if (nParts && nParts.length ===0) {
      return ctx.body = {
        code: 400,
        msg: '查询不到数据',
        data: []
      }
    }
    const start = ctx.request.body.start ? new Date(ctx.request.body.start) : ''
    const end = ctx.request.body.end ? new Date(ctx.request.body.end) : ''
    let params ={}
    if (start && end && start !== '' && end !== '') {
      params = {
        'createdAt': { $gte: start, $lte: end},
        $or: nParts
      }
    } else if (start && start !== '') {
      params = {
        'createdAt': { $gte: start},
        $or: nParts
      }
    } else if (end && end !== '') {
      params = {
        'createdAt': { $lte: end},
        $or: nParts
      }
    } else {
      params = {
        $or: nParts
      }
    }
    let total = await Delivery.find(params).count()
    const data = await Delivery.find(params).limit(pageSizes).skip(page*pageSizes).populate('operator', 'userName').populate('partsId', 'stock model name barCode apply kind brand color photoUrl price')
    let pages = {
      total,
      pageSize: pageSizes,
      page: ctx.query.page
    }
    ctx.body = {
      code: 200,
      msg: '请求数据成功',
      data,
      pages
    }
  }

  async getInfoById(ctx) {
    // const { token } = ctx.query
    let { id } = ctx.request.query
    const part = await Delivery.findById(id)
    if (!part) {
      ctx.throw(409,'该汽配零件不存在');
    }
    ctx.status = 200
    ctx.body = {
      code: 200,
      mes: '请求汽配零件数据成功',
      data: part
    }
  }

  async createDelivery(ctx) {
    ctx.verifyParams({
      partsId: { type: 'string', required: true },
      deliveryPrice: { type: 'string', required: true },
      deliveryStock: { type: 'string', required: true },
      deliveryRemark: { type: 'string', required: false },
      operator: { type: 'string', required: true },
    });
    const { partsId, deliveryStock } = ctx.request.body
    const repeatedParts = await Parts.findById(partsId)
    if(!repeatedParts) {
      ctx.throw(409, '不存在该配件！')
    }
    if (Number(deliveryStock) < 1 && Number(repeatedParts.stock) > -1) {
      ctx.throw(400, `出库数量不能为0，当前库存为【${repeatedParts.stock}】`)
    }
    if (Number(repeatedParts.stock) < Number(deliveryStock)) {
      ctx.throw(400, `出库数量必须小于库存量，当前库存为【${repeatedParts.stock}】`)
    }
    let data = ctx.request.body
    const part = await Parts.findByIdAndUpdate(partsId, {stock: Number(repeatedParts.stock) - Number(deliveryStock)}, {new: true})
    data.atTimeStock = part.stock
    const DeliveryPart = await new Delivery(data).save()
    ctx.body = {
      code: 200,
      msg: '配件出库成功!',
      data: DeliveryPart
    };
  }
}

module.exports = new DeliveryCtl();