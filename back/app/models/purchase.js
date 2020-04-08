const mongoose = require("mongoose");

const { Schema, model } = mongoose;
const purchaseSchema = new Schema(
  {
    __v: { type: String, select: false },
    partsId: { type: Schema.Types.ObjectId, ref: 'Parts', required: true}, // 操作人
    purchasePrice: { type: String, required: true}, // 入库价格
    purchaseStock: { type: String, required: true}, // 入库数量
    atTimeStock: { type: String, required: true}, // 当前库存
    purchaseRemark: { type: String, required: false}, // 入库备注
    operator: { type: Schema.Types.ObjectId, ref: 'User', required: true}, // 操作人
  },
  {
    timestamps: true
  }
);

module.exports = model("Purchase", purchaseSchema);
