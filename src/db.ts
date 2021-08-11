import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises'
import { dirname } from 'path'

export default class BotSimpleDB {

    path: string;
    data: Map<string, any>;

    constructor(path: string){
        this.path = path
        this.data = new Map<string, any>()
    }

    async init() {
        await mkdir(dirname(this.path), { recursive: true })
        if( existsSync(this.path) ){
            let raw = JSON.parse(await readFile(this.path, 'utf-8'))
            for( var key in raw ) {
                console.log(raw[key])
                this.data.set(key, raw[key])
            }
        }
    }

    async save() {
        await mkdir(dirname(this.path), { recursive: true })
        console.log(this.data)
        await writeFile(this.path, JSON.stringify(Object.fromEntries(this.data), null, 4), 'utf-8')
    }

    set<Type>(key: string, value: Type){
        this.data.set(key, value);
    }

    get<Type>(key: string, nullDefault ?: any) : Type{
        return ( this.data.has(key) ? this.data.get(key) : nullDefault ) as Type
    }
}