const { DiscordAPIError } = require("discord.js");
const Discord=require('discord.js');
const { re, sign } = require("mathjs");
const { code } = require("./grinchgame.js");
const db=require('./database.js');
const PREFIX=process.env.PREFIX;
module.exports={
    claimPoints:{
        name:'claim',
        description:'Claims points',
        usage:'claim <type>\nValid types: daily, hourly, 5min',
        category:'Points',
        status:true,
        argsRequired:[1],
        code(msg,args){
            const currentTime=new Date();
            const type=args[0];
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
                points=1000;
            }
            else if(type==='hourly'){
                fullCooldown=3600000;
                points=100;
            }
            else if(type==='5min'){
                fullCooldown=300000;
                points=10;
            }
            else{
                msg.channel.send('Invalid claim type.(use daily, hourly or 5min)');
                return;
            }
            if(timestamps.has(`${serverId}&${userId+type}`)){
                const timestamp=timestamps.get(`${serverId}&${userId+type}`);
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
                            timestamps.set(`${serverId}&${userId+type}`,currentTime);
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
                    timestamps.set(`${serverId}&${userId+type}`,currentTime);
                })
            }
        }
    },
    viewPoints:{
        name:'points',
        description:'Displays how many points someone currently has',
        usage:`points <tagged user (optional)>\n(e.g. ${PREFIX}points or ${PREFIX}points @someone)`,
        category:'Points',
        status:true,
        argsRequired:[0,1],
        code(msg,args){
            //const guildName=msg.member.displayName;
            const serverId=msg.guild.id;
            let userId;
            let guildName;
            if(args.length!==0){
            userId=msg.mentions.users.first().id;
            guildName=msg.mentions.members.get(userId).displayName;
            }
            else{
                userId=msg.author.id;
                guildName=msg.member.displayName;
            }
            db.query('SELECT name,points FROM points WHERE id=$1',[`${serverId}&${userId}`],(err,res)=>{
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
        usage:`roulette <# of points/all>\n(e.g. ${PREFIX}roulette 100 or ${PREFIX}roulette all)`,
        category:'Points',
        status:true,
        argsRequired:[1],
        code(msg,args){
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
            if((roulettePoints!=='all'&&(!(parseInt(roulettePoints))))||roulettePoints<0){
                msg.channel.send(`Invalid usage\n Usage: ${PREFIX}${this.usage}`);
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
        description:'Displays leaderboard of server members with most number of points',
        usage:'leaderboard <entires (optional)>\nNumber of entries shown on the leaderboard can be specified (0-25), default entries shown is 10',
        category:'Points',
        status:true,
        argsRequired:[0,1],
        code(msg,args){
            let entries= args[0]||10;
            const serverId=msg.guild.id;
            if(entries<0)
            entries=10;
            else if(entries>25)
            entries=25;
            db.query('SELECT * FROM points WHERE id LIKE $1 ORDER BY points DESC LIMIT $2',[`${serverId}%`,`${entries}`], async (err,res)=>{
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
                        let firstplace;
                        let firstplaceAvatar
                        try{
                        firstplace= await msg.guild.members.fetch(firstplaceId);
                        firstplace= firstplace.user;
                        firstplaceAvatar=firstplace.displayAvatarURL();
                        }
                        catch(err){
                            console.log(err);
                            firstplaceAvatar='';
                        }
                        footer={
                            text:`${res.rows[0].name} currently has the most points`/* \nAll time high`*/,
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
    },
    duel:{
        name:'duel',
        description:'Challenges another player to a duel, can specify type between normal duel and versus (vs) duel',
        usage:`duel <user mention> <points> <type (optional)>\n(e.g. ${PREFIX}duel @someone 100, ${PREFIX}duel @someone 400 normal, ${PREFIX}duel @someone 300 vs)`,
        category:'Points',
        status:true,
        argsRequired:[2,3],
        async code(msg,args){
            const serverId=msg.guild.id;
            const userId=msg.author.id;
            const guildName=msg.member.displayName;
            const userMention=msg.mentions.users.first();
            const points=args[1];
            const currentTime=Date.now();
            let vs=false;
            const feelsgoodman=msg.guild.emojis.cache.find((emote)=>{
                return emote.name==='feelsgoodman';
            }) || {name:'feelsgoodman',id:''};
            const pagchomp=msg.guild.emojis.cache.find((emote)=>{
                return emote.name==='pagchomp';
            }) || {name:'pagchomp',id:''};
            const feelsweirdman=msg.guild.emojis.cache.find((emote)=>{
                return emote.name==='feelsweirdman';
            }) || {name:'feelsweirdman',id:''};
            if(!userMention){
                msg.channel.send('Mention someone to challenge them\nUsage:'+PREFIX+this.usage);
                return;
            }
            if((!(parseInt(points)))||points<0){
                msg.channel.send('Please provide a valid number of points\nUsage: '+PREFIX+this.usage);
                return;
            }
            const mentionId=userMention.id;
            if(mentionId==userId){
                msg.channel.send(`You can\'t duel yourself <:${feelsweirdman.name}:${feelsweirdman.id}>`);
                return;
            }
            const mentionMember= await msg.guild.members.fetch(mentionId);
            const mentionName= mentionMember.displayName;
            if(!msg.client.cooldowns.get(this.name))
            {
                msg.client.cooldowns.set(this.name,new Discord.Collection());
            }
            const timestamps=msg.client.cooldowns.get(this.name);
            if(!msg.client.results.get(this.name))
            {
                msg.client.results.set(this.name,new Discord.Collection());
            }
            const record=msg.client.results.get(this.name);
            const res=await db.query('SELECT points FROM points WHERE id=$1',[`${serverId}&${userId}`]);
                let currentPoints=0;
                if(res.rowCount){
                    currentPoints=res.rows[0].points;
                }
                if(currentPoints<points){
                    msg.channel.send('You do not have that many points');
                }
            else if(record.has(`${serverId}&${mentionId}`)){
                msg.channel.send('This player is already being challenged, wait for them to finish the current duel');
            }
            else{
                if(args.length==3){
                    if(args[2]=='vs')
                    vs=true;
                    else if(args[2]=='normal')
                    vs=false;
                    else{
                        msg.channel.send(`Invalid duel type.\nValid types: normal (default), vs`);
                        return;
                    }
                }
                record.set(`${serverId}&${mentionId}`,{userId:userId,points:points,time:currentTime,vs:vs,accepted:false});
                await db.query('UPDATE points SET points=points-$1 WHERE id=$2',[`${points}`,`${serverId}&${userId}`]);
                if(!vs)
                msg.channel.send(`${guildName} is challenging ${mentionName} to a duel of ${points} points. <:${pagchomp.name}:${pagchomp.id}> Use ${PREFIX}accept or ${PREFIX}deny within two minutes to accept or deny`);
                else
                msg.channel.send(`${guildName} is challenging ${mentionName} to a versus duel of ${points} points. <:${pagchomp.name}:${pagchomp.id}> Use ${PREFIX}accept or ${PREFIX}deny within two minutes to accept or deny`);
            }
            if(!vs){
            setTimeout(async ()=>{
                if(record.has(`${serverId}&${mentionId}`)){
                    //console.log('run');
                    const duel=record.get(`${serverId}&${mentionId}`);
                    if(duel.userId==userId&&duel.points==points&&duel.time==currentTime){
                    record.delete(`${serverId}&${mentionId}`);
                    msg.channel.send(`${guildName}'s duel request against ${mentionName} timed out`);
                    const res=await db.query('UPDATE points SET points=points+$1 WHERE id=$2',[`${points}`,`${serverId}&${userId}`]);
                        if(res.rowCount<=0){
                            await db.query('INSERT INTO points VALUES ($1,$2,$3)',[`${serverId}&${userId}`,`${guildName}`,`${points}`]);
                        }
                }
                }
            },120000);
        }
        }
    },
    accept:{
        name:'accept',
        description:'Accepts someone\'s request to duel',
        usage:'accept',
        category:'Points',
        status:true,
        argsRequired:[0],
        async code(msg,args){
            const serverId=msg.guild.id;
            const user=msg.author;
            const userId=msg.author.id;
            const guildName=msg.member.displayName;
            const feelsgoodman=msg.guild.emojis.cache.find((emote)=>{
                return emote.name==='feelsgoodman';
            }) || {name:'feelsgoodman',id:''};
            const pagchomp=msg.guild.emojis.cache.find((emote)=>{
                return emote.name==='pagchomp';
            }) || {name:'pagchomp',id:''};
            if(!msg.client.cooldowns.get(this.name))
            {
                msg.client.cooldowns.set(this.name,new Discord.Collection());
            }
            const timestamps=msg.client.cooldowns.get(this.name);
            if(!msg.client.results.get('duel'))
            {
                msg.client.results.set('duel',new Discord.Collection());
            }
            const record=msg.client.results.get('duel');
            //console.log(record);
            if(record.has(`${serverId}&${userId}`)){
                const duel=record.get(`${serverId}&${userId}`);
                const challengerId=duel.userId;
                const challengerMember=await msg.guild.members.fetch(challengerId);
                const challengerUser=challengerMember.user;
                const challengerName=challengerMember.displayName;
                const points=duel.points;
                const vs=duel.vs;
                const res=await db.query('SELECT points FROM points WHERE id=$1',[`${serverId}&${userId}`]);
                let currentPoints=0;
                if(res.rowCount){
                    currentPoints=res.rows[0].points;
                }
                if(currentPoints<points){
                    record.delete(`${serverId}&${userId}`);
                    msg.channel.send('You do not have enough points the accept the duel, the duel is cancelled');
                    const res=await db.query('UPDATE points SET points=points+$1 WHERE id=$2',[`${points}`,`${serverId}&${challengerId}`]);
                        if(res.rowCount<=0){
                            await db.query('INSERT INTO points VALUES ($1,$2,$3)',[`${serverId}&${challengerId}`,`${guildName}`,`${points}`]);
                        }
                    return;
                }
                if(!vs){
                const result=Math.random()<0.5 ? 'challenger':'receiver';
                if(result=='challenger'){
                    const res1=await db.query('UPDATE points SET points=points+$1 WHERE id=$2',[`${points*2}`,`${serverId}&${challengerId}`]);
                    if(res1.rowCount<=0){
                        await db.query('INSERT INTO points VALUES ($1,$2,$3)'[`${serverId}&${challengerId}`,`${challengerName}`,`${points*2}`]);
                    }
                    const res2=await db.query('UPDATE points SET points=points-$1 WHERE id=$2',[`${points}`,`${serverId}&${userId}`]);
                    if(res2.rowCount<=0){
                        await db.query('INSERT INTO points VALUES ($1,$2,$3)'[`${serverId}&${userId}`,`${guildName}`,`0`]);
                    }
                    msg.channel.send(`${challengerName} won the duel against ${guildName} <:${pagchomp.name}:${pagchomp.id}> ${challengerName} won ${points*2} points! <:${feelsgoodman.name}:${feelsgoodman.id}>`);
                }
                else if(result=='receiver'){
                    const res=await db.query('UPDATE points SET points=points+$1 WHERE id=$2',[`${points}`,`${serverId}&${userId}`]);
                    if(res.rowCount<=0){
                        await db.query('INSERT INTO points VALUES ($1,$2,$3)',[`${serverId}&${userId}`,`${guildName}`,`${points}`]);
                    }
                    msg.channel.send(`${guildName} won the duel against ${challengerName} <:${pagchomp.name}:${pagchomp.id}> ${guildName} won ${points*2} points! <:${feelsgoodman.name}:${feelsgoodman.id}>`);
                }
                record.delete(`${serverId}&${userId}`);
            }
            else{
                const {RandDescription,Player,Action,Game,Response}=require('./duelgame.js');
                const duel=record.get(`${serverId}&${userId}`);
                duel.accepted=true;
                record.set(`${serverId}&${userId}`,duel);
                await db.query('UPDATE points SET points=points-$1 WHERE id=$2',[`${points}`,`${serverId}&${userId}`]);
                const player1=new Player(guildName,user,challengerName,serverId);
                const player2=new Player(challengerName,challengerUser,guildName,serverId);
                const game=new Game(player1,player2,duel.points,msg.channel);
                game.startGame();
            }
            }
            else{
                msg.channel.send('There\'s no one challenging you at the moment');
            }
        }
    },
    cancelduel:{
        name:'cancelduel',
        description:'Cancels your request to duel the tagged user, if no users are tagged, removes all outstanding duel requests you currently have',
        usage:'cancelduel <user mention (optional)>',
        category:'Points',
        status:true,
        argsRequired:[0,1],
        async code(msg,args){
            try{
            const serverId=msg.guild.id;
            const userId=msg.author.id;
            const guildName=msg.member.displayName;
            if(!msg.client.cooldowns.get(this.name))
            {
                msg.client.cooldowns.set(this.name,new Discord.Collection());
            }
            const timestamps=msg.client.cooldowns.get(this.name);
            if(!msg.client.results.get('duel'))
            {
                msg.client.results.set('duel',new Discord.Collection());
            }
            const record=msg.client.results.get('duel');
            if(args.length===0){
                record.forEach(async(duel,key,map)=>{
                    if(duel.userId==userId&&duel.accepted==false){
                        const res=await db.query('UPDATE points SET points=points+$1 WHERE id=$2',[`${duel.points}`,`${serverId}&${userId}`]);
                        if(res.rowCount<=0){
                            await db.query('INSERT INTO points VALUES ($1,$2,$3)',[`${serverId}&${userId}`,`${guildName}`,`${duel.points}`]);
                        }
                        map.delete(key);
                    }
                });
                msg.channel.send('Duel requests cancelled');
            }
            else if(args.length===1){
                const userMention=msg.mentions.users.first();
                if(!userMention){
                    msg.channel.send('mention someone to cancel the duel\nUsage:'+PREFIX+this.usage);
                    return;
                }
                const mentionId=userMention.id;
                const mentionMember= await msg.guild.members.fetch(mentionId);
                const mentionName= mentionMember.displayName;
                record.forEach(async(duel,key,map)=>{
                    if(duel.userId==userId&&key==`${serverId}&${mentionId}`&&duel.accepted==false){
                        const res=await db.query('UPDATE points SET points=points+$1 WHERE id=$2',[`${duel.points}`,`${serverId}&${userId}`]);
                        if(res.rowCount<=0){
                            await db.query('INSERT INTO points VALUES ($1,$2,$3)',[`${serverId}&${userId}`,`${guildName}`,`${duel.points}`]);
                        }
                        map.delete(key);
                        msg.channel.send('Duel request against '+mentionName+' cancelled');
                    }
                });
            }
        }
        catch(err){
            console.log(err);
        }
        }
    },
    deny:{
        name:'deny',
        description:'Deny someone\'s request to duel you',
        usage:'deny',
        category:'Points',
        status:true,
        argsRequired:[0],
        async code(msg,args){
            try{
            const serverId=msg.guild.id;
            const userId=msg.author.id;
            const guildName=msg.member.displayName;
            const feelsbadman=msg.guild.emojis.cache.find((emote)=>{
                return emote.name==='feelsbadman';
            }) || {name:'feelsbadman',id:''};
            if(!msg.client.cooldowns.get(this.name))
            {
                msg.client.cooldowns.set(this.name,new Discord.Collection());
            }
            const timestamps=msg.client.cooldowns.get(this.name);
            if(!msg.client.results.get('duel'))
            {
                msg.client.results.set('duel',new Discord.Collection());
            }
            const record=msg.client.results.get('duel');
            if(record.has(`${serverId}&${userId}`)){
                const duel=record.get(`${serverId}&${userId}`);
                if(duel.accepted){
                    msg.channel.send('There\'s no one challenging you at the moment');
                    return;
                }
                const challengerId=duel.userId;
                const challengerMember=await msg.guild.members.fetch(challengerId);
                const challengerName=challengerMember.displayName;
                const points=duel.points;
                record.delete(`${serverId}&${userId}`);
                const res=await db.query('UPDATE points SET points=points+$1 WHERE id=$2',[`${points}`,`${serverId}&${challengerId}`]);
                        if(res.rowCount<=0){
                            await db.query('INSERT INTO points VALUES ($1,$2,$3)',[`${serverId}&${challengerId}`,`${guildName}`,`${points}`]);
                        }
                msg.channel.send(`${guildName} denied ${challengerName}'s challenge to a duel <:${feelsbadman.name}:${feelsbadman.id}>`);
            }
            else{
                msg.channel.send('There\'s no one challenging you at the moment');
            }
        }
        catch(err){
            console.log(err);
        }
        }
    }
}