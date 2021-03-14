const Discord=require('discord.js');
const fetch= require('node-fetch');
const db=require('./database.js');

function getStarRank(rank){
    const starMap={
        lightBlue:'https://i.imgur.com/fLhxH7P.png',
        blue:'https://i.imgur.com/wgkNgSP.png',
        red:'https://i.imgur.com/3Zy4b7d.png',
        orange:'https://i.imgur.com/HhgUOuL.png',
        yellow:'https://i.imgur.com/saQpAmI.png',
        white:'https://i.imgur.com/fj7waiH.png'
    }
    if(rank===80)
    return starMap.white;
    else if(rank>=64)
    return starMap.yellow;
    else if(rank>=48)
    return starMap.orange;
    else if(rank>=32)
    return starMap.red;
    else if(rank>=16)
    return starMap.blue;
    else
    return starMap.lightBlue;
}

function getTitleCharacters(characters,index){
    let returnMsg='';
    for(let i=0;i<characters.length;i++){
        if((i+1)%5===1){
            if(i===index)
            returnMsg+=`**__${characters[i].class}__** |`;
            else
            returnMsg+=`${characters[i].class} |`;
        }
        else if((i+1)%5===0){
            if(i===index)
            returnMsg+=` **__${characters[i].class}__**`;
            else
            returnMsg+=` ${characters[i].class}`;

            if(i+1===characters.length)
            returnMsg+=' |';
            else
            returnMsg+='\n';
        }
        else{
            if(i===index)
            returnMsg+=` **__${characters[i].class}__** |`;
            else
            returnMsg+=` ${characters[i].class} |`;
        }
    }
    returnMsg=returnMsg.substring(0,returnMsg.length-2);
    return returnMsg;
}

const realmeye={
    name:'realmeye',
    description:'Gets the character info of a player',
    usage:'realmeye <player>',
    category:'Realm',
    status:true,
    argsRequired:[1],
    async code(msg,args){
        const root='https://nightfirec.at/realmeye-api/';
        const query=`?player=${args[0]}`;
        const endpoint=root+query;
        const embed=new Discord.MessageEmbed();
        const guildName=msg.member.displayName;
        const spriteRoot='https://static.drips.pw/rotmg/wiki/Classes/';
        const realmeyeUrl='https://www.realmeye.com/player/';
        if(msg.client.cooldowns.get(this.name)==undefined)
        {
            msg.client.cooldowns.set(this.name,0);
        }
        msg.client.cooldowns.set(this.name,(msg.client.cooldowns.get(this.name)+1));
        if(msg.client.cooldowns.get(this.name)>=30){
            //should be good after other await reactions time out (3min)
            msg.channel.send('Too many requests! Chill for a bit.');
            return;
        }
        let profileMsg;
        try{
        embed.setTitle('Loading...')
        embed.setImage('https://cdn.discordapp.com/attachments/765717762654994435/819781194672635984/rogue_loading_screen.gif');
        profileMsg=await msg.channel.send(embed);
        //console.log(endpoint);
        const res= await fetch(endpoint);
            //console.log(res);
            if(!res.ok){
                throw new Error('res not ok');
            }
        const jsonRes= await res.json();
        if(jsonRes.error)
            throw new Error(jsonRes.error);
            const embedArray= await Promise.all(jsonRes.characters.map(async (character,index)=>{
                const characterEmbed= new Discord.MessageEmbed();
                characterEmbed.setAuthor(`${jsonRes.player}'s characters`,getStarRank(jsonRes.rank),realmeyeUrl+jsonRes.player)
                characterEmbed.setTitle(`${getTitleCharacters(jsonRes.characters,index)}`);
                const spriteRes= await db.query('SELECT * FROM realm_skin_ids JOIN realm_skin_sprites ON realm_skin_ids.name=realm_skin_sprites.name WHERE realm_skin_ids.id=$1;',[`${character.data_skin_id}`]);
                if(spriteRes.rowCount){
                    characterEmbed.setThumbnail(spriteRes.rows[0].sprite_url);
                }
                else{
                characterEmbed.setThumbnail(spriteRoot+character.class+'.png');
                }
                characterEmbed.addField('Level',`\`\`\`ini\n${character.level}\n\`\`\``,true);
                characterEmbed.addField('Character Fame',`\`\`\`fix\n${character.fame}\n\`\`\``,true);
                characterEmbed.addField('Stats',`\`\`\`py\n${character.stats_maxed}/8\n\`\`\``,true);
                characterEmbed.addField('Equipment',`\`\`\`md\n# ${character.equips.weapon}\n# ${character.equips.ability}\n# ${character.equips.armor}\n# ${character.equips.ring}\n\`\`\``);
                if(character.pet){
                    const petSpriteRes= await db.query('SELECT * FROM realm_pet_sprites WHERE name=$1',[character.pet]);
                    if(petSpriteRes.rowCount){
                        characterEmbed.setFooter(`${character.pet}`,petSpriteRes.rows[0].sprite_url);
                    }
                    else{
                        characterEmbed.setFooter(`${character.pet}`,'https://i.imgur.com/FfWpJKI.png');
                    }
                }
                else{
                    characterEmbed.setFooter('No pet');
                }
                //console.log(characterEmbed);
                return characterEmbed;
            }));
            //console.log(embedArray);
            let currentIndex=0;
            await profileMsg.edit(embedArray[currentIndex]);
            await profileMsg.react('⬅️');
            await profileMsg.react('➡️');
            const filter= (reaction,user)=>{
                return /*user.id===msg.author.id&&*/(reaction.emoji.name==='➡️'||reaction.emoji.name==='⬅️');
            }
            try{
                while(true){
                const emoteReaction= await profileMsg.awaitReactions(filter,{max:1,time:180000,errors:['time']});0
                emoteReaction.first().users.remove(msg.author);
                const emote=emoteReaction.first().emoji.name;
                if(emote==='⬅️'){
                    if(currentIndex>0){
                        currentIndex--;
                    }
                    else{
                        currentIndex=jsonRes.characters.length-1;
                    }
                    await profileMsg.edit(embedArray[currentIndex]);
                    
                }
                else if(emote==='➡️'){
                    if(currentIndex<jsonRes.characters.length-1){
                        currentIndex++;
                    }
                    else{
                        currentIndex=0;
                    }
                    await profileMsg.edit(embedArray[currentIndex]);
                }
            }
            }
            catch(err){
                msg.client.cooldowns.set(this.name,(msg.client.cooldowns.get(this.name)-1));
                //console.log(err);
                //console.log('timed out');
                return;
            }
    }
        catch(err){
            msg.client.cooldowns.set(this.name,(msg.client.cooldowns.get(this.name)-1));
            //check if player not found
            //console.log(err);
            if(err.message.includes('could not be found'))
            embed.setTitle(err.message);
            else
            embed.setTitle('Timed out probably..');
            profileMsg.edit(embed);
        };
    }
}

const updateRealmSprites={
    name:'updateRealmSprites',
    description:'updates realm sprite links',
    usage:'updateRealmSprites <type>',
    category:'Realm',
    status:true,
    argsRequired:[1],
    async code(msg,args){
        try{
            if(args[0]=='ids'){
                await db.query('CREATE TABLE IF NOT EXISTS realm_skin_ids(name TEXT, id INTEGER);');
                await db.query('DELETE FROM realm_skin_ids');
                //realm skins and special themed sets
                let endpoint='https://www.haizor.net/rotmg/assets/production/xml/skins.xml';
                let res=await fetch(endpoint);
                if(!res.ok){
                    throw new Error('res not ok');
                }
                let xml=await res.text();
                //console.log(xml);
                let xmlArray= xml.split('</Object>');
                for(let i=0;i<xmlArray.length;i++){
                    if(xmlArray[i].includes('playerskins')){
                        const nameMatch= xmlArray[i].match(/id="([A-Za-z0-9 \-']+)/g);
                        const idMatch= xmlArray[i].match(/type="([A-Za-z0-9 \-']+)/g);
                        if(nameMatch&&idMatch){
                        let name=nameMatch[0];
                        let id=idMatch[0];
                        name=name.substring(4);
                        id=id.substring(6);
                        id=parseInt(id,16);
                        const res= await db.query('INSERT INTO realm_skin_ids VALUES($1,$2);',[name,id]);
                        }
                    }
                }
                endpoint='https://www.haizor.net/rotmg/assets/production/xml/equipmentsets.xml';
                res=await fetch(endpoint);
                if(!res.ok){
                    throw new Error('res not ok');
                }
                xml=await res.text();
                //console.log(xml);
                xmlArray= xml.split('</EquipmentSet>');
                for(let i=0;i<xmlArray.length;i++){
                    //check if element is a special themed skin set
                    if(xmlArray[i].includes('ChangeSkin')){
                        const nameMatch= xmlArray[i].match(/id="([A-Za-z0-9 \-']+)/g);
                        const idMatch= xmlArray[i].match(/skinType="([A-Za-z0-9 \-']+)/g);
                        if(nameMatch&&idMatch){
                        let name=nameMatch[0];
                        let id=idMatch[0];
                        name=name.substring(4)+' Skin';
                        id=id.substring(10);
                        id=parseInt(id,16);
                        //console.log(name+' '+id);
                        const res= await db.query('INSERT INTO realm_skin_ids VALUES($1,$2);',[name,id]);
                        //primary key query
                        //const res= await db.query('INSERT INTO realm_skin_ids VALUES($1,$2) ON CONFLICT (name) DO UPDATE SET id=$2;',[name,id]);
                        }
                    }
                }
                msg.channel.send('ids updated!');
            }
            else if(args[0]=='sprites'){
                await db.query('CREATE TABLE IF NOT EXISTS realm_skin_sprites(name TEXT, sprite_url TEXT);');
                await db.query('DELETE FROM realm_skin_sprites');
                const endpoint='https://www.realmeye.com/wiki/character-skins';
                const res= await fetch(endpoint,{headers:{
                    Accept:'text/html',
                    'User-Agent':'Mozilla/5.0'
                }});
                if(!res.ok){
                    throw new Error('res not ok');
                }
                const html=await res.text();
                const tableArray=html.match(/<table(.*?)<\/table>/gs);
                const allSprites=tableArray[1];
                const linkArray=allSprites.match(/<img(.*?)>/gs);
                for(let i=0;i<linkArray.length;i++){
                    const nameMatch=linkArray[i].match(/title="(.*?)"/gs);
                    const spriteMatch=linkArray[i].match(/src="(.*?)"/gs);
                    if(nameMatch&&spriteMatch){
                    let name=nameMatch[0];
                    let sprite=spriteMatch[0];
                    name=name.substring(7,name.length-1);
                    sprite='https:'+sprite.substring(5,sprite.length-1);
                    const res= await db.query('INSERT INTO realm_skin_sprites VALUES($1,$2);',[name,sprite]);
                    }
                }
                msg.channel.send('sprites updated!')
            }
            else if(args[0]=='petSprites'){
                await db.query('CREATE TABLE IF NOT EXISTS realm_pet_sprites(name TEXT, sprite_url TEXT);');
                await db.query('DELETE FROM realm_pet_sprites');
                const endpoint='https://www.realmeye.com/wiki/pet-skins';
                const res= await fetch(endpoint,{headers:{
                    Accept:'text/html',
                    'User-Agent':'Mozilla/5.0'
                }});
                if(!res.ok){
                    throw new Error('res not ok');
                }
                const html=await res.text();
                const headerContentSplit=html.split('</header>');
                const allSprites=headerContentSplit[1];
                const linkArray=allSprites.match(/<img(.*?)>/gs);
                for(let i=0;i<linkArray.length;i++){
                    const nameMatch=linkArray[i].match(/title="(.*?)"/gs);
                    const spriteMatch=linkArray[i].match(/src="(.*?)"/gs);
                    if(nameMatch&&spriteMatch){
                    let name=nameMatch[0];
                    let sprite=spriteMatch[0];
                    name=name.substring(7,name.length-1);
                    sprite='https:'+sprite.substring(5,sprite.length-1);
                    //console.log(name+' '+sprite);
                    const res= await db.query('INSERT INTO realm_pet_sprites VALUES($1,$2);',[name,sprite]);
                    }
                }
                msg.channel.send('pet sprites updated!')
            }
            else if(args[0]=='list'){
                msg.channel.send('ids\nsprites\npetSprites');
            }
        }
        catch(err){
            console.log(err);
        }
    }
}

module.exports={realmeye,updateRealmSprites};

/*const img='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'
const imageStream= Buffer.from(img,'base64');
 const attach= new Discord.MessageAttachment(imageStream);
 characterEmbed.attachFiles({attachment:attach,name:'characters.png'});
 characterEmbed.setImage('attachment://characters.png');*/