const Discord=require('discord.js');
const db=require('./database.js');
class Grinch{
    constructor(player){
        this.name='Grinch';
        this.health= 50;
        this.attack= 7;
        this.pointsDrops=[100,500];
        this.buff=1;
        this.damageDrops=800;
        this.defeatDrops=2000;
        this.player=player;
        this.ranAway=false;
        const responses1=[new Response('normal',60,(action,response)=>{
            let damage=action.self.attack+Math.floor((Math.random()-0.5)*5);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`and deals ${damage} damage to ${action.target.name}`;
        }),new Response('critical strike',10,(action,response)=>{
            let damage=action.self.attack*2+Math.floor((Math.random()-0.5)*5);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`the attack ${pickWord(['critically strikes'])}, dealing ${damage} damage to ${action.target.name}`;
        }),new Response('miss',30,(action,response)=>{
            response.resultMsg=`but it missed!`
        })];
        const action1=new Action('Normal attack','normal attack',new RandDescription(`The grinch hits ${this.player.name} with &1, `,[['his hat','his bag','nothing']]),responses1);
        action1.chance=30;
        const responses2=[new Response('normal',30,(action,response)=>{
            let damage=action.self.attack+3+Math.floor((Math.random()-0.5)*6);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`and deals ${damage} damage to ${action.target.name}`;
        }),new Response('critical strike',10,(action,response)=>{
            let damage=action.self.attack+5+Math.floor((Math.random()-0.5)*12);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`the attack was super effective, dealing ${damage} damage to ${action.target.name}`;
        }),new Response('heal',10,(action,response)=>{
            const heal=this.attack+Math.floor((Math.random()-0.5)*4);
            action.target.heal(heal);
            response.resultMsg=`but accidentally uses the wrong spell, healing ${action.target.name} for ${heal} health instead`;
        }),new Response('miss',30,(action,response)=>{
            response.resultMsg=`but it missed!`;
        }),new Response('lifesteal',20,(action,response)=>{
            let damage=action.self.attack+Math.floor((Math.random()-0.5)*4);
            damage=action.target.takeDamage(damage,true,action.self);
            const heal=Math.floor(damage/2);
            action.self.heal(heal);
            response.resultMsg=`the attack was a lifesteal attack, dealing ${damage} damage to ${action.target.name}, and healing the ${action.self.name} for ${heal} health`
        })];
        const action2=new Action('Magic attack','special attack',new RandDescription(`The ${this.name} takes aim at ${this.player.name} with a wizardly attack, `),responses2);
        action2.chance=40;
        const responses3=[new Response('hits',25,(action,response)=>{
            let damage=30;
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`and deals ${damage} damage to ${action.target.name}`;
        }),new Response('miss',25,(action,response)=>{
            response.resultMsg=`but it missed!`
        }),new Response('fizzle',25,(action,response)=>{
            response.resultMsg=`but it fizzled.`;
        }),new Response('partial miss',25,(action,response)=>{
            let damage=1+(Math.floor(Math.random()*2));
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`but it only deals ${damage} damage to ${action.target.name}`;
        })];
        const action3=new Action('Charged attack','ultimate attack',new RandDescription(`The ${this.name} charges up his &1 attack, `,[['ultimate','ultra','most powerful']]),responses3);
        action3.chance=10;
        const responses4=[new Response('success',70,(action,response)=>{
            action.self.ranAway=true;
            response.resultMsg=`and succeeds.`;
        }),new Response('fails',30,(action,response)=>{
            response.resultMsg=`but trips on ${pickWord(['a banana peel','his bag','a rock','a snowball','a snow castle','an ice sculpture'])}`;
        })];
        const action4=new Action('Run away','run away',new RandDescription(`The ${this.name} tries to run away, `),responses4);
        action4.chance=0;
        const action5Word=pickWord(['cookies','cookies','chocolates','bananas','popsicles','icicles','oranges']);
        const responses5=[new Response('success',60,(action,response)=>{
            const heal=action.self.attack+Math.floor((Math.random()-0.5)*4);
            action.self.heal(heal);
            response.resultMsg=`and restores ${heal} health`;
        }),new Response('critical heal',10,(action,response)=>{
            const heal=action.self.attack*2+Math.floor((Math.random()-0.5)*4);
            action.self.heal(heal);
            response.resultMsg=`the ${action5Word} tasted exceptionally good, and restores ${heal} health`;
        }),new Response('fails',30,(action,response)=>{
            const damage=1;
            action.self.takeDamage(damage,false);
            response.resultMsg=`but they were expired, dealing ${damage} damage to the Grinch`;
        })];
        const action5=new Action('Heal','heal',new RandDescription(`The ${this.name} eats some ${action5Word}, `),responses5);
        action5.chance=0;
        const responses6=[new Response('success',50, async (action,response)=>{
            let points=-(Math.floor((Math.random()*(action.self.pointsDrops[1]-action.self.pointsDrops[0])+action.self.pointsDrops[0])/2));
            points= await updatePoints(`${action.target.serverId}&${action.target.user.id}`,`${action.target.name}`,`${points}`,action.target.summaryMsgMap,'that were stolen by the Grinch');
            if(points==0){
                response.resultMsg=`and then reappears behind ${action.target.name}, trying steal points from ${action.target.name}. Unfortunately, it turns out ${action.target.name} was too poor to steal from`;
            }
            else{
            response.resultMsg=`and then reappears behind ${action.target.name}, stealing ${-points} points from ${action.target.name}`;
            }
        }),new Response('fails',50,(action,response)=>{
            action.self.buff*=2;
            response.resultMsg=`and reappears with ${pickWord(['a potion of strength','a potion of strength II','a potion of attack','an elxir of wrath',`a bottle of ${action.target.name}'s tears`])}. The ${action.self.name} drinks the brew, buffing his next attack`;
        })];
        const action6=new Action('Steal points','steal',new RandDescription(`The ${this.name} disappears for a second, `),responses6);
        action6.chance=20;
        this.actions=[action1,action2,action3,action4,action5,action6];
    }
    takeDamage(damage,isAttack,self){
        if(isAttack){
            damage=damage*self.buff;
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
        if(this.health>50)
        this.health=50;
    }
    useBuff(damage){
        const newDamage=damage*this.buff;
        this.buff=1;
        return newDamage;
    }
    healthBar(){
        return `❤️ ${this.health}/50`;
    }
    isDefeated(){
        return this.health<=0;
    }
    dropPoints(damage){
        let points=(damage/50)*this.damageDrops;
        points+=Math.floor(Math.random()*points*0.1);
        points=Math.floor(points);
        return points;
    }
    getAction(turns){
        const determinant=Math.random()*100;
        if(determinant<(turns)){
            return this.actions[3];
        }
        if(this.health<40){
            if(determinant<10){
                return this.actions[4];
            }
        }
        else if(this.health<10){
            if(determinant<20){
                return this.actions[4];
            }
        }
        let total=0;
        for(let i=0;i<this.actions.length;i++){
            total+=this.actions[i].chance;
            if(determinant<total){
                return this.actions[i];
            }
        }
        return 'error';
    }
}
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
            console.log(this.responses[i]);
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
    constructor(name,user,serverId){
        this.name=name;
        this.user=user;
        this.attack=5;
        this.health=30;
        this.points;
        this.serverId=serverId;
        this.buff=1;
        this.surrender=false;
        this.summaryMsgMap=new Discord.Collection();
        const responses1=[new Response('normal',75,(action,response)=>{
            let damage=action.self.attack+Math.floor((Math.random()-0.5)*4);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`it hits the ${action.target.name}, dealing ${damage} damage.`;
        }),new Response('miss',10,(action,response)=>{
            response.resultMsg=`but it missed.`;
        }),new Response('critical strike',10,(action,response)=>{
            let damage=(action.self.attack*2+Math.floor((Math.random()-0.5)*8));
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`the attack struck the ${action.target.name} critically, dealing ${damage} damage`;
        }),new Response('block',10,(action,response)=>{
            let damage=Math.ceil(action.self.attack/2)+Math.floor((Math.random()-0.5)*4);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`but it was blocked by the ${action.target.name}, only dealing ${damage} damage`;
        }),new Response('reflect',5,(action,response)=>{
            let damage=action.self.attack+Math.floor((Math.random()-0.5)*4);
            damage=action.self.takeDamage(damage,false);
            response.resultMsg=`but it was reflected by the Grinch, dealing ${damage} damage to ${action.self.name}!`
        })];
        const action1=new Action('Normal attack','Normal attack',new RandDescription(`${this.name} strikes the Grinch with &1, `,[['a sword','a knife','a shovel','a kendo stick','a firesword','an apple','a glass sword','the Ichimonji','a Dirk','a mango sword','the Indomptable']]),responses1);
        const responses2=[new Response('normal',50,(action,response)=>{
            let damage=action.self.attack*2+Math.floor((Math.random()-0.5)*6);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`it hits the ${action.target.name}, dealing ${damage} damage`;
        }),new Response('critical strike',10,(action,response)=>{
            let damage=action.self.attack*4+Math.floor((Math.random()-0.5)*12);
            damage=action.target.takeDamage(damage,true,action.self);
            response.resultMsg=`the attack was a critical hit, dealing ${damage} to the ${action.target.name}`;
        }),new Response('absorbed',10,(action,response)=>{
            const heal=action.self.attack+Math.floor((Math.random()-0.5)*8);
            action.target.heal(heal);
            response.resultMsg=`but it was absorbed by the ${action.target.name}, healing the ${action.target.name} for ${heal}`;
        }),new Response('fizzle',15,(action,response)=>{
            response.resultMsg=`but the attack fizzled.`;
        }),new Response('collateral',15,(action,response)=>{
            let targetDamage=action.self.attack*3+Math.floor((Math.random()-0.5)*20);
            let selfDamage=action.self.attack*2+Math.floor((Math.random()-0.5)*15);
            const oldbuff=action.self.buff;
            targetDamage=action.target.takeDamage(targetDamage,true,action.self);
            action.target.buff=oldbuff;
            selfDamage=action.self.takeDamage(selfDamage,true,action.target);
            response.resultMsg=`but the attack goes off before ${action.self.name} could target it, dealing ${selfDamage} damage to ${action.self.name} and ${targetDamage} damage to the ${action.target.name}`;
        })];
        const action2=new Action('Magic attack (costs 100 points)','Use magic',new RandDescription(`${this.name} winds up a powerful magic attack using &1, `,[['an orb','a spell','nothing','their expertise','a prism','a snow globe','a skull']]),responses2);
        action2.cost=100;
        const responses3=[new Response('sucess',33, async (action,response)=>{
            let points=Math.floor(Math.random()*(action.target.pointsDrops[1]-action.target.pointsDrops[0]))+action.target.pointsDrops[0];
            points= await updatePoints(`${action.self.serverId}&${action.self.user.id}`,`${action.self.name}`,`${points}`,action.self.summaryMsgMap,'that were given by the Grinch');
            response.resultMsg=`the ${action.target.name} takes pity on ${action.self.name} and gives them ${points} points`;
        }),new Response('nothing',33,(action,response)=>{
            response.resultMsg=`but is ignored by the ${action.target.name}`;
        }),new Response('steal',33, async (action,response)=>{
            let points=-(Math.floor((Math.random()*(action.target.pointsDrops[1]-action.target.pointsDrops[0])+action.target.pointsDrops[0])/2));
            points= await updatePoints(`${action.self.serverId}&${action.self.user.id}`,`${action.self.name}`,`${points}`,action.self.summaryMsgMap,'that were stolen by the Grinch');
            if(points==0){
                response.resultMsg=`the ${action.target.name} does not give any points, and instead tries to steal points from ${action.self.name}. However, ${action.self.name} had no points to steal from.`;
            }
            else{
            response.resultMsg=`the ${action.target.name} does not give any points, and instead steals ${-points} points from ${action.self.name}`;
            }
        }),new Response('lucky',1, async (action,response)=>{
            let points=10000;
            points= await updatePoints(`${action.self.serverId}&${action.self.user.id}`,`${action.self.name}`,`${points}`,action.self.summaryMsgMap,'that were given by the Grinch');
            response.resultMsg=`the ${action.target.name} is in a good mood and gives ${action.self.name} ${points} points`;
        })];
        const action3=new Action('Ask for points','Ask the Grinch for points',new RandDescription(`${this.name} asks the Grinch for points, `),responses3);
        const responses4=[new Response('hurt',15,(action,response)=>{
            let damage=action.self.attack*3+Math.floor((Math.random()-0.5)*4);
            damage=action.target.takeDamage(damage,false);
            response.resultMsg=`the taunt hit the ${action.target.name} in the weak spot, hurting the ${action.target.name}'s feelings and dealing ${damage} damage to the ${action.target.name}`;
        }),new Response('success',30,(action,response)=>{
            action.target.buff=0.25;
            response.resultMsg=`the taunt makes the ${action.target.name} feel nervous, lowering the damage of his next attack significantly`;
        }),new Response('fails',5,(action,response)=>{
            response.resultMsg=`but it had no effect`;
        }),new Response('taunts back',30,(action,response)=>{
            let damage=Math.floor(Math.random()*2)+1;
            damage=action.self.takeDamage(damage,false);
            response.resultMsg=`and the ${action.target.name} taunts ${action.self.name} back. ${pickWord(['Infuriated','Filled with rage','Angered','Annoyed','Enraged','Furious','Malding','Outraged','Fuming','Irritated','Frustrated'])}, ${action.self.name} hurts himself in confusion, taking ${damage} damage`;
        }),new Response('absorbed',20,(action,response)=>{
            action.target.buff*=2;
            response.resultMsg=`the ${action.target.name} is enraged, buffing his next attack`;
        })];
        const action4=new Action('Taunt','Taunt the Grinch',new RandDescription(`${this.name} taunts the Grinch, `),responses4);
        const responses5=[new Response('success',80,(action,response)=>{
            const heal=this.attack*2+Math.floor((Math.random()-0.5)*4);
            action.self.heal(heal);
            response.resultMsg=` and restores ${heal} health`;
        }),new Response('mini heal',20,(action,response)=>{
            const heal=1;
            action.self.heal(heal);
            response.resultMsg=` but only restores ${heal} health`;
        })];
        const action5=new Action('Heal (costs 100 points)','Heal up',new RandDescription(`${this.name} drinks &1, `,[['a health potion','an elxir of iron','a health II potion','some orange juice','some hot chocolate','some water','some soup']]),responses5);
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
        return `❤️ ${this.health}/30`
    }
    isDefeated(){
        return this.health<=0;
    }
}
class Game{
    constructor(player,grinch,channel){
        this.timeStarted=Date.now();
        this.turns=0;
        this.channel= channel;
        this.embed=new Discord.MessageEmbed();
        this.player=player;
        this.grinch=grinch;
        this.msg;
        this.summary=new Discord.MessageEmbed();
    }
    async startGame(){
        try{
        const filter=(reaction,user)=>{
            return user.id===this.player.user.id&&reaction.emoji.name==='➡️';
        }
        this.msg=this.embed.setFooter('React with ➡️ to start');
        this.embed.setImage('https://i.imgur.com/nWFIJCF.gif');
        this.embed.setTitle('A wild Grinch appears!');
        this.msg= await this.channel.send(this.embed);
        await this.msg.react('➡️');
        const next= await this.msg.awaitReactions(filter,{max:1,time:600000,errors:['time']});
        this.msg.reactions.removeAll();
        this.embed.setTitle('A wild Grinch appears! Fight the grinch');
        this.embed.setThumbnail((this.player.user.displayAvatarURL()));
        this.summary.setTitle(`Here is a summary of ${this.player.name}'s battle with the ${this.grinch.name}`);
        this.summary.setThumbnail((this.player.user.displayAvatarURL()));
            //this.msg= await this.msg.edit(this.embed);
            //console.log('sent');
            //console.log(this.msg);
            await this.playersTurn();
        }
        catch(err){
            console.log(err);
            this.msg.client.cooldowns.get('grinch').delete(`${this.channel.guild.id}&${this.player.user.id}`);
            return;
        }
    }
    async playersTurn(){
        try{
        this.embed.fields=[];
        this.embed.setDescription('Choose an action');
        this.embed.setFooter('React with the numbered emotes to choose an action');
        this.embed.setAuthor(`${this.player.name}'s turn`,this.player.user.displayAvatarURL());
        this.turns++;
        for(let i=0,j=0;j<this.player.actions.length;i++){
            /*if(i%3===2){
                this.embed.addField('\u200b','\u200b',false);
            }
            else*/{
            this.embed.addField(`${j+1}\ufe0f\u20e3 ${this.player.actions[j].name}`,this.player.actions[j].description,true);
            j++;
            }
            //console.log(this.embed);
        }
        this.embed.addField(`${this.player.name}: ${this.player.healthBar()}`,`${this.grinch.name}: ${this.grinch.healthBar()}`,true);
            this.msg= await this.msg.edit(this.embed);
            
        }
        catch(err){
            console.log(err);
            return;
        }
        //this.msg.reactions.removeAll();
        this.awaitPlayerAction();
        if(this.turns===1){
        try{
            //console.log('ran');
            for(let i=0;i<this.player.actions.length;i++){
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
    async grinchsTurn(action){
        const filter=(reaction,user)=>{
            return user.id===this.player.user.id&&reaction.emoji.name==='➡️';
        }
        this.embed.setAuthor(`Not ${this.player.name}'s turn`,this.player.user.displayAvatarURL());
        this.embed.setFooter('React with the arrow emote to move to the next turn');
        this.embed.fields=[];
        //reaction to players turn
        let startingHealth=this.grinch.health;
        try{
        const playerAction=this.player.actions[action-1];
        playerAction.target=this.grinch;
        playerAction.self=this.player;
        //console.log(playerAction.startMsg);
        let returnMsg=playerAction.startMsg.buildDescription();
        let start=returnMsg;
        let response=playerAction.getResponse();
        //console.log(response);
        await response.response(playerAction,response);
        returnMsg+=response.resultMsg;
        returnMsg+='\n';
        returnMsg+=await this.calculateDrops(startingHealth);
        //check if game ended
        let endMsg= await this.isGameOver();
        if(endMsg.returnMsg){
            this.embed.addField(`${this.player.name}: ${this.player.healthBar()}`,`${this.grinch.name}: ${this.grinch.healthBar()}`);
            returnMsg+=endMsg.returnMsg;
            this.embed.setDescription(returnMsg);
            const summaryDescription=`${endMsg.returnMsg}\n**${endMsg.endingMsg}**\n${start+response.resultMsg}`;
            this.summary.setDescription(summaryDescription);
            this.msg= await this.msg.edit(this.embed);
            const next= await this.msg.awaitReactions(filter,{max:1,time:600000,errors:['time']});
            next.first().users.remove(this.player.user);
            this.setSummary();
            const res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player.user.id}`]);
            if(res.rowCount){
                this.summary.setFooter(`${this.player.name} now has ${res.rows[0].points} points`,`${this.player.user.displayAvatarURL()}`);
            }
            else{
                this.summary.setFooter(`${this.player.name} now has 0 points`,`${this.player.user.displayAvatarURL()}`);
            }
            this.msg.edit(this.summary);
            this.msg.client.cooldowns.get('grinch').delete(`${this.channel.guild.id}&${this.player.user.id}`);
            return;
        }
        this.embed.setDescription(returnMsg);
        //grinchs turn
            returnMsg='';
            const turnMsg=`**The ${this.grinch.name}'s turn**\n`;
        startingHealth=this.grinch.health;
        const grinchAction=this.grinch.getAction(this.turns);
        //console.log(grinchAction);
        grinchAction.target=this.player;
        grinchAction.self=this.grinch;
        start=grinchAction.startMsg.buildDescription()
        returnMsg+=grinchAction.startMsg.buildDescription();
        response=grinchAction.getResponse();
        await response.response(grinchAction,response);
        returnMsg+=response.resultMsg;
        returnMsg+='\n';
        returnMsg+=await this.calculateDrops(startingHealth);
        //await this.msg.reactions.removeAll();
        //check if game ended
        endMsg= await this.isGameOver();
        if(endMsg.returnMsg){
            returnMsg+=endMsg.returnMsg;
            this.embed.addField(turnMsg,returnMsg);
            this.embed.addField(`${this.player.name}: ${this.player.healthBar()}`,`${this.grinch.name}: ${this.grinch.healthBar()}`);
            const summaryDescription=`${endMsg.returnMsg}\n**${endMsg.endingMsg}**\n${start+response.resultMsg}`;
            this.summary.setDescription(summaryDescription);
            this.msg= await this.msg.edit(this.embed);
            const next= await this.msg.awaitReactions(filter,{max:1,time:600000,errors:['time']});
            next.first().users.remove(this.player.user);
            this.setSummary();
            const res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player.user.id}`]);
            if(res.rowCount){
                this.summary.setFooter(`${this.player.name} now has ${res.rows[0].points} points`,`${this.player.user.displayAvatarURL()}`);
            }
            else{
                this.summary.setFooter(`${this.player.name} now has 0 points`,`${this.player.user.displayAvatarURL()}`);
            }
            this.msg.edit(this.summary);
            this.msg.client.cooldowns.get('grinch').delete(`${this.channel.guild.id}&${this.player.user.id}`);
            return;
        }
        this.embed.addField(turnMsg,returnMsg);
        this.embed.addField(`${this.player.name}: ${this.player.healthBar()}`,`${this.grinch.name}: ${this.grinch.healthBar()}`);
        this.msg= await this.msg.edit(this.embed);
        }
        catch(err){
            console.log(err);
            this.msg.client.cooldowns.get('grinch').delete(`${this.channel.guild.id}&${this.player.user.id}`);
            return;
        }
        //await reaction for next turn
        this.msg.awaitReactions(filter,{max:1,time:600000,errors:['time']}).then((next)=>{
            next.first().users.remove(this.player.user);
            this.playersTurn();
        }).catch(async (err)=>{
            console.log(err);
            this.msg.client.cooldowns.get('grinch').delete(`${this.channel.guild.id}&${this.player.user.id}`);
            this.summary.setDescription(summaryDescription);
            this.setSummary();
            const res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player.user.id}`]);
            if(res.rowCount){
                this.summary.setFooter(`${this.player.name} now has ${res.rows[0].points} points`,`${this.player.user.displayAvatarURL()}`);
            }
            else{
                this.summary.setFooter(`${this.player.name} now has 0 points`,`${this.player.user.displayAvatarURL()}`);
            }
            this.msg.edit(this.summary);
            return;
        });
        /*try{
            await this.msg.react('➡️');
        }
        catch(err){
            console.log(err);
        }*/
    }
    awaitPlayerAction(){
        const filter= (reaction,user)=>{
            if(user.id!==this.player.user.id){
                return false;
            }
            else{
                for(let i=0;i<this.player.actions.length;i++){
                    if(reaction.emoji.name===`${i+1}\ufe0f\u20e3`){
                        return true;
                    }
                }
                return false;
            }
        }
        let actionChosen=false;
        this.msg.awaitReactions(filter,{max:1, time:600000,errors:['time']}).then(async (actionEmote)=>{
            let action;
            actionEmote.forEach((element)=>{
                const emote=element._emoji.name;
                action=emote.substring(0,emote.indexOf('\ufe0f'));
            });
            const cost=this.player.actions[action-1].cost;
            if(cost){
            const res=await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player.user.id}`]);
            if(res.rowCount){
                if(res.rows[0].points>=cost){
                await updatePoints(`${this.channel.guild.id}&${this.player.user.id}`,`${this.player.name}`,`${-cost}`,this.player.summaryMsgMap,'from using expensive moves');
                actionChosen=true;
            }
            }
        }
        else{
            actionChosen=true;
        }
            
            actionEmote.first().users.remove(this.player.user);
            if(actionChosen){
            this.grinchsTurn(action);
            }
            else{
                this.embed.setFooter('You do not have enough points for that');
                await this.msg.edit(this.embed);
                this.awaitPlayerAction();
            }
        }).catch(async (err)=>{
            console.log(err);
            this.msg.client.cooldowns.get('grinch').delete(`${this.channel.guild.id}&${this.player.user.id}`);
            this.summary.setDescription(summaryDescription);
            this.setSummary();
            const res= await db.query('SELECT points FROM points WHERE id=$1',[`${this.channel.guild.id}&${this.player.user.id}`]);
            if(res.rowCount){
                this.summary.setFooter(`${this.player.name} now has ${res.rows[0].points} points`,`${this.player.user.displayAvatarURL()}`);
            }
            else{
                this.summary.setFooter(`${this.player.name} now has 0 points`,`${this.player.user.displayAvatarURL()}`);
            }
            this.msg.edit(this.summary);
            return;
        });
    }
    async calculateDrops(startingHealth){
        try{
            if(startingHealth>this.grinch.health){
            const pointsDropped=this.grinch.dropPoints(startingHealth-this.grinch.health);
            await updatePoints(`${this.player.serverId}&${this.player.user.id}`,`${this.player.name}`,`${pointsDropped}`,this.player.summaryMsgMap,'from fighting the Grinch');
            return `The ${this.grinch.name} dropped ${pointsDropped} points\n`;
        }
        else{
            return '';
        }
        }
        catch(err){
            console.log(err);
        }
    }
    async isGameOver(){
        let returnData={returnMsg:'',endingMsg:''};
        if(this.player.isDefeated()){
            this.embed.setThumbnail('https://static.drips.pw/rotmg/wiki/Environment/Gravestone%2011.png')
            returnData.returnMsg+=`${this.player.name} was defeated by the ${this.grinch.name}`;
            returnData.endingMsg+='Final Blow';
        }
        else if(this.grinch.isDefeated()){
            returnData.returnMsg+=`The ${this.grinch.name} was defeated, and dropped ${this.grinch.defeatDrops} points`;
            this.embed.setImage('https://static.drips.pw/rotmg/wiki/Enemies/shtrs%20Loot%20Balloon%20Bridge.png');
            await updatePoints(`${this.player.serverId}&${this.player.user.id}`,`${this.player.name}`,`${this.grinch.defeatDrops}`,this.player.summaryMsgMap,`from defeating the ${this.grinch.name}`);
            returnData.endingMsg+='Final Blow';
        }
        else if(this.grinch.ranAway){
            returnData.returnMsg+=`The ${this.grinch.name} ran away`;
            this.embed.setImage('https://i.imgur.com/9Xbk3pM.png');
            returnData.endingMsg+='Final Action';
        }
        else if(this.player.surrender){
            this.embed.setThumbnail('https://static.drips.pw/rotmg/wiki/Environment/Gravestone%201.png');
            returnData.returnMsg+=`${this.player.name} could not stand against the might of the ${this.grinch.name}`;
            returnData.endingMsg+='Final Action';
        }
        if(returnData.returnMsg){
            this.embed.setFooter('React with the arrow emote to see the game summary');
            //this.setSummary();
        }
        return returnData;
    }
    outOfTime(){
        
    }
    setSummary(){
        let summaryMsg='';
        let pointsMsg='';
        let total=0;
        this.player.summaryMsgMap.forEach((value,key)=>{
            if(value>0){
                summaryMsg+=`Gained points ${key}\n`;
                pointsMsg+=`+${value}\n`;
                total+=value;
            }
            else if(value<0){
                summaryMsg+=`Lost points ${key}\n`;
                pointsMsg+=value+'\n';
                total+=value;
            }
        });
        if(total>0){
            pointsMsg+=`**+${total}**`;
        }
        else{
            pointsMsg+=`**${total}**`;
        }
        summaryMsg+='**Total**';
        this.summary.addField('Source',summaryMsg,true);
        this.summary.addField('Points',pointsMsg,true);
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

module.exports={
    name:'grinch',
    description:'Starts an attempt to fight the Grinch (costs 500 points)',
    usage:'grinch',
    category:'',
    status:true,
    argsRequired:[0],
    async code(msg,args){
        const serverId=msg.guild.id;
        const user=msg.author;
        const userId=msg.author.id;
        const guildName=msg.member.displayName;
        const channel=msg.channel;
        const cost=500;
        const db=require('./database.js');
        let currentPoints;
        try{
        const res= await db.query('SELECT * FROM points WHERE id=$1',[`${serverId}&${userId}`]);
        if(res.rowCount<=0||res.rows[0].points<500){
            msg.channel.send('You do not have enough points to fight the Grinch');
            return;
        }
        currentPoints=res.rows[0].points;
        }
        catch(err){
            console.log(err);
            return;
        }
        if(!msg.client.cooldowns.get(this.name))
            {
                msg.client.cooldowns.set(this.name,new Discord.Collection());
            }
        const timestamps=msg.client.cooldowns.get(this.name);
        if(timestamps.has(`${serverId}&${userId}`)){
            msg.channel.send('You are currently fighting the Grinch');
            return;
        }
        timestamps.set(`${serverId}&${userId}`,'playing');
        //console.log(timestamps);

        const player=new Player(guildName,user,serverId);
        const grinch=new Grinch(player);
        const game=new Game(player,grinch,channel);
        await updatePoints(`${serverId}&${userId}`,`${guildName}`,`${-cost}`,player.summaryMsgMap,'as base cost');
        game.startGame(grinch,player).then((res)=>{
            timestamps.delete(`${serverId}&${userId}`);
        }).catch((err)=>{
            console.log(err);
            timestamps.delete(`${serverId}&${userId}`);
        });
    }
}