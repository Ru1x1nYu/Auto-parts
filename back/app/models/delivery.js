const mongoose = require("mongoose");

const { Schema, model } = mongoose;
const deliverySchema = new Schema(
  {
    __v: { type: String, select: false },
    partsId: { type: Schema.Types.ObjectId, ref: 'Parts', required: false }, //配件_id
    deliveryPrice: { type: String, required: true}, // 出库价格
    deliveryStock: { type: String, required: true}, // 出库数量
    atTimeStock: { type: String, required: true}, // 当前库存
    deliveryRemark: { type: String, required: false}, // 出库备注
    operator: { type: Schema.Types.ObjectId, ref: 'User', required: true}, // 操作人
    // avatar_url: { type: String, required: false },
  },
  {
    timestamps: true
  }
);

module.exports = model("Delivery", deliverySchema);
