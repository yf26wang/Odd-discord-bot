module.exports={
    name:'play',
    description:'plays certain audio',
    usage:'play <name> (current options: oryx, realmDeathSound, sorc)',
    category:'Realm', //for now
    status:true,
    argsRequired:[1],
    async code(msg,args){
        try{
            //see if cooldowns collection for this command exists, set new cooldowns collection if collection does not exist
        if(!msg.client.cooldowns.get(this.name)){
            msg.client.cooldowns.set(this.name,'ready');
        }
        //check if audio is currently playing
        if(msg.client.cooldowns.get(this.name)==='onCooldown'){
            msg.channel.send('You are doing that too fast, slow down!');
            return;
        }
        const audio=args[0];
        //check if indicated audio exists
        if(audio==='oryx'||audio==='realmDeathSound'||audio=='sorc'){
            //check if the person is in a voice channel
            if(msg.member.voice.channel){
                //set the command to be on cooldown
                msg.client.cooldowns.set(this.name,'onCooldown');
                //join voice
                const connection= await msg.member.voice.channel.join();
                let audioUrl;
                //set url to be played based on argument user provides
                if(audio=='oryx'){
                    audioUrl='http://realmofthemadgod.appspot.com/sfx/monster/oryx_death.mp3';
                }
                else if(audio=='realmDeathSound'){
                    audioUrl= 'http://realmofthemadgod.appspot.com/sfx/death_screen.mp3';
                }
                else if(audio=='sorc'){
                    audioUrl='http://realmofthemadgod.appspot.com/music/sorc.mp3';
                }
                //plays audio, returning dispatcher
                const dispatcher=connection.play(audioUrl);
                //disconnects after the audio finishes playing
                dispatcher.on('finish',()=>{
                    //console.log('run');
                    connection.disconnect();
                    //msg.client.cooldowns.set(this.name,'ready');
                });
                //prints out error if there is error
                dispatcher.on('error',(err)=>{
                    console.log(err);
                });
                //set command to be ready after disconnection
                connection.on('disconnect',()=>{
                    msg.client.cooldowns.set(this.name,'ready');
                })
            }
            else{
                msg.channel.send('You are not in a voice channel');
            }
        }
        else{
            msg.channel.send('Invalid type');
        }
    }
    catch(err){
        //leaves voice call and sets the command to be ready again if error occurs
        console.log(err);
        msg.member.voice.channel.leave();
        msg.client.cooldowns.set(this.name,'ready');
    }
    }
}