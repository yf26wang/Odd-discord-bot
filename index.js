require('dotenv').config();
const Discord= require('discord.js');
const client= new Discord.Client();
const TOKEN = process.env.TOKEN;
client.commands= new Discord.Collection();

client.on('ready', ()=>{
    console.info('ready');
});

const commands=require('./allcommands.js');

//const commandNameArray= Object.keys(commands);
for(let command in commands){
    client.commands.set(commands[command].name,commands[command]);
}
const allXp=require('./allXp');
client.on('message', (msg)=>{
    const sender=msg.author.tag;
    const args=msg.content.split(' ');
    const commandName=args.shift();
    if(sender!==client.user.tag)
    {
    if(client.commands.has(commandName))
    {
        try{
            const currentCommand=client.commands.get(commandName);
            if(currentCommand.argsRequired===args.length||currentCommand.argsRequired==='any')
            {
            currentCommand.code(msg,args);
            }
            else
            msg.channel.send(`${currentCommand.argsRequired} arguments are needed for this command`);
        }
        catch(e){
            msg.channel.send('error');
            console.log(e);
        }
    }
    //xp and lvling
    if(allXp[sender]===undefined)
    allXp[sender]=0;
    else
    allXp[sender]+=5;
}
});
client.login(TOKEN);