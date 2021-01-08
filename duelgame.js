const Discord=require('discord.js');
const db=require('./database.js');
class RandDescription{
    constructor(base,wordArray){
        this.base=base;
        this.wordArray=wordArray;
    }
    buildDescription(){
        let description=this.base;
        if(this.wordArray){
        let i=1;
        while(description.indexOf(`&${i}`)!=-1){
            description=description.replace(`&${i}`,pickWord(this.wordArray[i-1]));
            i++;
        }
    }
        return description;
    }
}
class Action{
    constructor(name,description,startMsg,responses){
        this.name=name;
        this.action;
        this.self;
        this.target;
        this.responses=responses;
        this.description=description||'ability ability ability ability ability ability ability ability ability ability';
        this.startMsg=startMsg;
        this.chance=0;
        this.cost=0;
    }
    getResponse(){
        const determinant=Math.random()*100;
        let total=0;
        for(let i=0;i<this.responses.length;i++){
            //console.log(this.responses[i]);
            total+=this.responses[i].chance;
            if(determinant<total){
                return this.responses[i];
            }
        }
    }
}
class Attack extends Action{
    constructor(name,action){
        super(name,action);
    }
}
class Response{
    constructor(name,chance,response){
        this.name=name;
        this.response=response;
        this.chance=chance;
        this.resultMsg;
    }
}
class Player{
    constructor(name,user,opponentName,serverId){
        this.name=name;
        this.user=user;
        this.attack=5;
        this.health=30;
        this.points;
        this.serverId=serverId;
        this.buff=1;
        this.opponentName=opponentName;
        this.surrender=false;
        this.summaryMsgMap=new Discord.Collection();
        const responses1=[new Response('normal',65,(action,response)=>{
            let damage=action.self.attack+Math.ceil((Math.random()-0.5)*4);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`it hits ${action.target.name}, dealing ${damage} damage.`;
        }),new Response('miss',10,(action,response)=>{
            response.resultMsg=`but it missed.`;
        }),new Response('critical strike',20,(action,response)=>{
            let damage=(action.self.attack*2+Math.floor((Math.random()-0.5)*6));
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`the attack struck ${action.target.name} critically, dealing ${damage} damage`;
        }),new Response('block',10,(action,response)=>{
            let damage=Math.ceil(action.self.attack/2)+Math.ceil((Math.random()-0.5)*4);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`but it was blocked by ${action.target.name}, only dealing ${damage} damage`;
        }),new Response('reflect',5,(action,response)=>{
            let damage=action.self.attack+Math.floor((Math.random()-0.5)*4);
            damage=action.self.takeDamage(damage,false);
            response.resultMsg=`but it was reflected by ${action.target.name} dealing ${damage} damage to ${action.self.name}!`
        })];
        const action1=new Action('Normal attack','Normal attack',new RandDescription(`${this.name} strikes ${this.opponentName} with &1, `,[['a sword','a knife','a shovel','a kendo stick','a firesword','an apple','a glass sword','the Ichimonji','a Dirk','a mango sword','the Indomptable']]),responses1);
        const responses2=[new Response('normal',40,(action,response)=>{
            let damage=action.self.attack+Math.ceil((Math.random()-0.5)*9);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`it hits ${action.target.name}, dealing ${damage} damage`;
        }),new Response('critical strike',25,(action,response)=>{
            let damage=action.self.attack*2+Math.ceil((Math.random()-0.5)*19);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`the attack was a critical hit, dealing ${damage} to ${action.target.name}`;
        }),new Response('absorbed',10,(action,response)=>{
            const heal=action.self.attack+Math.floor((Math.random()-0.5)*4);
            action.target.heal(heal);
            response.resultMsg=`but it was absorbed by ${action.target.name}, healing ${action.target.name} for ${heal}`;
        }),new Response('fizzle',15,(action,response)=>{
            response.resultMsg=`but the attack fizzled.`;
        }),new Response('collateral',10,(action,response)=>{
            let targetDamage=action.self.attack*2+Math.floor((Math.random()-0.5)*18);
            let selfDamage=action.self.attack*2+Math.floor((Math.random()-0.5)*18);
            const oldbuff=action.self.buff;
            targetDamage=action.target.takeDamage(targetDamage,true,action.self);
            action.target.buff=oldbuff;
            selfDamage=action.self.takeDamage(selfDamage,true,action.target);
            response.resultMsg=`but the attack goes off before ${action.self.name} could target it, dealing ${selfDamage} damage to ${action.self.name} and ${targetDamage} damage to the ${action.target.name}`;
        })];
        const action2=new Action('Magic attack','Use magic',new RandDescription(`${this.name} winds up a powerful magic attack using &1, `,[['an orb','a spell','nothing','their expertise','a prism','a snow globe','a skull']]),responses2);
        action2.cost=100;
        const responses3=[new Response('buff',40,(action,response)=>{
            action.self.buff*=2;
            response.resultMsg=`the potion turned out to be a strength potion, buffing the damage of ${action.self.name}'s next attack`;
        }),new Response('weakness',10,(action,response)=>{
            action.self.buff/=2;
            response.resultMsg=`the potion turned out to be a weakness potion, lowering the damage of ${action.self.name}'s next attack`;
        }),new Response('heal',30,(action,response)=>{
            const heal=this.attack*2+Math.floor((Math.random()-0.5)*4);
            action.self.heal(heal);
            response.resultMsg=`the potion turned out to be a health potion, healing ${action.self.name} for ${heal} health`;
        }),new Response('damage',10,(action,response)=>{
            let damage=this.attack+Math.floor((Math.random()-0.5)*4);
            damage=action.self.takeDamage(damage,false);
            response.resultMsg=`the potion turned out to be a damaging potion, dealing ${damage} damage to ${action.self.name}`;
        }),new Response('awkward potion (cleanse)',10,(action,response)=>{
            action.self.buff=1;
            response.resultMsg=`the potion turned out to be a cleansing potion, removing all attack buffs and nerfs from ${action.self.name}`;
        })];
        const action3=new Action('Drink random potion','Whats in the potion?',new RandDescription(`${this.name} drinks a mysterious potion, `),responses3);
        const responses4=[new Response('hurt',10,(action,response)=>{
            let damage=action.self.attack*2+Math.floor((Math.random()-0.5)*4);
            damage=action.target.takeDamage(damage,false);
            response.resultMsg=`the taunt hurts ${action.target.name}'s feelings and deals ${damage} damage to the ${action.target.name}`;
        }),new Response('success',55,(action,response)=>{
            action.target.buff=0.25;
            response.resultMsg=`the taunt makes ${action.target.name} feel nervous, lowering the damage of their next attack significantly`;
        }),new Response('fails',20,(action,response)=>{
            response.resultMsg=`but it had no effect`;
        })/*,new Response('taunts back',30,(action,response)=>{
            let damage=Math.floor(Math.random()*2)+1;
            damage=action.self.takeDamage(damage,false);
            response.resultMsg=`and the ${action.target.name} taunts ${action.self.name} back. ${pickWord(['Infuriated','Filled with rage','Angered','Annoyed','Enraged','Furious','Malding','Outraged','Fuming','Irritated','Frustrated'])}, ${action.self.name} hurts himself in confusion, taking ${damage} damage`;
        })*/,new Response('absorbed',15,(action,response)=>{
            action.target.buff*=2;
            response.resultMsg=`${action.target.name} is enraged, buffing his next attack`;
        })];
        const action4=new Action('Taunt',`Taunt ${this.opponentName}`,new RandDescription(`${this.name} taunts ${this.opponentName}, `),responses4);
        const responses5=[new Response('success',70,(action,response)=>{
            const heal=this.attack+Math.floor((Math.random()-0.5)*4);
            action.self.heal(heal);
            response.resultMsg=`and restores ${heal} health`;
        }),new Response('mini heal',15,(action,response)=>{
            const heal=Math.floor((Math.random()*2))+1;
            action.self.heal(heal);
            response.resultMsg=`but only restores ${heal} health`;
        }),new Response('crit heal',15,(action,response)=>{
            const heal=this.attack*2+2+Math.floor((Math.random()-0.5)*4);
            action.self.heal(heal);
            response.resultMsg=`the brew was very effective, restoring ${heal} health`;
        })];
        const action5=new Action('Heal','Heal up',new RandDescription(`${this.name} drinks &1, `,[['a health potion','an elxir of iron','a health II potion','some orange juice','some hot chocolate','some water','some soup']]),responses5);
        action5.cost=100;
        const responses6=[new Response('success',100,(action,response)=>{
            action.self.surrender=true;
            response.resultMsg='';
        })]
        const action6=new Action('Surrender','Admit defeat',new RandDescription(`${this.name} surrendered.`),responses6)
        this.actions=[action1,action2,action3,action4,action5,action6];
    }
    takeDamage(damage,isAttack,self){
        if(isAttack){
        damage=Math.floor(damage*self.buff);
        self.buff=1;
        }
        this.health-=damage;
        if(this.health<0){
            this.health=0;
        }
        return damage;
    }
    heal(heal){
        this.health+=heal;
        if(this.health>30)
        this.health=30;
    }
    useBuff(damage){
        const newDamage=damage*this.buff;
        this.buff=1;
        return newDamage;
    }
    healthBar(){
        let buff=''
        if(this.buff>1){
            buff=' | Attack ⬆️';
        }
        else if(this.buff<1){
            buff=' | Attack ⬇️';
        }
        return `❤️ **${this.health}/30${buff}**`;
    }
    isDefeated(){
        return this.health<=0;
    }
}
class Game{
    constructor(player1,player2,points,channel){
        this.timeStarted=Date.now();
        this.turns=0;
        this.channel= channel;
        this.embed=new Discord.MessageEmbed();
        this.player1=player1;
        this.player2=player2;
        this.points=points;
        this.msg;
        this.summary=new Discord.MessageEmbed();
    }
    async startGame(){
        try{
        const filter=(reaction,user)=>{
            return reaction.emoji.name==='➡️'&&(user.id===this.player1.user.id||user.id===this.player2.user.id);
        }
        this.msg=this.embed.setFooter('React with ➡️ to start');
        this.embed.setTitle('Duel between '+this.player1.name+' and '+this.player2.name);
        this.embed.setColor(0xf84343);
        this.msg= await this.channel.send(this.embed);
        await this.msg.react('➡️');
        this.player1.summaryMsgMap.set('as duels bet',-this.points);
        this.player2.summaryMsgMap.set('as duels bet',-this.points);
        const next= await this.msg.awaitReactions(filter,{max:2,time:600000,errors:['time']});
        this.msg.reactions.removeAll();
        this.embed.setTitle('Duel between '+this.player1.name+' and '+this.player2.name);
        this.embed.setFooter('React with the numbered emotes to choose an action');
        this.summary.setTitle(`Here is a summary of ${this.player1.name}'s duel against ${this.player2.name}`);
            //this.msg= await this.msg.edit(this.embed);
            //console.log('sent');
            //console.log(this.msg);
            await this.player1sTurn();
        }
        catch(err){
            console.log(err);
            
            await updatePoints(`${this.channel.guild.id}&${this.player2.user.id}`,`${this.player2.name}`,`${this.points}`,this.player2.summaryMsgMap,`that were originally yours back`);
            await updatePoints(`${this.channel.guild.id}&${this.player1.user.id}`,`${this.player1.name}`,`${this.points}`,this.player1.summaryMsgMap,`that were originally yours back`);
            let player1Points=0;
            let player2Points=0;
            let res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player1.user.id}`]);
            if(res.rowCount){
                player1Points=res.rows[0].points;
            }
            res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player2.user.id}`]);
            if(res.rowCount){
                player2Points=res.rows[0].points;
            }
            this.summary.setDescription('Duel timed out.');
            this.setSummary(player1Points,player2Points);
            this.msg.edit(this.summary);
            this.msg.client.results.get('duel').delete(`${this.channel.guild.id}&${this.player1.user.id}`);
            return;
        }
    }
    async player1sTurn(action){
        const filter=(reaction,user)=>{
            return reaction.emoji.name==='➡️'&&(user.id===this.player1.user.id||user.id===this.player2.user.id);
        }
        try{
            let returnMsg='';
            let start='';
            let response;
            if(action){
                const player2Action=this.player2.actions[action-1];
                player2Action.target=this.player1;
                player2Action.self=this.player2;
                //console.log(playerAction.startMsg);
                returnMsg+=player2Action.startMsg.buildDescription();
                start=returnMsg;
                response=player2Action.getResponse();
                //console.log(response);
                await response.response(player2Action,response);
                returnMsg+=response.resultMsg;
                returnMsg+='\n';
            }
            else{
                const whoGoesFirst=Math.random()<0.5 ? 1:2;
                if(whoGoesFirst==2){
                    this.player2sTurn();
                    return;
                }
                returnMsg+=`${this.player1.name} gets the jump on ${this.player2.name}\n`;
            }
        this.embed.fields=[];
        this.embed.setAuthor(`${this.player1.name}'s turn`,this.player1.user.displayAvatarURL());
        this.embed.setImage(this.player2.user.displayAvatarURL());
        this.turns++;
        //check if game ended
        let endMsg= await this.isGameOver(1);
        if(endMsg.returnMsg){
            this.embed.addField(`${this.player1.name}: ${this.player1.healthBar()}`,`**${this.player2.name}:** ${this.player2.healthBar()}`);
            returnMsg+=endMsg.returnMsg;
            this.embed.setDescription(returnMsg);
            const summaryDescription=`${endMsg.returnMsg}\n**${endMsg.endingMsg}**\n${start+response.resultMsg}`;
            this.summary.setDescription(summaryDescription);
            this.msg= await this.msg.edit(this.embed);
            const next= await this.msg.awaitReactions(filter,{max:2,time:120000,errors:['time']});
            next.first().users.remove(this.player1.user);
            next.first().users.remove(this.player2.user);
            let player1Points=0;
            let player2Points=0;
            let res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player1.user.id}`]);
            if(res.rowCount){
                player1Points=res.rows[0].points;
            }
            res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player2.user.id}`]);
            if(res.rowCount){
                player2Points=res.rows[0].points;
            }
            this.setSummary(player1Points,player2Points);
            /*const res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player1.user.id}`]);
            if(res.rowCount){
                this.summary.setFooter(`${this.player1.name} now has ${res.rows[0].points} points`,`${this.player1.user.displayAvatarURL()}`);
            }
            else{
                this.summary.setFooter(`${this.player1.name} now has 0 points`,`${this.player1.user.displayAvatarURL()}`);
            }*/
            this.msg.edit(this.summary);
            this.msg.client.results.get('duel').delete(`${this.channel.guild.id}&${this.player1.user.id}`);
            return;
        }
        for(let i=0,j=0;j<this.player1.actions.length;i++){
            /*if(i%3===2){
                this.embed.addField('\u200b','\u200b',false);
            }
            else*/{
            this.embed.addField(`${j+1}\ufe0f\u20e3 ${this.player1.actions[j].name}`,this.player1.actions[j].description,true);
            j++;
            }
            //console.log(this.embed);
        }
        this.embed.setDescription((returnMsg+'**Choose an action**'));
        this.embed.addField(`${this.player1.name}: ${this.player1.healthBar()}`,`**${this.player2.name}:** ${this.player2.healthBar()}`);
        this.msg= await this.msg.edit(this.embed);
        //console.log(this.embed);
        //await this.msg.reactions.removeAll();
        }
        catch(err){
            console.log(err);
            return;
        }
        //this.msg.reactions.removeAll();
        this.awaitPlayer1Action();
        if(this.turns===1){
        try{
            //console.log('ran');
            for(let i=0;i<this.player1.actions.length;i++){
                await this.msg.react(`${i+1}\ufe0f\u20e3`);
                /*if(actionChosen){
                    break;
                }*/
            }
            await this.msg.react('➡️');
        }
        catch(err){
            console.log(err);
            return;
        }
    }
    }
    async player2sTurn(action){
        const filter=(reaction,user)=>{
            return reaction.emoji.name==='➡️'&&(user.id===this.player1.user.id||user.id===this.player2.user.id);
        }
        this.embed.setAuthor(`${this.player2.name}'s turn`,this.player2.user.displayAvatarURL());
        this.embed.setImage(this.player1.user.displayAvatarURL());
        this.embed.setFooter('React with the numbered emotes to choose an action');
        this.embed.fields=[];
        //reaction to player1s turn
        try{
            let returnMsg='';
            let start='';
            let response;
            if(action){
        const player1Action=this.player1.actions[action-1];
        player1Action.target=this.player2;
        player1Action.self=this.player1;
        //console.log(playerAction.startMsg);
        returnMsg=player1Action.startMsg.buildDescription();
        start=returnMsg;
        response=player1Action.getResponse();
        //console.log(response);
        await response.response(player1Action,response);
        returnMsg+=response.resultMsg;
        returnMsg+='\n';
            }
            else{
                returnMsg+=`${this.player2.name} gets the jump on ${this.player1.name}\n`;
            }
            this.turns++;
        for(let i=0,j=0;j<this.player2.actions.length;i++){
            /*if(i%3===2){
                this.embed.addField('\u200b','\u200b',false);
            }
            else*/{
            this.embed.addField(`${j+1}\ufe0f\u20e3 ${this.player2.actions[j].name}`,this.player2.actions[j].description,true);
            j++;
            }
            //console.log(this.embed);
        }
        //check if game ended
        let endMsg= await this.isGameOver(2);
        if(endMsg.returnMsg){
            returnMsg+=endMsg.returnMsg;
            this.embed.setDescription(returnMsg);
            this.embed.addField(`${this.player1.name}: ${this.player1.healthBar()}`,`**${this.player2.name}:** ${this.player2.healthBar()}`);
            const summaryDescription=`${endMsg.returnMsg}\n**${endMsg.endingMsg}**\n${start+response.resultMsg}`;
            this.summary.setDescription(summaryDescription);
            this.msg= await this.msg.edit(this.embed);
            const next= await this.msg.awaitReactions(filter,{max:2,time:120000,errors:['time']});
            next.first().users.remove(this.player1.user);
            next.first().users.remove(this.player2.user);
            let player1Points=0;
            let player2Points=0;
            let res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player1.user.id}`]);
            if(res.rowCount){
                player1Points=res.rows[0].points;
            }
            res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player2.user.id}`]);
            if(res.rowCount){
                player2Points=res.rows[0].points;
            }
            this.setSummary(player1Points,player2Points);
            this.msg.edit(this.summary);
            this.msg.client.results.get('duel').delete(`${this.channel.guild.id}&${this.player1.user.id}`);
            return;
        }
        this.embed.setDescription(returnMsg+'**Choose an action**');
        this.embed.addField(`${this.player1.name}: ${this.player1.healthBar()}`,`**${this.player2.name}:** ${this.player2.healthBar()}`);
        this.msg= await this.msg.edit(this.embed);
            
        }
        catch(err){
            console.log(err);
            this.msg.client.results.get('duel').delete(`${this.channel.guild.id}&${this.player1.user.id}`);
            return;
        }
        //await reaction for next turn
        this.awaitPlayer2Action();
        if(this.turns===1){
            try{
                //console.log('ran');
                for(let i=0;i<this.player1.actions.length;i++){
                    await this.msg.react(`${i+1}\ufe0f\u20e3`);
                    /*if(actionChosen){
                        break;
                    }*/
                }
                //await this.msg.react('➡️');
                await this.msg.react('➡️');
            }
            catch(err){
                console.log(err);
                return;
            }
        }
    }
    awaitPlayer1Action(){
        const filter= (reaction,user)=>{
            if(user.id!==this.player1.user.id){
                return false;
            }
            else{
                for(let i=0;i<this.player1.actions.length;i++){
                    if(reaction.emoji.name===`${i+1}\ufe0f\u20e3`){
                        return true;
                    }
                }
                return false;
            }
        }
        this.msg.awaitReactions(filter,{max:1, time:120000,errors:['time']}).then(async (actionEmote)=>{
            let action;
            actionEmote.forEach((element)=>{
                const emote=element._emoji.name;
                action=emote.substring(0,emote.indexOf('\ufe0f'));
            });
            
            actionEmote.first().users.remove(this.player1.user);
            this.player2sTurn(action);
        }).catch(async (err)=>{
            this.msg.client.results.get('duel').delete(`${this.channel.guild.id}&${this.player1.user.id}`);
            this.summary.setAuthor(`${this.player2.name} has won the duel!`,this.player2.user.displayAvatarURL());
            this.summary.setDescription(`${this.player1.name} went Afk`);
            await updatePoints(`${this.channel.guild.id}&${this.player2.user.id}`,`${this.player2.name}`,`${this.points}`,this.player2.summaryMsgMap,`that were originally yours back`);
            await updatePoints(`${this.channel.guild.id}&${this.player2.user.id}`,`${this.player2.name}`,`${this.points}`,this.player2.summaryMsgMap,`from winning the duel`);
            //await updatePoints(`${this.channel.guild.id}&${this.player2.user.id}`,`${this.player2.name}`,`${this.points}`,this.player2.summaryMsgMap,`as duels bonus`);
            let player1Points=0;
            let player2Points=0;
            let res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player1.user.id}`]);
            if(res.rowCount){
                player1Points=res.rows[0].points;
            }
            res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player2.user.id}`]);
            if(res.rowCount){
                player2Points=res.rows[0].points;
            }
            this.setSummary(player1Points,player2Points);
            this.msg.edit(this.summary);
            return;
        });
    }
    awaitPlayer2Action(){
        const filter= (reaction,user)=>{
            if(user.id!==this.player2.user.id){
                return false;
            }
            else{
                for(let i=0;i<this.player2.actions.length;i++){
                    if(reaction.emoji.name===`${i+1}\ufe0f\u20e3`){
                        return true;
                    }
                }
                return false;
            }
        }
        this.msg.awaitReactions(filter,{max:1, time:120000,errors:['time']}).then(async (actionEmote)=>{
            let action;
            actionEmote.forEach((element)=>{
                const emote=element._emoji.name;
                action=emote.substring(0,emote.indexOf('\ufe0f'));
            });
            
            actionEmote.first().users.remove(this.player2.user);
            this.player1sTurn(action);
        }).catch(async (err)=>{
            this.msg.client.results.get('duel').delete(`${this.channel.guild.id}&${this.player1.user.id}`);
            this.summary.setAuthor(`${this.player1.name} has won the duel!`,this.player1.user.displayAvatarURL());
            this.summary.setDescription(`${this.player2.name} went Afk`);
            await updatePoints(`${this.channel.guild.id}&${this.player1.user.id}`,`${this.player1.name}`,`${this.points}`,this.player1.summaryMsgMap,`that were originally yours back`);
            await updatePoints(`${this.channel.guild.id}&${this.player1.user.id}`,`${this.player1.name}`,`${this.points}`,this.player1.summaryMsgMap,`from winning the duel`);
            //await updatePoints(`${this.channel.guild.id}&${this.player1.user.id}`,`${this.player1.name}`,`${this.points}`,this.player1.summaryMsgMap,`as duels bonus`);
            let player1Points=0;
            let player2Points=0;
            let res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player1.user.id}`]);
            if(res.rowCount){
                player1Points=res.rows[0].points;
            }
            res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player2.user.id}`]);
            if(res.rowCount){
                player2Points=res.rows[0].points;
            }
            this.setSummary(player1Points,player2Points);
            this.msg.edit(this.summary);
            return;
        });
    }
    
    async isGameOver(turn){
        let returnData={returnMsg:'',endingMsg:''};
        let winner;
        if(this.player1.isDefeated()&&this.player1.isDefeated()){
            this.summary.setAuthor(`No body wins.`);
            returnData.returnMsg+=`${this.player1.name} and ${this.player2.name} defeated each other`;
            returnData.endingMsg+='Final Blow';
            await updatePoints(`${this.channel.guild.id}&${this.player2.user.id}`,`${this.player2.name}`,`${this.points}`,this.player2.summaryMsgMap,`that were originally yours back`);
            await updatePoints(`${this.channel.guild.id}&${this.player1.user.id}`,`${this.player1.name}`,`${this.points}`,this.player1.summaryMsgMap,`that were originally yours back`);
        }
        else if(this.player1.isDefeated()){
            this.summary.setAuthor(`${this.player2.name} has won the duel!`,`${this.player2.user.displayAvatarURL()}`);
            returnData.returnMsg+=`${this.player1.name} was defeated by ${this.player2.name}`;
            returnData.endingMsg+='Final Blow';
            await updatePoints(`${this.channel.guild.id}&${this.player2.user.id}`,`${this.player2.name}`,`${this.points}`,this.player2.summaryMsgMap,`that were originally yours back`);
            await updatePoints(`${this.channel.guild.id}&${this.player2.user.id}`,`${this.player2.name}`,`${this.points}`,this.player2.summaryMsgMap,`from winning the duel`);
            //await updatePoints(`${this.channel.guild.id}&${this.player2.user.id}`,`${this.player2.name}`,`${this.points}`,this.player2.summaryMsgMap,`as duels bonus`);
            winner=2;
        }
        else if(this.player2.isDefeated()){
            returnData.returnMsg+=`${this.player2.name} was defeated by ${this.player1.name}`;
            this.summary.setAuthor(`${this.player1.name} has won the duel!`,`${this.player1.user.displayAvatarURL()}`);
            returnData.endingMsg+='Final Blow';
            await updatePoints(`${this.channel.guild.id}&${this.player1.user.id}`,`${this.player1.name}`,`${this.points}`,this.player1.summaryMsgMap,`that were originally yours back`);
            await updatePoints(`${this.channel.guild.id}&${this.player1.user.id}`,`${this.player1.name}`,`${this.points}`,this.player1.summaryMsgMap,`from winning the duel`);
            //await updatePoints(`${this.channel.guild.id}&${this.player1.user.id}`,`${this.player1.name}`,`${this.points}`,this.player1.summaryMsgMap,`as duels bonus`);
            winner=1;
        }
        else if(this.player1.surrender){
            this.summary.setAuthor(`${this.player2.name} has won the duel!`,`${this.player2.user.displayAvatarURL()}`);
            returnData.returnMsg+=`${this.player1.name} could not stand against the might of ${this.player2.name}`;
            returnData.endingMsg+='Final Action';
            await updatePoints(`${this.channel.guild.id}&${this.player2.user.id}`,`${this.player2.name}`,`${this.points}`,this.player2.summaryMsgMap,`that were originally yours back`);
            await updatePoints(`${this.channel.guild.id}&${this.player2.user.id}`,`${this.player2.name}`,`${this.points}`,this.player2.summaryMsgMap,`from winning the duel`);
            //await updatePoints(`${this.channel.guild.id}&${this.player2.user.id}`,`${this.player2.name}`,`${this.points}`,this.player2.summaryMsgMap,`as duels bonus`);
            winner=2;
        }
        else if(this.player2.surrender){
            this.summary.setAuthor(`${this.player1.name} has won the duel!`,`${this.player1.user.displayAvatarURL()}`);
            returnData.returnMsg+=`${this.player2.name} could not stand against the might of ${this.player1.name}`;
            returnData.endingMsg+='Final Action';
            await updatePoints(`${this.channel.guild.id}&${this.player1.user.id}`,`${this.player1.name}`,`${this.points}`,this.player1.summaryMsgMap,`that were originally yours back`);
            await updatePoints(`${this.channel.guild.id}&${this.player1.user.id}`,`${this.player1.name}`,`${this.points}`,this.player1.summaryMsgMap,`from winning the duel`);
            //await updatePoints(`${this.channel.guild.id}&${this.player1.user.id}`,`${this.player1.name}`,`${this.points}`,this.player1.summaryMsgMap,`as duels bonus`);
            winner=1;
        }
        if(returnData.returnMsg){
            this.embed.setFooter('React with the arrow emote to see the duel summary');
            if(turn==1){
                if(winner==1){
                    this.embed.setImage('https://static.drips.pw/rotmg/wiki/Environment/Gravestone%2011.png');
                }
                else{
                    this.embed.author.iconURL='https://static.drips.pw/rotmg/wiki/Environment/Gravestone%2011.png';
                }
            }
            else{
                if(winner==2){
                    this.embed.setImage('https://static.drips.pw/rotmg/wiki/Environment/Gravestone%2011.png');
                }
                else{
                    this.embed.author.iconURL='https://static.drips.pw/rotmg/wiki/Environment/Gravestone%2011.png';
                }
            }
            //this.setSummary();
        }
        return returnData;
    }
    outOfTime(){
        
    }
    setSummary(player1Points,player2Points){
        let summaryMsg1='**Source**\n';
        let pointsMsg1='**Points**\n';
        let total1=0;
        this.player1.summaryMsgMap.forEach((value,key)=>{
            if(value>0){
                summaryMsg1+=`Gained points ${key}\n`;
                pointsMsg1+=`+${value}\n`;
                total1+=value;
            }
            else if(value<0){
                summaryMsg1+=`Lost points ${key}\n`;
                pointsMsg1+=value+'\n';
                total1+=value;
            }
        });
        if(total1>0){
            pointsMsg1+=`**+${total1}**`;
        }
        else{
            pointsMsg1+=`**${total1}**`;
        }
        summaryMsg1+='**Total**';
        let total2=0;
        let summaryMsg2='**Source**\n';
        let pointsMsg2='**Points**\n';
        this.player2.summaryMsgMap.forEach((value,key)=>{
            if(value>0){
                summaryMsg2+=`Gained points ${key}\n`;
                pointsMsg2+=`+${value}\n`;
                total2+=value;
            }
            else if(value<0){
                summaryMsg2+=`Lost points ${key}\n`;
                pointsMsg2+=value+'\n';
                total2+=value;
            }
        });
        if(total2>0){
            pointsMsg2+=`**+${total2}**`;
        }
        else{
            pointsMsg2+=`**${total2}**`;
        }
        summaryMsg2+='**Total**';
        summaryMsg2+=`\n**${this.player2.name} now has ${player2Points} points**`;
        this.summary.addField(`**${this.player1.name}**`,summaryMsg1,true);
        this.summary.addField('\u200b',pointsMsg1,true);
        this.summary.addField(`${this.player1.name} now has ${player1Points} points`,'\u200b',false);
        this.summary.addField('**'+this.player2.name+'**',summaryMsg2,true);
        this.summary.addField('\u200b',pointsMsg2,true);
    }
}
async function updatePoints(id,name,points,summary,source){
    try{
    const res= await db.query('SELECT * FROM points WHERE id=$1',[id]);
    let currentPoints;
    if(res.rowCount<=0){
        await db.query('INSERT INTO points VALUES($1,$2,0)',[id,name]);
        currentPoints=0;
    }
    else{
        currentPoints=res.rows[0].points;
    }
    //console.log(currentPoints);
    if(currentPoints+parseInt(points)<0){
        points=`${(-currentPoints)}`;
    }
    await db.query('UPDATE points SET points=points+$1 WHERE id=$2',[points,id]);
    if(points!=0){
    if(summary.has(source)){
        summary.set(source,summary.get(source)+parseInt(points));
    }
    else{
        summary.set(source,parseInt(points));
    }
}
    return points;
}
catch(err){
    console.log(err);
}
}
function pickWord(wordArray){
    const index=Math.floor(Math.random()*wordArray.length);
    return wordArray[index];

}
module.exports={RandDescription,Player,Action,Game,Response};
const cmd={
    name:'challenge',
    description:'challenges another player to a vs duel',
    usage:'challenge',
    category:'',
    status:false,
    argsRequired:[1,2],
    async code(msg,args){
        const serverId=msg.guild.id;
        const user=msg.author;
        const userId=msg.author.id;
        const guildName=msg.member.displayName;
        const channel=msg.channel;
        const mention=msg.mentions.users.first();
        const mentionId=mention.id;
        const mentionMember= await msg.guild.members.fetch(mentionId);
        const mentionName=mentionMember.displayName;
        const cost=0;
        const db=require('./database.js');
        let currentPoints;
        try{
        const res= await db.query('SELECT * FROM points WHERE id=$1',[`${serverId}&${userId}`]);
        if(res.rowCount<=0||res.rows[0].points<cost){
            msg.channel.send('You do not have enough points to fight the Grinch');
            return;
        }
        currentPoints=res.rows[0].points;
        }
        catch(err){
            console.log(err);
            return;
        }
        if(!msg.client.results.get(this.name))
            {
                msg.client.results.set(this.name,new Discord.Collection());
            }
        const timestamps=msg.client.results.get(this.name);
        if(timestamps.has(`${serverId}&${userId}`)){
            msg.channel.send('You are currently fighting the Grinch');
            return;
        }
        timestamps.set(`${serverId}&${userId}`,'playing');
        //console.log(timestamps);

    }
}