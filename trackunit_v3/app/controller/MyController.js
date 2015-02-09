/*
 * File: app/controller/MyController.js
 *
 * This file was generated by Sencha Architect version 3.1.0.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 4.2.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.2.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('MyApp.controller.MyController', {
    extend: 'Ext.app.Controller',

    onHeatClick: function(button, e, eOpts) {
        if (button.up("form").isValid() === false){
                    return false
                }
        var values = button.up("form").getValues();
        window.startAnalyzing('heatmap', null, values);
    },

    onAdminClick: function(button, e, eOpts) {
        if (button.up("form").isValid() === false){
                    return false
                }
        var values = button.up("form").getValues();
        window.startAnalyzing('group',values.border, values);
    },

    onClusterClick: function(button, e, eOpts) {
        if (button.up("form").isValid() === false){
                    return false
                }
        var values = button.up("form").getValues();
        window.startAnalyzing('cluster',values.border, values);
    },

    init: function(application) {
        this.control({
            "button#heatmap": {
                click: this.onHeatClick
            },
            "button#adminmap": {
                click: this.onAdminClick
            },
            "button#clustermap": {
                click: this.onClusterClick
            }
        });
    }

});