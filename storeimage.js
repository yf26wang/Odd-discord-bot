module.exports ={
    name:'store',
    usage:'store <identifier> <image url>',
    argsRequired:2,
    code(msg,args){
        const sqlite3=require('sqlite3');
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
