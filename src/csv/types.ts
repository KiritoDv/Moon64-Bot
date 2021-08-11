enum DataType {
    STRING,
    NUMBER
}

type RowData = {
    key: string,
    type: DataType
}

export { DataType, RowData }