export interface chartDataType {
  rows: object[]
  columns: string[]
}
interface queryType {
  address: string,
  __name__:string
}

export interface formInlineType {
  query:queryType,
  date: Date[],
  step: string
}
