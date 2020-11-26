module.exports={
    volcan:{
        name:'whatisvolcandoing',
        description:"",
        usage:'whatisvolcandoing',
        status:true,
        argsRequired:[0],
        code(msg,args){
            msg.channel.send('volcan is trolling');
        }
    },
}