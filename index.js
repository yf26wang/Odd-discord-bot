require('dotenv').config();
const Discord= require('discord.js');
const client= new Discord.Client();
const TOKEN = process.env.TOKEN;
client.commands= new Discord.Collection();
client.responses= new Discord.Collection();
const PREFIX='-';
const sqlite3=require('sqlite3');
const storedimgs=new sqlite3.Database('./storedimgs.sqlite');

client.on('ready', ()=>{
    if((storedimgs.get("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='imgs';"))==0)
    {
        storedimgs.run("CREATE TABLE imgs(id TEXT PRIMARY KEY, name TEXT, url TEXT);")
    }
    console.log('ready');
});
//load commands
const commands=require('./allcommands.js');;
const responses=require('./noprefixcommands.js');
//const commandNameArray= Object.keys(commands);
for(let command in commands){
    if(commands[command].status===true)
    client.commands.set(commands[command].name,commands[command]);
}
for(let response in responses){
    if(responses[response].status===true)
    client.responses.set(responses[response].name,responses[response]);
}
const allXp=require('./allXp');
client.on('message', (msg)=>{
    const sender=msg.author.tag;
    if(sender===client.user.tag)
    return;
    const args=msg.content.split(' ');
    let commandName=args.shift();
    if(client.responses.has(commandName))
    {
        try{
        const currentResponse=client.responses.get(commandName);
        if(currentResponse.argsRequired.includes(args.length)||currentResponse.argsRequired.includes('any'))
        {
            currentResponse.code(msg,args);
        }
        }
        catch(e)
        {
            msg.channel.send('error');
        }
    }
    if(commandName.charAt(0)!=PREFIX)
    return;
    commandName=commandName.substring(1);
    if(client.commands.has(commandName))
    {
        try{
            const currentCommand=client.commands.get(commandName);
            if(currentCommand.argsRequired.includes(args.length)||currentCommand.argsRequired.includes('any'))
            {
            currentCommand.code(msg,args);
            }
            else
            msg.channel.send(`Usage: ${currentCommand.usage}\nFor more details, use ${PREFIX}help ${currentCommand.name}.`);
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