const Discord = require('discord.js');
const moduleLoaderSystem = require("./modules.js");
const config = require("./config.js")

class Bot {
    constructor() {
        this.onReady = this.onReady.bind(this);
        this.login = this.login.bind(this);

        this.client = new Discord.Client();
        this.modulesLoaded = false;

        this.client.on('ready', this.onReady);
        this.login(config.bot.token);
    }

    onReady() {
        console.log(`[DISCORD] Logged in as ${this.client.user.tag}!`);
        if (!this.modulesLoaded) {
            this.moduleLoader = new moduleLoaderSystem({
                client: this.client,
                pluginDirectory: "./plugins",
                someConfigStuffInFuture: true
            })
        }
    }

    login(token) {
        this.client.login(token);
    }
}

var bot = new Bot();

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};