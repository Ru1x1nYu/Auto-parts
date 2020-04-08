const path = require('path');
const Parts = require('../models/parts');
const Purchase = require('../models/purchase')
const Delivery = require('../models/delivery')
const clonedeep = require('clonedeep')
const { sumSP, profitSum } = require('../utils/utils')
class HomeCtl {
  index(ctx) {
    ctx.body = "<h1>这是主页</h1>";
  }
  upload(ctx) {
    const file = ctx.request.files.file;
    const basename = path.basename(file.path)
    ctx.body = {
      url: `${ctx.origin}/uploads/${basename}`
    };
  }
  // count-to的数据接口
  async getHomeCount (ctx) {
    let day = new Date()
    let yesterday = day.setDate(day.getDate() - 1)
    yesterday = new Date(yesterday.valueOf())
    const startDay = new Date(yesterday.setHours(0, 0, 0, 0).valueOf() + 28800000)
    const endDay = new Date(yesterday.setHours(23, 59, 59, 999).valueOf() + 28800000)
    let startMonth = clonedeep(startDay)
    let endMonth = clonedeep(endDay)
    startMonth.setMonth(startMonth.getMonth() - 1)
    const yesterdayDelivery = await Delivery.find({
      createdAt: {
        $gte: startDay,
        $lte: endDay
      }
    }).select('deliveryPrice deliveryStock')
    const lastMonthDelivery = await Delivery.find({
      createdAt: {
        $gte: startMonth,
        $lte: endMonth
      }
    }).select('deliveryPrice deliveryStock')
    const yesterdayPurchase = await Purchase.find({
      createdAt: {
        $gte: startDay,
        $lte: endDay
      }
    }).select('purchasePrice purchaseStock')
    const lastMonthPurchase = await Purchase.find({
      createdAt: {
        $gte: startMonth,
        $lte: endMonth
      }
    }).select('purchasePrice purchaseStock')
    let data = {
      dayDeliveryCount: 0,
      dayIncome: 0,
      dayExpend: 0,
      monthDeliveryCount: 0,
      monthIncome: 0,
      monthExpend: 0,
    }
    yesterdayDelivery.forEach(item => {
      data.dayDeliveryCount += Number(item.deliveryStock)
      data.dayIncome += Number(item.deliveryStock) * Number(item.deliveryPrice)
    })
    lastMonthDelivery.forEach(item => {
      data.monthDeliveryCount += Number(item.deliveryStock)
      data.monthIncome += Number(item.deliveryStock) * Number(item.deliveryPrice)
    })
    yesterdayPurchase.forEach(item => {
      data.dayExpend += Number(item.purchaseStock) * Number(item.purchasePrice)
    })
    lastMonthPurchase.forEach(item => {
      data.monthExpend += Number(item.purchaseStock) * Number(item.purchasePrice)
    })
    ctx.body = {
      code: 200,
      msg: '请求响应成功！',
      data
    }
  }
  // 入库/出库的柱形图/折线图 
  async getHomeChart (ctx) {
    const deliveryData = await Delivery.find().select('deliveryPrice deliveryStock atTimeStock createdAt')
    const purchaseData = await Purchase.find().select('purchasePrice purchaseStock atTimeStock createdAt')
    let data = {
      deliveryPrice: [],
      deliveryStock: [],
      deliveryDate: [],
      purchasePrice: [],
      purchaseStock: [],
      purchaseDate: [],
      total: []
    }
    deliveryData.forEach(item => {
      item.deliveryPrice ? data.deliveryPrice.push(item.deliveryPrice) : ''
      item.deliveryStock ? data.deliveryStock.push(item.deliveryStock) : ''
      item.createdAt ? data.deliveryDate.push(item.createdAt.toLocaleString()) : ''
    })
    purchaseData.forEach(item => {
      item.purchasePrice ? data.purchasePrice.push(item.purchasePrice) : ''
      item.purchaseStock ? data.purchaseStock.push(item.purchaseStock) : ''
      item.createdAt ? data.purchaseDate.push(item.createdAt.toLocaleString()) : ''
    })
    ctx.body = {
      code: 200,
      msg: '图表请求响应成功！',
      data
    }
  }
  // 饼图
  async getHomePie (ctx) {
    let data1 = await Purchase.aggregate([
      {$group: {
        _id: '$operator',
        count: { $sum: 1 } 
      }},
      {$lookup: { // 左连接
        from: "users", // 关联到order表
        localField: "_id", // // 本地说的_id
        foreignField: "_id", // Parts的_id
        as: "user"
      }}
    ])
    let data2 = await Delivery.aggregate([
      {$group: {
        _id: '$operator',
        count: { $sum: 1 } 
      }},
      {$lookup: { // 左连接
        from: "users", // 关联到order表
        localField: "_id", // // 本地说的_id
        foreignField: "_id", // Parts的_id
        as: "user"
      }}
    ])
    data1 = data1.concat(data2)
    data1 = data1.map(item => {
      let item1 = clonedeep(item)
      item1._id = item._id.toHexString()
      return item1
    })
    let inArr = []
    let data = []
    for (let i in data1) {
      if (!inArr.includes(data1[i]._id)) {
        inArr.push(data1[i]._id)
        data.push(data1[i])
      } else {
        data.forEach(item => {
          if (item._id === data1[i]._id) {
            item.count += data1[i].count
          }
        })
      }
    }
    data.forEach(item => {
      item.operator = item.user[0].userName
      delete item.user
    })
    ctx.body = {
      code: 200,
      msg: '请求积极员工数据成功！',
      data
    }
  }
  // 多条折线图
  async getProfitData (ctx) {
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
      }}
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
      }}
    ])
    let data = data2.reduce((pre, cur) => {
      const target = pre.find(e => e._id === cur._id)
      if (target) {
        Object.assign(target, cur)
      } else {
        pre.push(cur)
      }
      return pre
    }, data1)
    data.sort((a, b) =>{
      return a._id > b._id ? 1 : -1
    })
    data = data.map(item => {
      let o = {}
      o.date = item._id
      o.purchase = item.purchaseStockCount && item.purchasePriceCount ? sumSP(item.purchaseStockCount, item.purchasePriceCount) : 0
      o.delivery = item.deliveryStockCount && item.deliveryPriceCount ? sumSP(item.deliveryPriceCount, item.deliveryStockCount) : 0
      o.profit = 
        item.purchaseStockCount && item.purchasePriceCount && 
        item.deliveryStockCount && item.deliveryPriceCount ?
        profitSum(item.purchasePriceCount, item.purchaseStockCount, item.deliveryStockCount, item.deliveryPriceCount) :
        item.purchaseStockCount && item.purchasePriceCount ? -sumSP(item.purchaseStockCount, item.purchasePriceCount) :
        item.deliveryStockCount && item.deliveryPriceCount ? sumSP(item.deliveryStockCount, item.deliveryPriceCount) : 0
      return o
    })
    let obj = {
      date: [],
      delivery: [],
      purchase: [],
      profit: []
    }
    data.forEach(item => {
      obj.date.push(item.date)
      obj.delivery.push(item.delivery)
      obj.purchase.push(-item.purchase)
      obj.profit.push(item.profit)
    })
    ctx.body = {
      code: 200,
      msg: '请求净赚数据成功！',
      data: obj
    }
  }
  // 某个汽配的柱形图/折线图
  async getPartChart (ctx) {
    let id = ctx.request.query.id
    // 柱形图/折线图
    let deliveryData = await Delivery.find({partsId: id}).select('partsId deliveryPrice deliveryStock atTimeStock createdAt').populate('partsId')
    let purchaseData = await Purchase.find({partsId: id}).select('partsId purchasePrice purchaseStock atTimeStock createdAt')
    id = deliveryData[0].partsId['_id']
    const name = deliveryData[0].partsId['name']
    let obj = {
      name,
      deliveryPrice: [],
      deliveryStock: [],
      deliveryDate: [],
      purchasePrice: [],
      purchaseStock: [],
      purchaseDate: [],
    }
    deliveryData.length !==0 ? deliveryData.forEach(item => {
      item.deliveryPrice ? obj.deliveryPrice.push(item.deliveryPrice) : ''
      item.deliveryStock ? obj.deliveryStock.push(item.deliveryStock) : ''
      item.createdAt ? obj.deliveryDate.push(item.createdAt.toLocaleString()) : ''
    }) : []
    purchaseData.length !== 0 ? purchaseData.forEach(item => {
      item.purchasePrice ? obj.purchasePrice.push(item.purchasePrice) : ''
      item.purchaseStock ? obj.purchaseStock.push(item.purchaseStock) : ''
      item.createdAt ? obj.purchaseDate.push(item.createdAt.toLocaleString()) : ''
    }) : []
    // 多条折线图
    let data1 = await Purchase.aggregate([
      {$match: {
        partsId: id
      }},
      {$project : {
          day: {$substr: [{"$add":["$createdAt", 28800000]}, 0, 10] },//时区数据校准，8小时换算成毫秒数为8*60*60*1000=288000后分割成YYYY-MM-DD日期格式便于分组
          purchaseStock: 1,
          purchasePrice: 1,
      }},
      {$group: {
        _id:"$day", //将_id设置为day数据
        purchaseStockCount: {
          $push: '$purchaseStock'
        },
        purchasePriceCount: {
          $push: '$purchasePrice'
        },
      }}
    ])
    let data2 = await Delivery.aggregate([
      {$match: {partsId: id}},
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
      }}
    ])
    let data = data2.reduce((pre, cur) => {
      const target = pre.find(e => e._id === cur._id)
      if (target) {
        Object.assign(target, cur)
      } else {
        pre.push(cur)
      }
      return pre
    }, data1)
    data.sort((a, b) =>{
      return a._id > b._id ? 1 : -1
    })
    data = data.map(item => {
      let o = {}
      o.date = item._id
      o.purchase = item.purchaseStockCount && item.purchasePriceCount ? sumSP(item.purchaseStockCount, item.purchasePriceCount) : 0
      o.delivery = item.deliveryStockCount && item.deliveryPriceCount ? sumSP(item.deliveryPriceCount, item.deliveryStockCount) : 0
      o.profit = 
        item.purchaseStockCount && item.purchasePriceCount && 
        item.deliveryStockCount && item.deliveryPriceCount ?
        profitSum(item.purchasePriceCount, item.purchaseStockCount, item.deliveryStockCount, item.deliveryPriceCount) :
        item.purchaseStockCount && item.purchasePriceCount ? -sumSP(item.purchaseStockCount, item.purchasePriceCount) :
        item.deliveryStockCount && item.deliveryPriceCount ? sumSP(item.deliveryStockCount, item.deliveryPriceCount) : 0
      return o
    })
    let obj1 = {
      date: [],
      delivery: [],
      purchase: [],
      profit: []
    }
    data.forEach(item => {
      obj1.date.push(item.date)
      obj1.delivery.push(item.delivery)
      obj1.purchase.push(-item.purchase)
      obj1.profit.push(item.profit)
    })

    //饼图
    let data3 = await Purchase.aggregate([
      {$match: {partsId: id}},
      {$group: {
        _id: '$operator',
        count: { $sum: 1 } 
      }},
      {$lookup: { // 左连接
        from: "users", // 关联到order表
        localField: "_id", // // 本地说的_id
        foreignField: "_id", // Parts的_id
        as: "user"
      }}
    ])
    let data4 = await Delivery.aggregate([
      {$match: {partsId: id}},
      {$group: {
        _id: '$operator',
        count: { $sum: 1 } 
      }},
      {$lookup: { // 左连接
        from: "users", // 关联到order表
        localField: "_id", // // 本地说的_id
        foreignField: "_id", // Parts的_id
        as: "user"
      }}
    ])
    data3 = data3.concat(data4)
    data3 = data3.map(item => {
      let item1 = clonedeep(item)
      item1._id = item._id.toHexString()
      return item1
    })
    let inArr = []
    let datas = []
    for (let i in data3) {
      if (!inArr.includes(data3[i]._id)) {
        inArr.push(data3[i]._id)
        datas.push(data3[i])
      } else {
        datas.forEach(item => {
          if (item._id === data3[i]._id) {
            item.count += data3[i].count
          }
        })
      }
    }
    datas.forEach(item => {
      item.operator = item.user[0].userName
      delete item.user
    })
    ctx.body = {
      code: 200,
      msg: '图表请求响应成功！',
      data: Object.assign(obj, obj1, {datas})
    }
  }
}

module.exports = new HomeCtl();