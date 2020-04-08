module.exports = {jsonMerge, profitSum, jsonDateMerge, sumSP, getNowFormatDay}
function getNowFormatDay (nowDate) {
  var char = '-'
  if (nowDate == null) {
    nowDate = new Date()
  }
  var day = nowDate.getDate()
  var month = nowDate.getMonth() + 1 // 注意月份需要+1
  var year = nowDate.getFullYear()
  // 补全0，并拼接
  function completeDate (value) {
    return value < 10 ? '0' + value : value
  }
  return year + char + completeDate(month) + char + completeDate(day)
}

function jsonMerge(arr1, arr2){
  const combined = arr2.reduce((acc, cur) => {
    // console.log(typeof cur._id.toHexString())
    const target = acc.find(e => e._id.toHexString() === cur._id.toHexString());
    // console.log('target', target)
    if (target) {
      Object.assign(target, cur);
    } else {
      acc.push(cur);
    }
    return acc;
  }, arr1)
  return combined
}

function sumSP (S, P) {
  let sum= 0
  for (let i in S) {
    sum += (S[i] * P[i])
  }
  return sum
}

function jsonDateMerge(arr1, arr2){
  const combined = arr2.reduce((acc, cur) => {
    // console.log(typeof cur._id.toHexString())
    const target = acc.find(e => e._id === cur._id);
    // console.log('target', target)
    if (target) {
      Object.assign(target, cur);
    } else {
      acc.push(cur);
    }
    return acc;
  }, arr1)
  return combined
}

function profitSum(purS, purP, delS, delP){
  var sum = 0
  for (let i in delS) {
    sum += Number(Number(delS[i]) * Number(delP[i]))
  }
  for (let i in purS) {
    sum -= Number(Number(purS[i]) * Number(purP[i]))
  }
  return sum
}