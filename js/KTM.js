/*!
 * Copyright Kalmstrom Enterprises AB
* http://www.kalmstrom.com/
 *
 */
/// <reference path="lib/jquery-1.8.0.min.js" />
/// <reference path="lib/jquery-ui-1.8.23.custom.min.js" />
/// <reference path="lib/kalmstromshared.js" />

/// <reference path="dynamic.js" />
/// <reference path="KTMTaskInteraction.js" />
/// <reference path="KTMGlobalObjects.js" />
/// <reference path="KTMSearch.js" />

//This file contains code that is from a sample found on the internet, which we have not re-written to kalmstrom.com standards yet.
"use strict";

function InitRedips()
{
	// set REDIPS.drag reference
	var objRedips = REDIPS.drag,strPhaseHTMLID = "",strTaskHTMLID = "",intAvailHeight = 0,intHeaderHeight = 122,intTaskHeight = 118,intMaxVerticalTask = 0,DestinationPhase = new KTMPhase();
	//call init method
	objRedips.init();
	REDIPS.drag.multipleDrop = 'top';
	intAvailHeight = (screen.availHeight) - intHeaderHeight - intTaskHeight;
	intMaxVerticalTask = parseInt((intAvailHeight)/(intTaskHeight),10);
	// when task object is dropped determine its HtmlId,Phase HtmlId where its 
	// being dropped & updates phase length accordingly
	objRedips.event.dropped = function () 
	{
		var nodeList = objRedips.obj.getElementsByClassName("portlet");
		var nodeArray = [];
		for (var i = 0; i < nodeList.length;i++) 
		{
			if (nodeList[i].id != null)
			{
				strTaskHTMLID = nodeList[i].id;
			}
		}  
		var arrayIds = objRedips.td.target.id.split("_");
		if	(arrayIds[1] > 6)
			{
				arrayIds[1] -= 6;
			}
		strPhaseHTMLID = "phaseDiv_" + arrayIds[1];
		TaskMoved(strTaskHTMLID, strPhaseHTMLID);
		DestinationPhase = GetObjectByID(strPhaseHTMLID.substring(9), KTMSettings.Phases);
		if (DestinationPhase.Tasks.length >= intMaxVerticalTask)
		{
			alert(strTaskHTMLID);
//			var PhaseLastTask = document.getElementById(DestinationPhase.Tasks[0].HTMLID);
//			PhaseFirstTask.parentNode.style.display = "inline-block";
			var parent = document.getElementById(strTaskHTMLID);
			parent.parentNode.style.display = "inline-block";
		}
		else
		{
			var parent = document.getElementById(strTaskHTMLID);
			parent.parentNode.style.display = "initial";
		}
	}
}

var Kanban = {
    settings: {
        columns: '.column',
        widgetSelector: '.portlet',
        handleSelector: '.portlet-header',
        contentSelector: '.portlet-content',
        widgetPlaceholder: '.ui-sortable-placeholder',
        widgetDefault: {
            movable: false,
            removable: false,
            collapsible: false,
            editable: false,
            colorClasses: ['color-yellow', 'color-red', 'color-blue', 'color-purple', 'color-orange', 'color-green']
        },
        widgetIndividual: {
            intro: {
                movable: false,
                removable: false,
                collapsible: false,
                editable: false
            }
        }
    },

    // function for drag, drop, sort the task start
    makeSortable: function (TaskToMakeSortable) {
        try {
            kStartTimer("makeSortable");
            var settings = this.settings;
            $(settings.columns).sortable({
                connectWith: settings.columns,
                handle: settings.handleSelector,
                placeholder: 'ui-sortable-placeholder',
                cursor: 'move',
                revert: true,
                forcePlaceholderSize: true,
                delay: 10,
                opacity: 0.8,
                start: function (event, ui) {
                    $(settings.Placeholder).css("background-color", "#ff0000");
                    MakeEditButtonsHidden(ui.item[0].id);
                },
                stop: function (event, ui) {
                },
                update: function (event, ui) {
                    if (ui.sender) {
                        TaskMoved(ui.item[0].id, this.id);
                    }
                }
            });
            kEndTimer("makeSortable");
        }
        catch (e) { kGlobalErrorHandler(e, "makeSortable"); }
    }
    // function for drag, drop, sort the task end

}


