var moduleFunction = async(client, moduleLoader, config) => {
    if (!client)
        throw new Error("No client passed");

    const { arrayContainsArray } = require("./helpers");

    var { ObjectDataModel, TYPES } = moduleLoader.getModule("OBJMDL.JS").exports;

    class primitiveMiddleWare {
        constructor(middleware, callback) {
            this.next = this.next.bind(this);
            this.use = this.use.bind(this);
            this.callback = callback;

            if (!this.callback)
                throw new Error("No callback in command middleware")

            this.callback = callback;

            this.message = null;
            this.index = -1;
            this.functions = middleware ? middleware : [];
        }


        async next() {
            this.index++;
            if (this.functions.length > this.index) {
                var fc = this.functions[this.index];
                if (fc.constructor.name == 'AsyncFunction')
                    await fc(client, this.message, this.next);
                else
                    fc(client, this.message, this.next);
            } else {
                this.callback();
            }
        }

        use(fc) {
            if (fc)
                this.functions.push(fc);
        }

        start(message) {
            this.message = message;
            this.index = -1;
            this.next();
        }

    }

    class CommandModel extends ObjectDataModel {
        constructor(...args) {
            super(args, {
                command: TYPES.OBJECT,
                name: TYPES.STRING,
                description: TYPES.STRING,
                callback: TYPES.FUNCTION,
                middleware: TYPES.OPTIONAL(TYPES.OBJECT)
            });
        }
    }

    class CommandTemplate {
        constructor(command, name, description, callback, middleware) {
            new CommandModel(command, name, description, callback, middleware).applyValues(this);

            this.actualCallback = () => {};

            this.primitiveMiddleWare = new primitiveMiddleWare(middleware, () => {
                this.actualCallback();
            });

            this.callback = (message, smsg) => {
                this.actualCallback = () => callback(message, smsg);
                this.primitiveMiddleWare.start(message);
            }
        }

    }

    class CommandHandler {
        constructor() {
            this.handleCommand = this.handleCommand.bind(this);
            this.destroy = this.destroy.bind(this);
            this.addCommand = this.addCommand.bind(this);
            this.getCommandByName = this.getCommandByName.bind(this);
            this.getCommand = this.getCommand.bind(this);

            this.commands = {

            }

            client.on('message', this.handleCommand);
        }

        destroy() {
            client.removeListener('message', this.handleCommand);
        }

        getCommand(command) {
            for (var i in this.commands) {
                if (this.commands[i].command.includes(command))
                    return this.commands[i];
            }
            return false;
        }

        getCommandByName(name) {
            for (var i in this.commands) {
                if (name === this.commands[i].name)
                    return this.commands[i];
            }
            return false;
        }

        handleCommand(message) {
            var smsg = message.content.match(/'[^']*'|"[^"]*"|\S+/g) || [];

            for (var i in smsg) {
                if (smsg[i].includes('"') && typeof smsg[i] == "string")
                    smsg[i] = smsg[i].replaceAll('"', "");

                smsg[i] = parseInt(smsg[i]) ? parseInt(smsg[i]) : smsg[i];
                smsg[i] = parseFloat(smsg[i]) ? parseFloat(smsg[i]) : smsg[i];
            }

            if (smsg.length <= 0)
                return false;

            var command = this.getCommand(smsg[0]);

            if (command)
                command.callback(message, smsg)
        }

        addCommand(command, name, description, callback, middleware) {
            if (name in this.commands)
                throw new Error("Trying to register command with name that is already registered - " + name)

            for (var i in this.commands) {
                if (arrayContainsArray(this.commands[i].command, command)) {
                    throw new Error("Trying to register command with trigger/alias that is already registered - " + command)
                }
            }

            this.commands[name] = new CommandTemplate(command, name, description, callback, middleware);
        }
    }

    var CommandSystem = new CommandHandler();

    var channelMiddleWare = (channel, any = false) => {
        return (client, message, next) => {
            if (message.channel.id == channel || any == true)
                next();
        }
    }

    return {
        name: "Command Handler",
        exports: {
            CommandSystem: CommandSystem,
            CommandTemplate: CommandTemplate,
            channelMiddleWare: channelMiddleWare
        },
        unload: async() => {
            CommandSystem.destroy();

            delete CommandSystem;

            return true;
        }
    }
}

module.exports = {
    module: moduleFunction,
    requires: ["OBJMDL.JS"],
    code: "CMD.JS"
}
