commands= {
    rank:{
        name: 'rank',
        description:"",
        usage:'rank',
        status:true,
        argsRequired:0,
        code(msg,args){
            msg.channel.send('ranks');
        }
    },
    avatar:{
        name:'avatar',
        description:"",
        usage:'avatar <user mention>',
        status:true,
        argsRequired:1,
        code(msg,args){
            const userMention=msg.mentions.users.first();
            const avatarUrl=userMention.displayAvatarURL({size:1024});
            msg.channel.send(avatarUrl);
        }
    },
    icon:{
        name:'icon',
        description:"",
        usage:'icon',
        status:true,
        argsRequired:0,
        code(msg,args){
            const iconUrl=msg.guild.iconURL();
            if(iconUrl===null)
            msg.channel.send('null');
            else
            msg.channel.send(iconUrl);
        }
    },
    banner:{
        name:'banner',
        description:"",
        usage:'banner',
        status:true,
        argsRequired:0,
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
        description:"",
        usage:'sprite <type> <name>',
        status:true,
        argsRequired:2,
        code(msg,args){
            let type=args[0];
            let name=args[1];
            type=type.replace(/_/g,'%20');
            name=name.replace(/_/g,'%20');
            const spriteUrl='https://static.drips.pw/rotmg/wiki/'+type+'/'+name+'.png';
            //msg.channel.send(spriteUrl);
            const Discord = require('discord.js');
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
    coinflip:require('./randcommands.js').coinflip,
    randNum:require('./randcommands.js').randNum,
    helpCommand:{
        name:'help',
        description:"",
        argsRequired:'any',
        status:true,
        code(msg,args){
            let cmds=msg.client.commands;
            let rsps=msg.client.responses;
            if(args.length===0)
            {
                let returnMsg='Available commands: \n';
                /*Object.keys(cmds).forEach((cmd)=>{
                    console.log(cmd);
                    returnMsg+=`${cmd}, \n`;
                })*/
                /*for(let cmd in cmds)
                {
                    console.log(cmd);
                    returnMsg+=cmds[cmd].name+'\n';
                }*/
                cmds.map((cmd)=>{
                    cmd=cmd.name;
                    returnMsg+=`!${cmd}\n`;
                });
                rsps.map((response)=>{
                    response=response.name;
                    returnMsg+=`${response}\n`;
                })
                //console.log(cmds.rank);
                //returnMsg+=cmds.join(', \n');
                msg.channel.send(returnMsg);
            }
            else
            {
                let cmd=cmds.get(args[0]);
                {
                    if(cmd!==undefined){
                        let usage=cmd['usage'];
                        if(usage!==undefined)
                        msg.channel.send(`usage: ${usage}`);
                        else
                        msg.channel.send('no usage doc yet');
                    }
                    else
                    msg.channel.send('command does not exist');
                }
            }
        }
    }
};
module.exports=commands;