const { DiscordAPIError } = require('discord.js');

module.exports = {
    name: 'graph',
    description:"",
    usage:'graph <function>',
    argsRequired: [1,3],
    status:true,
    code(msg, args) {
        //calculate x values of data points based on user input
        const eq = args[0].replace('y=', '').trim();
        const start = parseFloat(args[1]) || -10;
        const end = parseFloat(args[2]) || 10;
        const pointsNum = 51;
        const pointSpace = (end - start)/(pointsNum-1);
        const data = [];
        //evalutes equation for each x value
        for (let i = 0; i < pointsNum; i++) {
            let x = start + i * pointSpace;
            console.log(eq);
            let y= Math.round(eval(eq)*1000)/1000;
            x=Math.round(x*1000)/1000;
            data.push({ x: x, y: y });
        }
        //generates graph object
        var Chart = require('chart.js');
        graph = {
            type: 'line',
            data: {
                datasets: [{
                    label: eq,
                    fill: false,
                    pointRadius: 0,
                    data: data
                }],

            },
            options: {
                title: {
                    display: true,
                    text: args[0],
                    fontSize:32
                },
                scales: {
                    xAxes: [{
                        type: 'linear',
                        position: 'center',
                        scaleLabel: {
                            display: true,
                            labelString: '',
                        },
                        gridLines: {
                            color:'rgba(125,125,125,0.8)',
                            zeroLineColor:'rgba(0,0,0,1)',
                        },
                        ticks:{
                            fontSize:20,
                        }
                    }],
                    yAxes: [{
                        type: 'linear',
                        position: 'left',
                        scaleLabel: {
                            display: true,
                            labelString: '',
                        },
                        gridLines: {
                            color:'rgba(125,125,125,0.8)',
                            zeroLineColor:'rgba(0,0,0,1)',
                        },
                        ticks:{
                            fontSize:20,
                        }
                    }]
                },
                legend: {
                    align: 'end',
                    labels:{
                        fontSize:20,
                        boxWidth:20
                    }
                }
            }
        };
        //converts graph object to url
        let graphUrl = JSON.stringify(graph);//.replace(/"/g, '');
        console.log(graphUrl);
        graphUrl = `https://quickchart.io/chart?bkg=white&devicePixelRatio=1.0&w=800&h=600&c=${graphUrl}`;
        //sends graph image url in an embed
        const Discord = require('discord.js');
        let embed = new Discord.MessageEmbed();
        embed.setImage(graphUrl);
        msg.channel.send(embed);
    }
}