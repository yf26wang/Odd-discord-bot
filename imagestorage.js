const Discord = require('discord.js');
//const sqlite3=require('sqlite3');
const db=require('./database.js');
const storeImage ={
    name:'store',
    description:"",
    usage:'store <identifier> <image url>',
    status:true,
    argsRequired:[2],
    code(msg,args){
        //declaring variables
        const imgName=args[0];
        const imgUrl=args[1];
        const serverId=msg.guild.id;
        //insert new row into database, checks to see if command is called from a sever
        if(serverId)
        db.query(`INSERT INTO imgs VALUES($1,$2,$3);`,[`${serverId+imgName}`,`${imgName}`,`${imgUrl}`],(err,res)=>{
            if(err)
            {
            console.log(err);
            msg.channel.send('Duplicate name/url');
            }
            else
            {
            msg.channel.send(`${imgName} has been stored!`);
            }
        });
        else
        msg.channel.send('You can only store images on a server.')
    }
}
const getImage = {
    name: 'img',
    description:"",
    usage: 'img <identifier>',
    status:true,
    argsRequired: [1],
    code(msg, args) {
        //import {imgs} from './index.js';
        //const storedimgs = new sqlite3.Database('./storedimgs.sqlite');
        const serverId=msg.guild.id;
        let imgUrl;
        //gets the image from the database
        db.query(`SELECT * FROM imgs WHERE id=$1;`,[`${serverId+args[0]}`], (err, res) => {
            if (err)
                console.log(err);
            else if(res.rows.length!==0){
                imgUrl = res.rows[0].url;
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
const deleteImage={
    name:'delete',
    description:'',
    usage:'delete <identifier>',
    status:true,
    argsRequired:[1],
    code(msg,args){
        const imgName=args[0];
        const serverId=msg.guild.id;
        db.query(`DELETE FROM imgs WHERE id=$1;`,[`${serverId+imgName}`],(err,res)=>{
            if(err)
            {
            console.log(err);
            msg.channel.send(`There is no image with the name: ${imgName}`);
            }
            else if(res.rowCount!=0){
                msg.channel.send('Image deleted.');
            }
            else{
                msg.channel.send(`There is no image with the name: ${imgName}`);
            }
        })
    }
}
const imglist={
    name:'imglist',
    description:'',
    usage:'imglist',
    status:true,
    argsRequired:[0],
    code(msg,args){
        let list='List of images stored:';
        const serverId=msg.guild.id;
        db.query('SELECT * FROM imgs WHERE id LIKE $1;',[`${serverId}%`],(err,res)=>{
            if(err)
            console.log(err);
            else{
                res.rows.forEach((element)=>{
                    list+=`\n${element.name}`;
                })
            }
            msg.channel.send(list);
        });
    }
}
module.exports={storeImage,getImage,imglist,deleteImage};