commands= {
    rank:{
        name: 'rank',
        usage:'rank',
        argsRequired:0,
        code(msg,args){
            msg.channel.send('ranks');
        }
    },
    avatar:{
        name:'avatar',
        usage:'avatar <user mention>',
        argsRequired:1,
        code(msg,args){
            const userMention=msg.mentions.users.first();
            const avatarUrl=userMention.displayAvatarURL({size:1024});
            msg.channel.send(avatarUrl);
        }
    },
    icon:{
        name:'icon',
        usage:'icon',
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
        usage:'banner',
        argsRequired:0,
        code(msg,args){
            const bannerUrl=msg.guild.bannerURL();
            if(bannerUrl===null)
            msg.channel.send('null');
            else
            msg.channel.send(bannerUrl);
        }
    },
    sprite:{
        name:'sprite',
        usage:'sprite <type> <name>',
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
    storeImage:require('./storeimage.js'),
    getImage:require('./getimage'),
    volcan:{
        name:'whatisvolcandoing',
        usage:'whatisvolcandoing',
        argsRequired:0,
        code(msg,args){
            msg.channel.send('volcan is trolling');
        }
    },
    helpCommand:{
        name:'help',
        argsRequired:'any',
        code(msg,args){
            let cmds=msg.client.commands;
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
                    returnMsg+=`-${cmd}\n`;
                });
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