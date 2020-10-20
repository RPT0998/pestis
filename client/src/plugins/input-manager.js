/*global Phaser*/

(function(ns){
    function InputManager(scene, pluginManager){
        Phaser.Plugins.ScenePlugin.call(this, scene, pluginManager);

        this.controllers ={
            keyboard : candlegames.pestis.client.plugins.inputs.Keyboard,
            virtualjoystick: candlegames.pestis.client.plugins.inputs.VirtualJoystick
        }

        this.controller;
    }

    InputManager.prototype = Object.create(Phaser.Plugins.ScenePlugin.prototype);
    InputManager.prototype.constructor = InputManager;

    /**
     * Select the controller that will be used
     * @param controller
     */
    InputManager.prototype.selectController = function(controller){
        this.controller = new this.controllers[controller]();
        this.controller.init(this.scene);
    }

    ns.InputManager=InputManager;
})(candlegamestools.namespace('candlegames.pestis.client.plugins'));