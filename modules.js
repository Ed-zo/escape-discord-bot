const fs = require('fs');
var path = require('path')

const config = require("./config.js")
const { arrayContainsArray, to } = require("./plugins/helpers");

class ModuleLoaderSystem {

    constructor(data) {
        if (typeof data != "object" || !"client" in data)
            throw new error("Module loading error 002");

        this.pluginDirectory = data.pluginDirectory ? data.pluginDirectory : "./plugins";
        this.client = data.client;

        this.loadModules = this.loadModules.bind(this);
        this.loadModule = this.loadModule.bind(this);
        this.unloadModules = this.unloadModules.bind(this);
        this.unloadModule = this.unloadModule.bind(this);
        this.reloadModules = this.reloadModules.bind(this);
        this.unloadDependents = this.unloadDependents.bind(this);
        this.handleResult = this.handleResult.bind(this);
        this.getModule = this.getModule.bind(this);
        this.isModuleLoaded = this.isModuleLoaded.bind(this);

        this.modules = {

        }

        this.loadModules(data.specificOnly ? data.specificOnly : false).catch(err => {
            console.error(err);
            process.exit(1);
        });
    }

    isModuleLoaded(code) {
        if (!code)
            return false;

        return code in this.modules ? true : false;
    }

    getModule(code) {
        if (!code)
            return false;

        return this.isModuleLoaded(code) ? this.modules[code] : false;
    }

    async reloadModules() {
        await this.unloadModules();
        await this.loadModules();
    }

    async unloadModules() {
        for (var key in this.modules) {
            let [err, status] = await to(this.unloadModule(this.modules[key]));

            if (!status || err) {
                console.log("[MODULE UNLOADER] Failed to unload module. Exiting " + this.modules[key].name)
                process.exit(1);
            }

            delete this.modules[key];
        }
    }

    async unloadModule(moduleobj) {
        if (!this.isModuleLoaded(moduleobj.code))
            return false;

        let [err, status] = await to(moduleobj.unload());

        if (err || !status) {
            console.log("[MODULE UNLOADER] Failed to unload " + moduleobj.code)
            console.error(err)
            throw new Error("Module loading error 003")
        }

        await this.unloadDependents(moduleobj.code);

        delete this.modules[moduleobj.code];
        console.log("[MODULE UNLOADER] Successfully unloaded " + moduleobj.code)
        return true;
    }

    async unloadDependents(code) {
        try {
            for (var key in this.modules) {
                var module = this.modules[key];
                if (module.requires.includes(code)) {
                    console.log("[MODULE UNLOADER] Module " + code + " will get unloaded, unloading dependending module " + module.code)
                    await this.unloadModule(module);
                }
            }
        } catch (err) {
            console.error(err)
        }
    }

    async loadModules(manual) {
        var modulesToLoad = manual ? manual : fs.readdirSync(this.pluginDirectory)

        var unloaded = [];

        for (var i in modulesToLoad) {
            let [err, preparedModule] = await to(this.prepareModule(modulesToLoad[i]));

            if (err) {
                console.error(err)
                throw new Error("Module loading error 001");
            }
            if (!preparedModule)
                continue;

            unloaded.push(preparedModule)
        }


        while (unloaded.length > 0) {
            var change = false;
            for (var index in unloaded) {
                if (arrayContainsArray(Object.keys(this.modules), unloaded[index].requires)) {
                    var isLoaded = await (this.loadModule(unloaded[index]));
                    if (isLoaded) {
                        change = true;
                    }
                    delete unloaded[index];
                }
            }

            unloaded = unloaded.filter(n => n);

            if (!change) {
                console.log("[MODULE LOADER] Failed to load these modules " + JSON.stringify(unloaded))
                break;
            }
        }
    }

    async prepareModule(file) {
        if (!fs.statSync(this.pluginDirectory + '/' + file).isDirectory() && path.extname(file) == ".js") {
            delete require.cache[require.resolve(this.pluginDirectory + '/' + file)];
            return require(this.pluginDirectory + '/' + file);
        }
        return false;
    }

    async loadModule(preparedModule) {
        let [err, moduleobj] = await to(preparedModule.module(this.client, this, config));
        if (err) {
            this.handleResult(preparedModule, false);
            console.error(err);
            return false;
        }

        this.handleResult(preparedModule, moduleobj);
        return true;
    }

    handleResult(preparedModule, moduleobj) {

        if (!moduleobj) {
            console.log("[MODULE LOADER] Failed to load " + preparedModule.code, moduleobj)
        } else {
            this.modules[preparedModule.code] = {...moduleobj, ...preparedModule };
            console.log("[MODULE LOADER] Successfully loaded " + preparedModule.code)
        }
    }
}

module.exports = ModuleLoaderSystem;