/*\
title: $:/core/modules/widgets/action-socketSend.js
type: application/javascript
module-type: widget

Action widget to send info via Socket.io

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var SocketWidget = function(parseTreeNode,options) {
    this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
SocketWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
SocketWidget.prototype.render = function(parent,nextSibling) {
    this.computeAttributes();
    this.execute();
};

/*
Compute the internal state of the widget
*/
SocketWidget.prototype.execute = function() {
    this.actionTo = this.getAttribute("$val");
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
SocketWidget.prototype.refresh = function(changedTiddlers) {
    var changedAttributes = this.computeAttributes();
    if(changedAttributes["$val"]) {
	this.refreshSelf();
	return true;
    }
    return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
SocketWidget.prototype.invokeAction = function(triggeringWidget,event) {

    // *** Make an oblect message and send it to the Server

    var msg = {
	val: this.getAttribute("$val")
    };
    
    socket.emit('sound name', msg);

    return true; // Action was invoked
};
    
    exports["action-socketSend"] = SocketWidget;

})();
