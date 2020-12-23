const { DiscordAPIError } = require("discord.js");
const Discord=require('discord.js');
const { re } = require("mathjs");
module.exports={
    claimPoints:{
        name:'claim',
        description:'Claims points(options: daily, hourly, 5min)',
        usage:'claim <type>',
        status:true,
        argsRequired:[1],
        code(msg,args){
            const currentTime=new Date();
            const type=args[0];
            const db=require('./database.js');
            const serverId=msg.guild.id;
            const userId=msg.author.id;
            const name=msg.author.username;
            const guildName=msg.member.displayName;
            let fullCooldown;
            let points;
            if(!msg.client.cooldowns.get(this.name))
            {
                msg.client.cooldowns.set(this.name,new Discord.Collection());
            }
            const timestamps=msg.client.cooldowns.get(this.name);
            if(type==='daily'){
                fullCooldown=86400000;
                points=3000;
            }
            else if(type==='hourly'){
                fullCooldown=3600000;
                points=100;
            }
            else if(type==='5min'){
                fullCooldown=300000;
                points=5;
            }
            else{
                msg.channel.send('Invalid claim type.(use daily, hourly or 5min)');
                return;
            }
            if(timestamps.has(msg.author.id+type)){
                const timestamp=timestamps.get(msg.author.id+type)
                if(currentTime.getTime()-timestamp<fullCooldown){
                    const cooldown= Math.round((fullCooldown-(currentTime.getTime()-timestamp))/1000);
                    const cooldownSeconds=cooldown%(60);
                    const cooldownMinutes=((cooldown-cooldownSeconds)%(60*60))/60;
                    const cooldownHours=(cooldown-cooldownMinutes*60-cooldownSeconds)/(60*60);
                    let returnMsg='You can use this again in ';
                    if(cooldownHours){
                        returnMsg+=`${cooldownHours} hours`;
                        if(cooldownMinutes){
                            returnMsg+=`, ${cooldownMinutes} minutes`;
                        }
                        if(cooldownSeconds){
                            returnMsg+=`, ${cooldownSeconds} seconds`;
                        }
                    }
                    else if(cooldownMinutes){
                        returnMsg+=`${cooldownMinutes} minutes`;
                        if(cooldownMinutes){
                            returnMsg+=`, ${cooldownSeconds} seconds`;
                        }
                    }
                    else{
                        returnMsg+=`${cooldownSeconds} seconds`;
                    }
                    
                    msg.channel.send(returnMsg);
                }
                else{
                    db.query('UPDATE points SET points=points +$1 WHERE id=$2;',[`${points}`,`${serverId}&${userId}`],(err,res)=>{
                        if(err)
                        console.log(err);
                        else
                        {
                            if(res.rowCount){
                            msg.channel.send(`${guildName} claimed ${points} points.`);
                            }
                            else{
                                msg.channel.send('no rows');
                                msg.channel.send('error');
                            }
                            timestamps.set(msg.author.id+type,currentTime);
                        }
                        
                    });
                }
            }
            else{
                db.query(`UPDATE points SET points=points+$1 WHERE id=$2;`,[`${points}`,`${serverId}&${userId}`],(err,res)=>{
                    if(err)
                    console.log(err);
                    else
                    {
                        if(res.rowCount){
                            msg.channel.send(`${guildName} claimed ${points} points.`);
                            }
                            else{
                                db.query(`INSERT INTO points VALUES($1,$2,$3)`,[`${serverId}&${userId}`,`${guildName}`,`${points}`],(err,res)=>{
                                    if(err)
                                    console.log(err)
                                    else{
                                        if(res.rowCount){
                                            msg.channel.send(`${guildName} claimed ${points} points.`);
                                        }
                                    }
                                });
                            }
                        
                    }
                    timestamps.set(msg.author.id+type,currentTime);
                })
            }
        }
    },
    viewPoints:{
        name:'points',
        description:'Displays how many points you currently have.',
        usage:'points',
        status:true,
        argsRequired:[0],
        code(msg,args){
            const guildName=msg.member.displayName;
            const serverId=msg.guild.id;
            const userId=msg.author.id;
            const db=require('./database.js');
            db.query('SELECT points FROM points WHERE id=$1',[`${serverId}&${userId}`],(err,res)=>{
                if(err)
                console.log(err);
                else{
                    if(res.rowCount){
                        msg.channel.send(`${guildName} currently has ${res.rows[0].points} points.`);
                    }
                    else{
                        msg.channel.send(`${guildName} currently has 0 points.`);
                    }
                }
            });
        }
    },
    roulette:{
        name:'roulette',
        description:'Plays roulette with a chance to double inputted points or lose them',
        usage:'roulette <points/all>',
        status:true,
        argsRequired:[1],
        code(msg,args){
            db=require('./database.js');
            let roulettePoints=args[0];
            const serverId=msg.guild.id;
            const userId=msg.author.id;
            const guildName=msg.member.displayName;
            const feelsbadman=msg.guild.emojis.cache.find((emote)=>{
                return emote.name==='feelsbadman';
            }) || {name:'feelsbadman',id:''};
            const feelsgoodman=msg.guild.emojis.cache.find((emote)=>{
                return emote.name==='feelsgoodman';
            }) || {name:'feelsgoodman',id:''};
            if((roulettePoints!=='all'&&(parseInt(roulettePoints)==NaN))||roulettePoints<0){
                msg.channel.send(`Invalid usage\n Usage: -${this.usage}`);
                return;
            }
            db.query('SELECT * FROM points WHERE id=$1',[`${serverId}&${userId}`],(err,res)=>{
                if(err)
                console.log(err);
                else{
                    if(res.rowCount!=0){
                        const currentPoints=res.rows[0].points;
                        let allIn;
                        if(roulettePoints==='all'){
                        roulettePoints=currentPoints;
                        allIn=true;
                        }
                        else{
                            allIn=false;
                        }
                        roulettePoints=Math.floor(roulettePoints);
                        if(currentPoints<roulettePoints){
                            msg.channel.send(`You do not have that many points`);
                            return;
                        }
                        const result=Math.random()<=0.5 ? 'Lost':'Won';
                        let returnMsg;
                        let newPoints;
                        if(result==='Won'){
                            newPoints=currentPoints+roulettePoints
                            if(allIn){
                                returnMsg=`${guildName} went all in and won ${roulettePoints} points <:${feelsgoodman.name}:${feelsgoodman.id}> they now have ${newPoints} points!`;
                            }
                            else{
                                returnMsg=`${guildName} won ${roulettePoints} points in roulette and now has ${newPoints} points! <:${feelsgoodman.name}:${feelsgoodman.id}>`;
                            }
                        }
                        else{
                            newPoints=currentPoints-roulettePoints;
                            if(allIn){
                                returnMsg=`${guildName} went all in and lost all of their ${roulettePoints} points <:${feelsbadman.name}:${feelsbadman.id}> they now have ${newPoints} points`;
                            }
                            else{
                                returnMsg=`${guildName} lost ${roulettePoints} points in roulette and now has ${newPoints} points! <:${feelsbadman.name}:${feelsbadman.id}>`;
                            }
                        }
                        db.query('UPDATE points SET points=$1 WHERE id=$2;',[`${newPoints}`,`${serverId}&${userId}`],(err,res)=>{
                            if(err)
                            console.log(err);
                            else{
                                msg.channel.send(returnMsg);
                            }
                        });
                    }
                    else
                    msg.channel.send(`You do not have that many points`);
                }
            })
        }
    },
    leaderboard:{
        name:'leaderboard',
        description:'',
        usage:'leaderboard <entires(optional>',
        status:true,
        argsRequired:[0,1],
        code(msg,args){
            db=require('./database.js');
            let entries= args[0]||10;
            const serverId=msg.guild.id;
            if(entries<0)
            entries=10;
            else if(entries>25)
            entries=25;
            db.query('SELECT * FROM points WHERE id LIKE $1 ORDER BY points DESC LIMIT $2',[`${serverId}%`,`${entries}`],(err,res)=>{
                if(err)
                console.log(err);
                else{
                    const fields=[];
                    res.rows.forEach((row,i)=>{
                        fields.push({
                            name:`${i+1}. ${row.name}`,
                            value:`${row.points} points`,
                        });
                    });
                        let thumbnail;
                        let footer;
                        if(res.rowCount>0){
                        const firstRowId=res.rows[0].id;
                        const firstplaceId=firstRowId.substring(firstRowId.indexOf('&')+1);
                        const firstplace=msg.client.users.cache.get(firstplaceId);
                        const firstplaceAvatar=firstplace.displayAvatarURL();
                        footer={
                            text:`${res.rows[0].name} currently has the most points`,
                            icon_url:firstplaceAvatar,
                        }
                        thumbnail={
                            url:firstplaceAvatar,
                            proxyURL:'',
                            height:1,
                            width:1,
                        }
                        }
                        else{
                            thumbnail={};
                            footer={};
                        }
                        const leaderboardEmbed = {
                            color: 0xf84343,
                            title: 'LeaderBoard',
                            thumbnail: thumbnail,
                            fields: fields,
                            timestamp: new Date(),
                            footer: footer,
                }
                msg.channel.send({embed:leaderboardEmbed});
            }
            });
            //const exampleEmbed=new Discord.MessageEmbed();
            
            
        }
    }
    
}