const mongoose = require('mongoose')
const { secret } = require('../config')
const Parts = require('../models/parts');
const Purchase = require('../models/purchase')
const Delivery = require('../models/delivery')
const clonedeep = require('clonedeep')
const { jsonMerge, jsonDateMerge, profitSum, sumSP } = require('../utils/utils')
class PartsCtl {
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

  async searchPAndD (ctx) {
    ctx.set('Allow','GET, POST')
    const { pageSize = 10 } = ctx.query
    let page = Math.max(ctx.query.page * 1, 1) -1
    let pageSizes = Math.max(pageSize * 1, 1)
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
      ctx.throw(400, '查找不到该配件！')
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
    let total = await Purchase.find(params).count()
    total += await Delivery.find(params).count()
    const data1 = await Purchase.find(params).select().populate('operator', 'userName').populate('partsId', 'model stock name barCode apply kind brand color photoUrl price')
    const data2 = await Delivery.find(params).select().populate('operator', 'userName').populate('partsId', 'stock model name barCode apply kind brand color photoUrl price')
    let data = data1.concat(data2).sort((a, b) =>{
      return a < b ? 1 : -1
    })
    let limitPage = 0
    let Size = 0
    if (page === 0) {
      limitPage = 0
      Size = pageSizes
    } else {
      limitPage = page * pageSizes
      Size = limitPage + pageSizes
      if (Size > total) {
        Size = total
      }
    }
    data = data.slice(limitPage, pageSizes + limitPage)
    let pages = {
      total: total,
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

  async getPAndDList(ctx) {
    ctx.set('Allow','GET, POST')
    // ctx.set('Content-Type', 'application/x-www-form-urlencoded')
    const data1 = await Purchase.find().populate('operator', 'userName').populate('partsId', 'model stock name barCode apply kind brand color photoUrl price')
    const data2 = await Delivery.find().populate('operator', 'userName').populate('partsId', 'stock model name barCode apply kind brand color photoUrl price')
    const data = data1.concat(data2)
    ctx.body = {
      code: 200,
      msg: '请求数据成功',
      data
    }
  }
  
  async searchPartsReport (ctx) {
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
      nItem.partsId = nItem._id
      delete nItem._id
      return nItem
    })
    if (nParts && nParts.length === 0) {
      ctx.throw(400, '查找不到该配件！')
    }
    let params = {
      $or: nParts
    }
    let data1 = await Purchase.aggregate([
      {
        $match: params 
      },
      {$group: {
        _id: '$partsId',
        purchaseStockCount: {
          $push: '$purchaseStock'
        },
        purchasePriceCount: {
          $push: '$purchasePrice'
        }
      }},
      {$skip: page * pageSizes},
      {$limit: pageSizes},
      {$lookup: { // 左连接
        from: "parts", // 关联到order表
        localField: "_id", // user 表关联的字段
        foreignField: "_id", // order 表关联的字段
        as: "part"
      }},
    ])
    let data2 = await Delivery.aggregate([
      {
        $match: params
      },
      {$group: {
        _id: '$partsId',
        deliveryStockCount: {
          $push: '$deliveryStock'
        },
        deliveryPriceCount: {
          $push: '$deliveryPrice'
        },
        create: {
          $push: '$createdAt'
        }
      }},
      {$skip: page * pageSizes},
      {$limit: pageSizes},
      {$lookup: { // 左连接
        from: "parts", // 关联到order表
        localField: "_id", // // 本地说的_id
        foreignField: "_id", // Parts的_id
        as: "part"
      }},
    ])
    // let data = data1.concat(data2)
    let result = jsonMerge(data1, data2)
    result = result.map(item=>{
      item.deliveryStock = item.deliveryStockCount && item.deliveryStockCount.length !==0 ? item.deliveryStockCount.reduce((pre, cur) => {
        return parseInt(pre) + parseInt(cur)
      }, 0) : ''
      item.purchaseStock = item.purchaseStockCount && item.purchaseStockCount.length !==0 ? item.purchaseStockCount.reduce((pre, cur) => {
        return parseInt(pre) + parseInt(cur)
      }, 0) : ''
      item.avgPrice = item.deliveryPriceCount && item.deliveryPriceCount.length !== 0 ? (item.deliveryPriceCount.reduce((acc, val) => parseInt(acc) + parseInt(val), 0) / item.deliveryPriceCount.length).toFixed(2) : ''
      item.profit = item.purchaseStockCount && item.purchasePriceCount && 
        item.deliveryStockCount && item.deliveryPriceCount ?
        profitSum(item.purchasePriceCount, item.purchaseStockCount, item.deliveryStockCount, item.deliveryPriceCount) :
        item.purchaseStockCount && item.purchasePriceCount ? -sumSP(item.purchaseStockCount, item.purchasePriceCount) :
        item.deliveryStockCount && item.deliveryPriceCount ? sumSP(item.deliveryStockCount, item.deliveryPriceCount) : 0
      item.income = item.profit > 0 ? '盈利' : item.profit === 0 ? '持平' : '亏损'
      item.partName = item.part[0].name
      item.partModel = item.part[0].model
      item.barCode = item.part[0].barCode
      item.apply = item.part[0].apply
      item.kind = item.part[0].kind
      item.brand = item.part[0].brand
      item.photoUrl = item.part[0].photoUrl
      delete item.part
      return item
    })
    let total = await Parts.find({
      $and: [
        { 'name': new RegExp(ctx.request.body.name) },
        { 'model': new RegExp(ctx.request.body.model) },
        { 'barCode': new RegExp(ctx.request.body.barCode) },
        { 'apply': new RegExp(ctx.request.body.apply) },
        { 'kind': new RegExp(ctx.request.body.kind) },
      ]
    }).count()
    let pages = {
      total,
      pageSize: pageSizes,
      page: ctx.query.page
    }
    ctx.body = {
      code: 200,
      msg: '请求数据成功！',
      data: result,
      pages
    }
  }

  async getPartsReport (ctx) {
    ctx.set('Allow','GET, POST')
    const { pageSize = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) -1
    const pageSizes = Math.max(pageSize * 1, 10)
    let data1 = await Purchase.aggregate([
      {$group: {
        _id: '$partsId',
        purchaseStockCount: {
          $push: '$purchaseStock'
        },
        purchasePriceCount: {
          $push: '$purchasePrice'
        }
      }},
      {$lookup: { // 左连接
        from: "parts", // 关联到order表
        localField: "_id", // user 表关联的字段
        foreignField: "_id", // order 表关联的字段
        as: "part"
      }},
    ])
    let data2 = await Delivery.aggregate([
      {$group: {
        _id: '$partsId',
        total: { $sum: 1 },
        deliveryStockCount: {
          $push: '$deliveryStock'
        },
        deliveryPriceCount: {
          $push: '$deliveryPrice'
        },
        create: {
          $push: '$createdAt'
        }
      }},
      {$lookup: { // 左连接
        from: "parts", // 关联到order表
        localField: "_id", // // 本地说的_id
        foreignField: "_id", // Parts的_id
        as: "part"
      }},
      {$skip: page * pageSizes},
      {$limit: pageSizes}
    ])
    // let data = data1.concat(data2)
    let result = jsonMerge(data1, data2)
    result = result.map(item=>{
      item.deliveryStock = item.deliveryStockCount && item.deliveryStockCount.length !==0 ? item.deliveryStockCount.reduce((pre, cur) => {
        return parseInt(pre) + parseInt(cur)
      }, 0) : ''
      item.purchaseStock = item.purchaseStockCount && item.purchaseStockCount.length !==0 ? item.purchaseStockCount.reduce((pre, cur) => {
        return parseInt(pre) + parseInt(cur)
      }, 0) : ''
      item.avgPrice = item.deliveryPriceCount && item.deliveryPriceCount.length !== 0 ? item.deliveryPriceCount.reduce((acc, val) => parseInt(acc) + parseInt(val), 0) / item.deliveryPriceCount.length : ''
      item.profit = item.purchaseStockCount && item.purchaseStockCount.length !== 0 ? profitSum(item.purchaseStockCount,item.purchasePriceCount,item.deliveryStockCount,item.deliveryPriceCount) : 0
      item.income = item.profit > 0 ? '盈利' : item.profit === 0 ? '持平' : '亏损'
      item.partName = item.part[0].name
      item.partModel = item.part[0].model
      item.barCode = item.part[0].barCode
      item.apply = item.part[0].apply
      item.kind = item.part[0].kind
      item.brand = item.part[0].brand
      item.photoUrl = item.part[0].photoUrl
      delete item.part
      return item
    })
    let total = await Parts.find().count()
    let pages = {
      total,
      pageSize: pageSizes,
      page: ctx.query.page
    }
    ctx.body = {
      code: 200,
      msg: '请求数据成功！',
      data: result,
      pages
    }
  }

  async searchDateReport (ctx) {
    let start = ctx.request.body.start ? new Date(ctx.request.body.start) : ''
    let end = ctx.request.body.end ? new Date(ctx.request.body.end) : ''
    end = ctx.request.body.end ? new Date(end.setHours(23, 59, 59, 999)) : ''
    if (start > end) {
      ctx.throw(400, '时间范围错误')
    }
    let createdAt ={}
    if (start && end && start !== '' && end !== '') {
      createdAt = {
        $gte: start,
        $lte: end
      }
    } else if (start && start !== '') {
      createdAt = {
        $gte: start
      }
    } else if (end && end !== '') {
      createdAt = {
        $lte: end
      }
    } else {
      createdAt = undefined
    }
    ctx.set('Allow','GET, POST')
    let data1 = await Purchase.aggregate([
      {$match: createdAt? {createdAt} : {}},
      {$project : {
          day: {$substr: [{"$add":["$createdAt", 28800000]}, 0, 10] },//时区数据校准，8小时换算成毫秒数为8*60*60*1000=288000后分割成YYYY-MM-DD日期格式便于分组
          purchaseStock: 1,
          purchasePrice: 1
      }},
      {$group: {
        _id:"$day", //将_id设置为day数据
        purchaseStockCount: {
          $push: '$purchaseStock'
        },
        purchasePriceCount: {
          $push: '$purchasePrice'
        },
      }},
      {
        $sort: {_id: 1}//根据date排序
      }
    ])
    let data2 = await Delivery.aggregate([
      {$match: createdAt? {createdAt} : {}},
      {$project : {
        day: {$substr: [{"$add":["$createdAt", 28800000]}, 0, 10] },//时区数据校准，8小时换算成毫秒数为8*60*60*1000=288000后分割成YYYY-MM-DD日期格式便于分组
        deliveryStock: 1,
        deliveryPrice: 1
      }},
      {$group: {
        _id:"$day", //将_id设置为day数据
        deliveryStockCount: {
          $push: '$deliveryStock'
        },
        deliveryPriceCount: {
          $push: '$deliveryPrice'
        },
      }},
      {
        $sort: {_id: 1}//根据date排序
      }
    ])
    let result = jsonDateMerge(data1, data2)
    result = result.map(item=>{
      item.deliveryStock = item.deliveryStockCount && item.deliveryStockCount.length !== 0 ? item.deliveryStockCount.reduce((pre, cur) => {
        return parseInt(pre) + parseInt(cur)
      }, 0) : 0
      item.purchaseStock = item.purchaseStockCount && item.purchaseStockCount.length !== 0 ? item.purchaseStockCount.reduce((pre, cur) => {
        return parseInt(pre) + parseInt(cur)
      }, 0) : 0
      item.purchasePrice = item.purchasePriceCount && item.purchasePriceCount.length !== 0 && item.purchasePriceCount ? sumSP(item.purchaseStockCount, item.purchasePriceCount) : 0
      item.deliveryPrice = item.deliveryPriceCount && item.deliveryPriceCount.length !== 0 ? sumSP(item.deliveryStockCount, item.deliveryPriceCount) : 0
      item.profit = item.purchaseStockCount && item.purchasePriceCount && 
      item.deliveryStockCount && item.deliveryPriceCount ?
      profitSum(item.purchasePriceCount, item.purchaseStockCount, item.deliveryStockCount, item.deliveryPriceCount) :
      item.purchaseStockCount && item.purchasePriceCount ? -sumSP(item.purchaseStockCount, item.purchasePriceCount) :
      item.deliveryStockCount && item.deliveryPriceCount ? sumSP(item.deliveryStockCount, item.deliveryPriceCount) : 0
      item.income = item.profit > 0 ? '盈利' : item.profit === 0 ? '持平' : '亏损'
      return item
    })
    ctx.body = {
      code: 200,
      msg: '请求数据成功！',
      data: result
    }
  }

  async getDateReport (ctx) {
    ctx.set('Allow','GET, POST')
    let data1 = await Purchase.aggregate([
      {$project : {
          day: {$substr: [{"$add":["$createdAt", 28800000]}, 0, 10] },//时区数据校准，8小时换算成毫秒数为8*60*60*1000=288000后分割成YYYY-MM-DD日期格式便于分组
          purchaseStock: 1,
          purchasePrice: 1
      }},
      {$group: {
        _id:"$day", //将_id设置为day数据
        purchaseStockCount: {
          $push: '$purchaseStock'
        },
        purchasePriceCount: {
          $push: '$purchasePrice'
        },
      }},
      {
        $sort: {_id: 1}//根据date排序
      }
    ])
    let data2 = await Delivery.aggregate([
      {$project : {
        day: {$substr: [{"$add":["$createdAt", 28800000]}, 0, 10] },//时区数据校准，8小时换算成毫秒数为8*60*60*1000=288000后分割成YYYY-MM-DD日期格式便于分组
        deliveryStock: 1,
        deliveryPrice: 1
    }},
    {$group: {
      _id:"$day", //将_id设置为day数据
      deliveryStockCount: {
        $push: '$deliveryStock'
      },
      deliveryPriceCount: {
        $push: '$deliveryPrice'
      },
    }},
    {
      $sort: {_id: 1}//根据date排序
    }
    ])
    let result = jsonDateMerge(data1, data2)
    result = result.map(item=>{
      item.deliveryStock = item.deliveryStockCount ? item.deliveryStockCount.reduce((pre, cur) => {
        return parseInt(pre) + parseInt(cur)
      }, 0) : 0
      item.purchaseStock = item.purchaseStockCount ? item.purchaseStockCount.reduce((pre, cur) => {
        return parseInt(pre) + parseInt(cur)
      }, 0) : 0
      item.purchasePrice = item.purchaseStockCount && item.purchasePriceCount ? sumSP(item.purchaseStockCount, item.purchasePriceCount) : 0
      item.deliveryPrice = item.deliveryStockCount && item.deliveryPriceCount ? sumSP(item.deliveryStockCount, item.deliveryPriceCount) : 0
      item.profit = profitSum(item.purchaseStockCount,item.purchasePriceCount,item.deliveryStockCount,item.deliveryPriceCount)
      item.income = item.profit > 0 ? '盈利' : item.profit === 0 ? '持平' : '亏损'
      return item
    })
    ctx.body = {
      code: 200,
      msg: '请求数据成功！',
      data: result
    }
  }

  async getPartsList(ctx) {
    ctx.set('Allow','GET, POST')
    const { pageSize = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) -1
    const pageSizes = Math.max(pageSize * 1, 1)
    // ctx.set('Content-Type', 'application/x-www-form-urlencoded')
    let total = await Parts.find().count()
    const data = await Parts.find().limit(pageSizes).skip(page*pageSizes).populate('operator', 'userName')
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
    const part = await Parts.findById(id)
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

  async getNotice (ctx) {
    const data = await Parts.find().select('name stock alertNumber').then(res => {
      res = res.filter(item => {
        return Number(item.stock) <= Number(item.alertNumber)
      })
      return res
    })
    ctx.body = {
      code: 200,
      msg: '库存提醒',
      data
    }
  }

  async create(ctx) {
    ctx.verifyParams({
      model: { type: 'string', required: true },
      name: { type: 'string', required: true },
      position: { type: 'string', required: true },
      apply: { type: 'string', required: false },
      kind: { type: 'string', required: false },
      brand: { type: 'string', required: false },
      color: { type: 'string', required: false },
      location: { type: 'array', required: false },
      operator: { type: 'string', required: false, select: false },
      // IDCard: { type: 'string', required: false, select: false }
    });
    const { model, name } = ctx.request.body
    const repeatedParts = await Parts.findOne({
      $or: [
        { model }, { name }
      ]
    })
    if(repeatedParts) {
      ctx.throw(409,'配件已经存在！')
    }
    let data = ctx.request.body
    let purchaseData = clonedeep(data.purchase)
    data.purchase && Object.keys(data.purchase).length !== 0 ? delete data.purchase : ''
    data.delivery && Object.keys(data.delivery).length !== 0 ? delete data.delivery : ''
    if (purchaseData.purchaseStock && Number(purchaseData.purchaseStock) !== 0) {
      if (purchaseData.purchasePrice && Number(purchaseData.purchasePrice) !== 0) {
        const part = await new Parts(data).save();
        purchaseData.partsId = part._id.toHexString()
        purchaseData.operator = data.operator
        purchaseData.atTimeStock = data.stock
        purchaseData.purchaseRemark = data.remark
        const purchasePart = await new Purchase(purchaseData).save()
        ctx.body = {
          code: 200,
          msg: '新增配件成功并入库！',
          data:{
            part,
            purchasePart
          }
        }
      } else {
        ctx.throw(400, '入库价格未填写')
      }
    } else if (purchaseData.purchaseStock && Number(purchaseData.purchaseStock) === 0) {
      const part = await new Parts(data).save();
       ctx.body = {
         code: 200,
         msg: '新增零件成功！',
         data: part
       }
    } else {
      ctx.throw(400, '未知错误')
    }
  //   ctx.body = {
  //     code: 200,
  //     mes: '添加用户成功!',
  //     data: user
  //   };
  }

  async updated(ctx) {
    ctx.verifyParams({
      model: { type: 'string', required: true },
      name: { type: 'string', required: true },
      position: { type: 'string', required: true },
      apply: { type: 'string', required: false },
      kind: { type: 'string', required: false },
      brand: { type: 'string', required: false },
      color: { type: 'string', required: false },
      location: { type: 'array', required: false },
      operator: { type: 'string', required: false, select: false },
      // IDCard: { type: 'string', required: false, select: false }
    });
    const { _id} = ctx.request.body
    let data = ctx.request.body
    data.purchase && Object.keys(data.purchase).length !== 0 ? delete data.purchase : ''
    data.delivery && Object.keys(data.delivery).length !== 0 ? delete data.delivery : ''
    const part = await Parts.findByIdAndUpdate(_id, data, {new: true}).populate('operator')
    if (!part) {
      ctx.throw(404, '该配件不存在');
    }
    ctx.body = {
      code: 200,
      msg: '更新信息成功',
      data: part
    }
  }

  async delete(ctx) {
    const id = ctx.query.id
    const part = await Parts.findByIdAndRemove(id, { new: true})
    if (!part) {
      ctx.throw(404, '该零件已不存在')
    }
    const purchaseData = await Purchase.deleteMany({partsId: id})
    const deliveryData = await Delivery.deleteMany({partsId: id})
    console.log(purchaseData, deliveryData)
    ctx.body = {
      code: 200,
      msg: '删除零件成功',
      data: part
    }
  }
}

module.exports = new PartsCtl();