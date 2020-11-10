require('dotenv').config();
const Discord= require('discord.js');
const client= new Discord.Client();
const TOKEN = process.env.TOKEN;
client.commands= new Discord.Collection();
const PREFIX='!';
const sqlite3=require('sqlite3');
const storedimgs=new sqlite3.Database('./storedimgs.sqlite');

client.on('ready', ()=>{
    if((storedimgs.get("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='imgs';"))==0)
    {
        storedimgs.run("CREATE TABLE imgs(id TEXT PRIMARY KEY, name TEXT, url TEXT);")
    }
    console.log('ready');
});
const commands=require('./allcommands.js');;

//const commandNameArray= Object.keys(commands);
for(let command in commands){
    client.commands.set(commands[command].name,commands[command]);
}
const allXp=require('./allXp');
client.on('message', (msg)=>{
    const sender=msg.author.tag;
    if(sender===client.user.tag)
    return;
    const args=msg.content.split(' ');
    let commandName=args.shift();
    if(commandName.charAt(0)!=PREFIX)
    return;
    commandName=commandName.substring(1);
    if(client.commands.has(commandName))
    {
        try{
            const currentCommand=client.commands.get(commandName);
            if(currentCommand.argsRequired===args.length||currentCommand.argsRequired==='any')
            {
            currentCommand.code(msg,args);
            }
            else
            msg.channel.send(`Usage: ${currentCommand.usage}\n For more details, use help ${currentCommand.name}.`);
        }
        catch(e){
            msg.channel.send('error');
            console.log(e);
        }
    }
    /*xp and lvling
    if(allXp[sender]===undefined)
    allXp[sender]=0;
    else
    allXp[sender]+=5;*/

});
client.login(TOKEN);