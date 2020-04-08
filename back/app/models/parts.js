const mongoose = require("mongoose");

const { Schema, model } = mongoose;
const partsSchema = new Schema(
  {
    __v: { type: String, select: false },
    model: { type: String, required: true }, // 型号
    name: { type: String, required: true }, // 名称
    barCode: { type: String, required: false}, // 条形码
    apply: { type: String, required: true }, // 适用车型
    kind: { type: String, required: true }, // 种类
    brand: { type: String, required: true }, // 品牌
    color: { type: String, required: true }, // 颜色
    location: { type: [{type: String}], required: true }, // 产地
    position: { type: String, required: true }, // 位置
    remark: { type: String, required: false }, // 备注
    photoUrl: { type: String, required: false }, // 照片
    stock: { type: String, required: false }, // 库存
    agent: { type: String, required: false }, // 经销商
    price: { type: String, required: false }, // 预售价格
    alertNumber: { type: String, required: false }, // 警报线
    purchase: { type: [{ type: Schema.Types.ObjectId }], ref: 'Purchase', required: false }, // 进库
    delivery: { type: [{ type: Schema.Types.ObjectId }], ref: 'Delivery', required: false }, // 出库
    operator: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // 操作人
    // avatar_url: { type: String, required: false },
  },
  {
    timestamps: true
  }
);

module.exports = model("Parts", partsSchema);
