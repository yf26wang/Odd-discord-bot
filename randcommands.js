//commands with random aspects
const Discord=require('discord.js')
module.exports={
    coinflip:{
        name:'coinflip',
        description:"",
        usage:'coinflip',
        argsRequired:0,
        status:true,
        code(msg,args){
            const result=Math.random()<=0.5 ? 'Heads':'Tails';
            msg.channel.send(result);
        }
    },
    randNum:{
        name:'randNum',
        description:"",
        usage:'randNum <min(optional> <max(optional)>',
        argsRequired:'any',
        status:true,
        code(msg,args){
            console.log(args.length);
            if(args.length!==0)
            {
            const min=Math.ceil(args[0]);
            const max=Math.floor(args[1])
            const range=max-min;
            const result=Math.floor(Math.random()*(range+1))+min;
            msg.channel.send(result);
            }
            else
            {
                const result=Math.floor(Math.random()*10)+1;
                msg.channel.send(result);
            }

        }
    }
}