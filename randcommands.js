//commands with random aspects
const Discord=require('discord.js')
module.exports={
    coinflip:{
        name:'coinflip',
        description:"",
        usage:'coinflip',
        argsRequired:[0],
        status:true,
        code(msg,args){
            const result=Math.random()<=0.5 ? 'Heads':'Tails';
            let embed= new Discord.MessageEmbed();
            //sends embed with image of heads and tails respectively
            if(result==='Heads')
            embed.setImage('https://cdn.discordapp.com/attachments/765721453160300545/779592380831367168/H6WtnHh0lbUwAAAAAElFTkSuQmCC.png');
            else
            embed.setImage('https://cdn.discordapp.com/attachments/765721453160300545/779592914200297512/3LzsFq3dGGoDmAAAAAElFTkSuQmCC.png');
            embed.setTitle(result);
            msg.channel.send(embed);
        }
    },
    randNum:{
        name:'randNum',
        description:"",
        usage:'randNum <min(optional> <max(optional)>',
        argsRequired:[0,2],
        status:true,
        code(msg,args){
            //random number between range provided
            if(args.length!==0)
            {
            const min=Math.ceil(args[0]);
            const max=Math.floor(args[1])
            const range=max-min;
            const result=Math.floor(Math.random()*(range+1))+min;
            msg.channel.send(result);
            }
            //random number between 0 and 10
            else
            {
                const result=Math.floor(Math.random()*10)+1;
                msg.channel.send(result);
            }

        }
    }
}