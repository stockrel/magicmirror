Module.register("mail",{
    // Default module config.
    defaults: {
        text: "Hello World from mail module!"
    },

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.innerHTML = this.config.text;
        return wrapper;
    }
});