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
}