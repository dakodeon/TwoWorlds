/*\
title: $:/core/modules/widgets/action-navigate2.js
type: application/javascript
module-type: widget

Modified version of action-navigate to create a new url and send it to piratebox

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;
    
var NavigateWidget2 = function(parseTreeNode,options) {
    this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
NavigateWidget2.prototype = new Widget();

/*
Render this widget into the DOM
*/
NavigateWidget2.prototype.render = function(parent,nextSibling) {
    this.computeAttributes();
    this.execute();
};

/*
Compute the internal state of the widget
*/
NavigateWidget2.prototype.execute = function() {
    this.actionTo = this.getAttribute("$id");
    this.actionPath = this.getAttribute("$path");
    // *** added the dimension attribute to size image according to orientation (portrait or landscape)
    this.actionDim = this.getAttribute("$dimension");
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
NavigateWidget2.prototype.refresh = function(changedTiddlers) {
    var changedAttributes = this.computeAttributes();
    if(changedAttributes["$id"] || changedAttributes["$path"] || changedAttributes["$dimension"]) {
	this.refreshSelf();
	return true;
    }
    return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
NavigateWidget2.prototype.invokeAction = function(triggeringWidget,event) {
    // *** if something happens: here were some stuff commented out from the original action-navigate.js file

    // *** location.search doesn't read the # symbol, so we replace it before we send the link. Piratebox does the reverse replacement in order to get the correct link
    var strhref = window.location.href.replace('#', '<<<');

    // *** beware -- change the IP to 192.168.77.1 in order to connect to the piratebox network
    window.location.href = "http://192.168.77.1:8686?id=" + this.getAttribute("$id") + "&addr=" + strhref + "&imgPath=" + this.getAttribute("$path") + "&dim=" + this.getAttribute("$dimension"); // this invokes a link

    return true; // Action was invoked
};
    
    exports["action-navigate2"] = NavigateWidget2;

})();
