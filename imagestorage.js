const Discord = require('discord.js');
const sqlite3=require('sqlite3');
const storeImage ={
    name:'store',
    description:"",
    usage:'store <identifier> <image url>',
    status:false,
    argsRequired:2,
    code(msg,args){
        const storedimgs=new sqlite3.Database('./storedimgs.sqlite');
        const imgName=args[0];
        const imgUrl=args[1];
        const serverId=msg.guild.id;
        if(serverId)
        storedimgs.run(`INSERT INTO imgs VALUES('${serverId+imgName}','${imgName}','${imgUrl}');`,(err)=>{
            if(err)
            {
            console.log(err);
            msg.channel.send('Duplicate name/url');
            }
            else
            msg.channel.send(`${imgName} has been stored!`)
        });
        else
        msg.channel.send('You can only store images on a server.')
    }
}
const getImage = {
    name: 'img',
    description:"",
    usage: 'img <identifier>',
    status:false,
    argsRequired: 1,
    code(msg, args) {
        //import {imgs} from './index.js';
        const storedimgs = new sqlite3.Database('./storedimgs.sqlite');
        const serverId=msg.guild.id;
        let imgUrl;
        storedimgs.get(`SELECT * FROM imgs WHERE id='${serverId+args[0]}';`, (err, row) => {
            if (err)
                console.log(e);
            else if(row){
                console.log(row);
                imgUrl = row.url;
                if (imgUrl) {
                    let embed = new Discord.MessageEmbed();
                    embed.setTitle(args[0]);
                    embed.setImage(imgUrl);
                    msg.channel.send(embed);
                }
                else
                    msg.channel.send(`There is no image with the name: ${args[0]}`);
            }
            else
            msg.channel.send(`There is no image with the name: ${args[0]}`);
        })
    }
}
module.exports={storeImage,getImage};