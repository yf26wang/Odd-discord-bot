module.exports={
    name:'play',
    description:'plays certain audio',
    usage:'play <name> (current options: oryx, realmDeathSound, sorc)',
    category:'Realm', //for now
    status:true,
    argsRequired:[1],
    async code(msg,args){
        try{
        if(!msg.client.cooldowns.get(this.name)){
            msg.client.cooldowns.set(this.name,'ready');
        }
        if(msg.client.cooldowns.get(this.name)==='onCooldown'){
            msg.channel.send('You are doing that too fast, slow down!');
            return;
        }
        const audio=args[0];
        if(audio==='oryx'||audio==='realmDeathSound'||audio=='sorc'){
            if(msg.member.voice.channel){
                const connection= await msg.member.voice.channel.join();
                msg.client.cooldowns.set(this.name,'onCooldown');
                let audioUrl;
                if(audio=='oryx'){
                    audioUrl='http://realmofthemadgod.appspot.com/sfx/monster/oryx_death.mp3';
                }
                else if(audio=='realmDeathSound'){
                    audioUrl= 'http://realmofthemadgod.appspot.com/sfx/death_screen.mp3';
                }
                else if(audio=='sorc'){
                    audioUrl='http://realmofthemadgod.appspot.com/music/sorc.mp3';
                }
                const dispatcher=connection.play(audioUrl);
                dispatcher.on('finish',()=>{
                    console.log('run');
                    connection.disconnect();
                    //msg.client.cooldowns.set(this.name,'ready');
                });
                dispatcher.on('error',(err)=>{
                    console.log(err);
                });
                connection.on('disconnect',()=>{
                    msg.client.cooldowns.set(this.name,'ready');
                })
            }
            else{
                msg.channel.send('You are not in a voice channel')
            }
        }
        else{
            msg.channel.send('Invalid type');
        }
    }
    catch(err){
        console.log(err);
        msg.member.voice.channel.leave();
        msg.client.cooldowns.set(this.name,'ready');
    }
    }
}