module.exports={
    name:'play',
    description:'plays certain audio',
    usage:'play <name> (current options: oryx, realmDeathSound)',
    category:'Realm', //for now
    status:true,
    argsRequired:[1],
    async code(msg,args){
        const audio=args[0]
        if(audio=='oryx'||audio=='realmDeathSound'){
            if(msg.member.voice.channel){
                const connection= await msg.member.voice.channel.join();
                if(audio=='oryx'){
                    const dispatcher=connection.play('http://realmofthemadgod.appspot.com/sfx/monster/oryx_death.mp3');
                    dispatcher.on('finish',()=>{
                        console.log('run');
                        connection.disconnect();
                    })
                }
                else if(audio=='realmDeathSound'){
                    const dispatcher= connection.play('http://realmofthemadgod.appspot.com/sfx/death_screen.mp3');
                    dispatcher.on('finish',()=>{
                        console.log('run');
                        connection.disconnect();
                    });
                }
            }
            else{
                msg.channel.send('You are not in a voice channel')
            }
        }
        else{
            msg.channel.send('Invalid type');
        }
    }
}