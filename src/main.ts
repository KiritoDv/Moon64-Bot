import fetch from 'node-fetch'
import BotSimpleDB from './db'
import ProgressData from './csv/progress'
import { RowData, DataType } from './csv/types'
import { Client, Intents, Message, MessageEmbed, TextChannel } from 'discord.js'
import { join } from 'path'

const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ] })
const token = ""

var listeners: string[];

type Progress = {
    matching: number,
    nonMatching: number
}

var lastProgress = { matching: 0, nonMatching: 0 }

async function loadData(matching: boolean): Promise<number> {
    var schema: RowData[] = [
        { key: "version", type: DataType.NUMBER },
        { key: "timestamp", type: DataType.NUMBER },
        { key: "commit", type: DataType.NUMBER },
        { key: "code", type: DataType.NUMBER },
        { key: "codeSize", type: DataType.NUMBER },
        { key: "boot", type: DataType.NUMBER },
        { key: "bootSize", type: DataType.NUMBER },
        { key: "ovl", type: DataType.NUMBER },
        { key: "ovlSize", type: DataType.NUMBER },
        { key: "src", type: DataType.NUMBER },
        { key: "asm", type: DataType.NUMBER },
        { key: "nonMatchingCount", type: DataType.NUMBER },
    ]
    var totalPercent = 0.0

    try {
        var data: string = await (await fetch(`https://zelda64.dev/reports/${matching ? "progress_matching" : "progress"}.csv`)).text()
        var pd = new ProgressData(data, schema)
        var srcColumn = pd.getColumn("src")
        var asmColumn = pd.getColumn("asm")
        var src = srcColumn[srcColumn.length - 1]
        var asm = asmColumn[asmColumn.length - 1]
        var total = asm + src
        totalPercent = parseFloat((src / total * 100).toFixed(3))
    } catch (_) {
        console.log(_)
    }
    return totalPercent
}

async function updateData(){
    var newProgress: Progress = {
        matching: await loadData(true),
        nonMatching: await loadData(false)
    }
    if(lastProgress.matching != newProgress.matching || lastProgress.nonMatching != newProgress.nonMatching){
        lastProgress = newProgress
        listeners.forEach(async c => {
            var channel = client.channels.cache.get(c) as TextChannel
            if(channel){
                let embed = new MessageEmbed()
                                .setColor("#1010FF")
                                .setTitle("N64 Decompilation Team")
                                .setDescription("OoT Master Quest Progress")
                                .addFields(
                                    { name: 'Matching', value: `${newProgress.matching} %` },
                                    { name: 'Non-matching', value: `${newProgress.nonMatching} %` },
                                )
                                .setTimestamp()
                                .setFooter('Made with ❤️')
                channel.send({ embeds: [embed] })
            }
        })
    }
}

async function initBot() {
    const db = new BotSimpleDB(join(__dirname, 'cfg', 'data.json'))
    await db.init()

    listeners = db.get("listeners", [])

    client.on('ready', () => {
        setInterval(updateData, 5 * 60 * 1000)
        console.log("Connected!")
    })

    client.on('messageCreate', (message: Message) => {
        let raw = message.content.toLowerCase().trim()
        let prefix = "m64!"
        if(raw.startsWith("m64!")){
            let args = raw.split(" ")
            let cmd = args[0].split(prefix)[1]
            let shouldSave = false
            switch(cmd){
                case "oot":
                    switch(args[1]){
                        case "add":
                            var msg = `That channel already joined the decomp update channel`
                            if(!listeners.includes(message.channelId)) {
                                msg = `Added '${(message.channel as TextChannel).name}' to the oot decomp update channel`
                                listeners.push(message.channelId)
                                db.set("listeners", listeners)
                                shouldSave = true
                            }
                            message.channel.send(msg)
                            break
                        case "remove":
                            var msg = `That channel is not on the decomp update channel`
                            if(listeners.includes(message.channelId)) {
                                msg = `Removed '${(message.channel as TextChannel).name}' from the oot decomp update channel`
                                listeners = [...listeners.filter(c => c != message.channelId)]
                                db.set("listeners", listeners)
                                shouldSave = true
                            }
                            message.channel.send(msg)
                            break
                    }
                    break
            }
            if(shouldSave){
                db.save()
                shouldSave = false
            }
        }
    })

    await client.login(token)
}

initBot()
