const { DiscordAPIError } = require('discord.js');
const mathjs=require('mathjs');
module.exports = {
    name: 'graph',
    description:"Graphs the provided function (function must be expressed with x and y)",
    usage:'graph <function> <start (optional)> <end (optional)>\n(e.g. -graph y=3x^2+3x+2)',
    category:'Math',
    argsRequired: [1,3],
    status:true,
    code(msg, args) {
        //calculate x values of data points based on user input
        const eq = args[0];
        let start = parseFloat(args[1]);
        if(!start&&start!=0)
        start=-10;
        let end = parseFloat(args[2]);
        if(!end&&end!=0)
        end=10;
        const pointsNum = 51;
        const pointSpace = (end - start)/(pointsNum-1);
        const data = [];
        //evalutes equation for each x value
        let point={x:0,y:0};
        for (let i = 0; i < pointsNum; i++) {
            point.x = start + i * pointSpace;
            mathjs.evaluate(eq,point);
            point.x=Math.round(point.x*1000)/1000;
            point.y=Math.round(point.y*1000)/1000;
            data.push({ x: point.x, y: point.y });
        }
        const urlEq=eq.replace('+', '%2B');
        //generates graph object
        var Chart = require('chart.js');
        graph = {
            type: 'line',
            data: {
                datasets: [{
                    label: urlEq,
                    fill: false,
                    pointRadius: 0,
                    data: data
                }],

            },
            options: {
                title: {
                    display: true,
                    text: urlEq,
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
        //console.log(graphUrl);
        graphUrl = `https://quickchart.io/chart?bkg=white&devicePixelRatio=1.0&w=800&h=600&c=${graphUrl}`;
        //sends graph image url in an embed
        const Discord = require('discord.js');
        let embed = new Discord.MessageEmbed();
        embed.setImage(graphUrl);
        msg.channel.send(embed);
    }
}