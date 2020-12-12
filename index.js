//declaring and importing
require('dotenv').config();
const Discord= require('discord.js');
const client= new Discord.Client();
const TOKEN = process.env.TOKEN;
client.commands= new Discord.Collection();
client.responses= new Discord.Collection();
/*client.timestamps= new Discord.Collection();
client.results=new Discord.Collection();*/
const PREFIX='-';
const sqlite3=require('sqlite3');
const storedimgs=new sqlite3.Database('./storedimgs.sqlite');

//ready event
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
/*for(let command in serverCommands){
    if(serverCommands[command].status===true)
    client.commands.set(serverCommands[command].name,serverCommands[command]);
}*/
const allXp=require('./allXp');

//handle commands and responses
client.on('message', (msg)=>{
    const sender=msg.author.tag;
    if(sender===client.user.tag)
    return;
    const args=msg.content.split(' ');
    let commandName=args.shift();
    //responses
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
        return;
    }
    //commands
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
        return;
    }

    if(msg.guild){
    let emote= msg.guild.emojis.cache.find((emote)=>{
        return emote.name===commandName;
    });
    let emoteMsg="";
    if(emote){
        if(!msg.deleted){
            msg.delete();
            msg.deleted=true;
            }
        msg.channel.send(msg.member.displayName+':');
        if(emote.animated)
        emoteMsg+=`<a:${emote.name}:${emote.id}>`;
        else
        emoteMsg+=`<:${emote.name}:${emote.id}>`;
    for(let i=0;i<args.length;i++){
        if(args[i].charAt(0)==='-'){
            args[i]=args[i].substring(1);
            emote= msg.guild.emojis.cache.find((emote)=>{
                return emote.name===args[i];
            });
            if(emote){
                if(emote.animated)
                emoteMsg+=`<a:${emote.name}:${emote.id}>`;
                else
                emoteMsg+=`<:${emote.name}:${emote.id}>`;
            }
        }
    }
}
    msg.channel.send(emoteMsg);
}
    /*xp and lvling
    if(allXp[sender]===undefined)
    allXp[sender]=0;
    else
    allXp[sender]+=5;*/

});
client.login(TOKEN);