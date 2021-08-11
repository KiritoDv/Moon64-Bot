import { RowData, DataType } from './types'

export default class ProgressData {
    rawData: string;
    columns: Map<string, any[]> = new Map()

    constructor(rawData: string, rows: RowData[]) {
        this.rawData = rawData

        rawData.split('\n').forEach((row => {
            row.split(',').forEach((column, idx) => {
                var type = rows[idx].type
                var key  = rows[idx].key
                if(!this.columns.has(key)) this.columns.set(key, [])

                this.columns.get(key)?.push(type === DataType.STRING ? column : parseFloat(column))
            })
        }))
    }

    getColumn(key: string): any[] {
        return this.columns.get(key) ?? []
    }

    getColumns(): Map<string, any[]> {
        return this.columns
    }

}
