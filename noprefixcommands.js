module.exports={
    volcan:{
        name:'whatisvolcandoing',
        description:"what is volcan currently doing?",
        usage:'whatisvolcandoing',
        category:'Misc',
        status:true,
        argsRequired:[0],
        code(msg,args){
            msg.channel.send('volcan is trolling');
        }
    },
    bumbiedore:{
        name:'whatisbumbiedoredoing',
        description:"what is bumbiedore currently doing?",
        usage:'whatisbumbiedoredoing',
        category:'Misc',
        status:true,
        argsRequired:[0],
        code(msg,args){
            msg.channel.send('bumbiedore is trolling',{tts:true});
        }
    }
}