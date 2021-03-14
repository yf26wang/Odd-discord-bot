const Discord=require('discord.js');
const db=require('./database.js');
const PREFIX= process.env.PREFIX;
class Pet{
    constructor(name,sprite,lvl,currentXp,stats,userId,userGuildName,serverId){
        this.name=name;
        this.sprite=sprite;
        this.lvl=lvl;
        this.currentXp=currentXp;
        this.stats=stats;
        this.userId=userId;
        this.userGuildName=userGuildName;
        this.serverId=serverId;
        this.xpRequired= 500*(lvl^2);
    }
    async save(saveList){
        try{
            const res= await db.query('UPDATE pets SET user_name=$1 ,pet_name=$2, sprite=$3, lvl=$4, current_xp=$5, stats=$6 WHERE id=$7',[this.userGuildName,this.name,this.sprite,`${this.lvl}`,`${this.currentXp}`,`${JSON.stringify(this.stats)}`,`${this.serverId}&${this.userId}`]);
                if(!res.rowCount){
                    await db.query('INSERT INTO pets VALUES ($1,$2,$3,$4,$5,$6,$7)',[`${this.serverId}&${this.userId}`,this.userGuildName,this.name,this.sprite,`${this.lvl}`,`${this.currentXp}`,`${JSON.stringify(this.stats)}`]);
                }
        }
        catch(err){
            console.log(err);
        }
    }
}

module.exports={
        name:'pet',
        description:'commands related to pets',
        usage:'pet <command>',
        category:'Pets',
        status:false,
        argsRequired:[1],
        async code(msg,args){
            const serverId=msg.guild.id;
            const user=msg.author;
            const userId=user.id;
            const guildName= msg.member.displayName;
            const command=args[0];
            try{
                if(command=='info'){
                    const res= await db.query('SELECT * FROM pets WHERE id=$1',[`${serverId}&${userId}`]);
                    if(!res.rowCount){
                        msg.channel.send(`You do not have a pet, use ${PREFIX}pet create to get one.`);
                        return;
                    }
                    const data=res.rows[0];
                    const current= new Pet(data.pet_name,data.sprite,data.lvl,data.current_xp,JSON.parse(data.stats),userId,guildName,serverId);
                    const info= new Discord.MessageEmbed();
                    info.setAuthor(`${guildName}'s ${current.name}`,user.displayAvatarURL());
                    info.setImage(current.sprite);
                    info.setTitle(`${current.lvl}🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩${current.lvl+1}`);
                    info.setDescription(`${current.currentXp}xp/${current.xpRequired}xp\nStatistics`);
                    info.addField('|🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩|health','|🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩|mana');
                    info.addField('|🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩|attack','|🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩|defense ssadsasddassasdcxasaddddddddddddddddddasdasdsadddddddddddddddddd');
                    info.addField('|🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩|speed','|🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩|vitality?\nActions');
                    info.addField('1\ufe0f\u20e3feed','feed the pet',true);
                    info.addField('2\ufe0f\u20e3rename','rename the pet',true);
                    info.addField('3\ufe0f\u20e3change sprite','change the sprite',true);
                    msg.channel.send(info);
                }
                else if(command=='create'){
                    const current= new Pet('white','https://www.realmeye.com/forum/uploads/default/original/1X/842ee5c4e569c7b7c1b0bf688e465a7435235fc8.png',1,0,{
                        health:10,
                        mana:10,
                        attack:10,
                        defense:11,
                        speed:48,
                        vitality:43
                    },userId,guildName,serverId);
                    await current.save();
                    msg.channel.send('pet created');
                }
            }
            catch(err){
                console.log(err);
            }
        }
}