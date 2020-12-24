const Discord = require('discord.js');
const PREFIX= process.env.PREFIX;
commands= {
    rank:{
        name: 'rank',
        description:"ranks",
        usage:'rank',
        category:'Basic',
        status:false,
        argsRequired:[0],
        code(msg,args){
            msg.channel.send('ranks');
        }
    },
    avatar:{
        //gets user avatar/profile picture
        name:'avatar',
        description:"Gets the tagged user's avatar/profile picture",
        usage:'avatar <user mention>\n(e.g. avatar @someone)',
        category:'Basic',
        status:true,
        argsRequired:[1],
        code(msg,args){
            const userMention=msg.mentions.users.first();
            const avatarUrl=userMention.displayAvatarURL({size:1024});
            msg.channel.send(avatarUrl);
        }
    },
    icon:{
        //gets server icon
        name:'icon',
        description:"Gets the server icon",
        usage:'icon',
        category:'Basic',
        status:true,
        argsRequired:[0],
        code(msg,args){
            const iconUrl=msg.guild.iconURL();
            if(iconUrl===null)
            msg.channel.send('null');
            else
            msg.channel.send(iconUrl);
        }
    },
    banner:{
        //gets server banner
        name:'banner',
        description:"Gets the server banner",
        usage:'banner',
        category:'Basic',
        status:true,
        argsRequired:[0],
        code(msg,args){
            const bannerUrl=msg.guild.bannerURL();
            if(bannerUrl===null)
            msg.channel.send('No banner found.');
            else
            msg.channel.send(bannerUrl);
        }
    },
    sprite:{
        name:'sprite',
        description:"Gets the indicated rotmg sprite",
        usage:`sprite <type> <name>\n(e.g. ${PREFIX}sprite Enemies Dreadstump_the_Pirate_King)\nValid types: Abilites, Armor, Characters, Classes, Consumable, Enemies, Environment, Misc_items, Pets, Projectiles, Rings, Skins, Status_Effects, Untiered, Weapons, Wiki Misc, (_type)`,
        category:'Misc',
        status:true,
        argsRequired:[2],
        code(msg,args){
            let type=args[0];
            let name=args[1];
            type=type.replace(/_/g,'%20');
            name=name.replace(/_/g,'%20');
            const spriteUrl='https://static.drips.pw/rotmg/wiki/'+type+'/'+name+'.png';
            //msg.channel.send(spriteUrl);
            let embed = new Discord.MessageEmbed();
            embed.setImage(spriteUrl);
            msg.channel.send(embed);
            /*const imgExists=require('url-exists');
            const valid=imgExists('spriteUrl',(error,exists)=>{
                if(error)
                console.log(error);
                else
                {
                    return exists;
                }
            });
            if(exists)
                    msg.channel.send(spriteUrl);
                    else
                    msg.channel.send('error');*/
        }
    },
    graph:require('./graph.js'),
    storeImage:require('./imagestorage.js').storeImage,
    getImage:require('./imagestorage.js').getImage,
    deleteImage:require('./imagestorage.js').deleteImage,
    imglist:require('./imagestorage.js').imglist,
    coinflip:require('./randcommands.js').coinflip,
    randNum:require('./randcommands.js').randNum,
    claimPoints:require('./pointscommands.js').claimPoints,
    viewPoints:require('./pointscommands.js').viewPoints,
    roulette:require('./pointscommands.js').roulette,
    leaderboard:require('./pointscommands.js').leaderboard,
    helpCommand:{
        name:'help',
        description:"Provides information on commands and their usage",
        category:'Basic',
        argsRequired:[0,1],
        status:true,
        code(msg,args){
            let cmds=msg.client.commands;
            let rsps=msg.client.responses;
            //lists all commands
            if(args.length===0)
            {
                let embed=new Discord.MessageEmbed();
                embed.setTitle('Available commands');
                let groups={};
                cmds.forEach((cmd)=>{
                    if(cmd.category){
                    if(!(groups[(cmd.category)])){
                        groups[(cmd.category)]=[];
                    }
                    groups[cmd.category].push(PREFIX+cmd.name);
                }
                else{
                    if(!(groups['Other'])){
                        groups['Other']=[];
                    }
                    groups['Other'].push(PREFIX+cmd.name);
                }
                });
                rsps.forEach((cmd)=>{
                    if(cmd.category){
                    if(!(groups[(cmd.category)])){
                        groups[(cmd.category)]=[];
                    }
                    groups[cmd.category].push(cmd.name);
                }
                else{
                    if(!(groups['Other'])){
                        groups['Other']=[];
                    }
                    groups['Other'].push(cmd.name);
                }
                });
                for(let group in groups ){
                    let list='';
                    groups[group].forEach((element)=>{
                        list+=element+' ';
                    });
                    embed.addField(group,list);
                }
                embed.setColor(0xf84343);
                /*let client= msg.client.user;
                if(client)
                embed.setFooter(`For help on a specific command, use ${PREFIX}help <command name>`,client.displayAvatarURL());
                else*/
                embed.setFooter(`For help on a specific command, use ${PREFIX}help <command name>`);
                
                /*Object.keys(cmds).forEach((cmd)=>{
                    console.log(cmd);
                    returnMsg+=`${cmd}, \n`;
                })*/
                /*cmds.map((cmd)=>{
                    cmd=cmd.name;
                    returnMsg+=`-${cmd}\n`;
                });
                rsps.map((response)=>{
                    response=response.name;
                    returnMsg+=`${response}\n`;
                })*/
                //console.log(cmds.rank);
                //returnMsg+=cmds.join(', \n');
                msg.channel.send(embed);
            }
            //help for specific command
            else
            {
                let cmd=cmds.get(args[0]);
                let rsp=rsps.get(args[0]);
                let cmdRsp=cmd||rsp;
                {
                    if(cmdRsp!==undefined){
                        let embed=new Discord.MessageEmbed();
                        embed.setTitle(cmdRsp['name']);
                        let usage=cmd['usage']||'no usage doc yet';
                        let description=cmdRsp['description']||'no description yet';
                        usage=PREFIX+usage;
                        embed.addField('Description',description);
                        embed.addField('Usage',usage);
                        embed.setColor(0xf84343);
                        msg.channel.send(embed);
                    }
                    else
                    msg.channel.send('command does not exist');
                }
            }
        }
    }
};
module.exports=commands;