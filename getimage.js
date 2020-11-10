module.exports = {
    name: 'img',
    usage: 'img <identifier>',
    argsRequired: 1,
    code(msg, args) {
        const Discord = require('discord.js');
        //import {imgs} from './index.js';
        const sqlite3 = require('sqlite3');
        const storedimgs = new sqlite3.Database('./storedimgs.sqlite');
        let imgUrl = 0;
        storedimgs.get(`SELECT * FROM imgs WHERE name='${args[0]}';`, (err, row) => {
            if (err)
                console.log(e);
            else {
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
        })
    }
}