/*!
 * Copyright Kalmstrom Enterprises AB
* http://www.kalmstrom.com/
 *
 */

/// <reference path="lib/jquery-1.8.0.min.js" />
/// <reference path="lib/jquery-ui-1.8.23.custom.min.js" />
/// <reference path="lib/kalmstromshared.js" />
/// <reference path="lib/redips-drag-min.js" />
/// <reference path="dynamic.js" />
/// <reference path="KTM.js" />
/// <reference path="KTMGlobalObjects.js" />
/// <reference path="KTMSearch.js" />

var SelectedTaskPortlet = {};

function onTaskRemoveClick() {
    var TaskID = "", strConfirmationMessage ="", CurrTask = new KTMTask();
    if (kErrorMode === true) { return false };
    try {

        TaskID = this.id.substring(3);
        CurrTask = GetTaskByID(TaskID);
        strConfirmationMessage = LNGMSGDELETETASKCONFIRMATION();
        strConfirmationMessage = strConfirmationMessage.replace("[SUBJECT]", TruncateCaption(CurrTask.Subject, 27));
        kDialog.ConfirmYesNo(strConfirmationMessage, DeleteTask, "", "", TaskID);
        return false; //To cancel any event bubbling
    }
    catch (e) {
        kGlobalErrorHandler(e, "onTaskRemoveClick");
    }
};

function DeleteTask(Confirmed,TaskID) {
    var CurrTask = new KTMTask(), Change = new KTMChange();
    if (kErrorMode === true) { return false };
    try {
        $("#divWorking").dialog("close");
        if (Confirmed ===true) {
            CurrTask = GetTaskByID(TaskID);
            Change.ChangeType = "Remove";
            Change.ID = CurrTask.ID;
            PostChange(Change);
            $("#" + CurrTask.HTMLID).hide(200).remove();
            RemoveTaskFromPhase(CurrTask.Phase.ID, CurrTask.ID);
            SetColumnsToMaxHeights();
        }
    }
    catch (e) { kGlobalErrorHandler(e, "DeleteTask"); }
}

function onTaskDoubleClick() {
    var Change = new KTMChange();
    if (kErrorMode === true) { return false };
    try {
        Change.ChangeType = "Open";
        if (this.id===null||this.id===undefined) {
            Change.ID = SelectedTaskPortlet[0].id.substring(8);
        } else {
            Change.ID = this.id.substring(8);
        }
        PostChange(Change);
        return false;
    }
    catch (e) {
        kGlobalErrorHandler(e, "onTaskDoubleClick");
    }
};
function PhaseDoubleClick() {
    var Change = new KTMChange(), strDropdownsSelected="";
    if (kErrorMode === true) { return false };

    try {
        //Once a user double-clicks in an empty area within a phase, this json will be posted
        //{"ChangeType":"New","ID":"12","ChangeDetails":".p15.r3"}
        //ID is of course the ID of the phase
        //p15 - means project id 15
        //r3 means responsible 3
        //the changedetails can contain:
        //"" - none of the dropdowns are currently selected
        //".pX" - only the project is selected - showing all responsibles
        //".rX" - only the responsible is selected - all projects are shown
        //or as above - when both a single project and a single responsible is selected
        strDropdownsSelected = GetCurrentDropdownSelector();
        Change.ChangeType = "New";
        Change.ID = this.id.substring(9);
        Change.ChangeDetails = strDropdownsSelected;
        PostChange(Change);
        return false;
    }
    catch (e) {
        kGlobalErrorHandler(e, "PhaseDoubleClick");
    }
};

function MakeEditButtonsHidden(TaskID) {
    //called on mouseout on the parent .portlet object
    if (kErrorMode === true) { return false };
    var strSelector = "";
    try {
        if (TaskID !== undefined && typeof (TaskID)==="string") {
            strSelector = TaskID;
        } else {
            strSelector = this.id;
        }
        $("#" + strSelector + " .edit").hide();
        $("#" + strSelector + " .remove").hide();
    }
    catch (e) { kGlobalErrorHandler(e, "MakeEditButtonsHidden"); }
}
function MakeEditButtonsVisible() {
    //called on mouseenter on the parent .portlet object
    if (kErrorMode === true) { return false };
    var strSelector = "";
    try {
        strSelector = this.id;
        $("#" + strSelector + " .edit").show();
        $("#" + strSelector + " .remove").show();
    }
    catch (e) { kGlobalErrorHandler(e, "MakeEditButtonsVisible"); }
}

function AttachTaskEvents() {
    var Portlets = {};
    if (kErrorMode === true) { return false };
    try {
        Portlets = $(".portlet");
        Portlets.unbind("dblclick mouseenter mouseleave click");
        $(".remove").unbind("click");
        $(".edit").unbind("click");
        if (Portlets.length > 0) {
            Portlets.dblclick(onTaskDoubleClick).hover(MakeEditButtonsVisible, MakeEditButtonsHidden);
            $(".remove").click(onTaskRemoveClick);
            $(".edit").click(onTaskDoubleClick);
            Portlets.contextmenu(TaskRightClick);
            $(document).contextmenu(TaskRightClick);
            //$(document).keydown(TaskKeyPress);
            Portlets.click(TaskSelect);
            SetSelection($("#"+Portlets[0].id));
        }
    }
    catch (e) { kGlobalErrorHandler(e, "AttachTaskEvents"); }
}
function TaskKeyPress(event) {
    var blnNavigationKey = false, kbNavigationDest = {}, intScrollX = 0, intScrollY = 0;
    if (kErrorMode === true) { return false };
    try {
        var key = event.keyCode || event.which;
        if (event.target.type === 'text') {
            return true;
        }
        switch (key) {
            case 40:
                //Down
                kbNavigationDest = SelectedTaskPortlet.next();
                blnNavigationKey = true;
                intScrollY = 120;
                break;
            case 38:
                //Up
                kbNavigationDest = SelectedTaskPortlet.prev();
                blnNavigationKey = true;
                intScrollY = -120;
                break;
            case 37:
                //left
                kbNavigationDest = GetHorizontalNavigationTask(true);
                blnNavigationKey = true;
                intScrollX = -240;
                break;
            case 39:
                //right
                kbNavigationDest = GetHorizontalNavigationTask(false);
                blnNavigationKey = true;
                intScrollX = 240;
                break;
            case 13:
                onTaskDoubleClick();
                break;
            default:
                window.alert(key);
        }
        if (kbNavigationDest===null|kbNavigationDest===undefined) {
            return true;
        }
        if (blnNavigationKey === true && kbNavigationDest.hasClass("portlet")) {
            SetSelection(kbNavigationDest);
            window.scrollBy(intScrollX, intScrollY);
            return false;
        }
    } catch (e) { kGlobalErrorHandler(e, "TaskKeyPress"); }
}


function SetSelection(NewSelection) {
    if (kErrorMode === true) { return false };
    try {
        SelectedTaskPortlet = NewSelection;
        $(".portlet.selectedTask").removeClass("selectedTask");
        SelectedTaskPortlet.addClass("selectedTask");
    } catch (e) { kGlobalErrorHandler(e, "SetSelection"); }
}


function GetHorizontalNavigationTask(blnLeft) {
    var intSequenceNumber = 0, DestinationPhase = {}, CurrPortlet = {};
    if (kErrorMode === true) { return false };
    try {
        for (var i = 0; i < SelectedTaskPortlet.parent()[0].childNodes.length; i++) {
            CurrPortlet = SelectedTaskPortlet.parent()[0].childNodes[i];
            if (CurrPortlet.id === SelectedTaskPortlet[0].id) {
                intSequenceNumber = i;
                break;
            }
        }
        if (blnLeft ===true) {
            DestinationPhase=SelectedTaskPortlet.parent().prev();
        } else {
            DestinationPhase = SelectedTaskPortlet.parent().next();
        }
        if (DestinationPhase===null||DestinationPhase===undefined) {
            return null;
        }
        if (DestinationPhase.hasClass("column")) {
            if (DestinationPhase[0].childNodes.length <= intSequenceNumber) {
                intSequenceNumber = DestinationPhase[0].childNodes.length-1;
            }
            return $("#" + DestinationPhase[0].childNodes[intSequenceNumber].id);
        }

    } catch (e) { kGlobalErrorHandler(e, "GetHorizontalNavigationTask"); }
}

function TaskSelect(e) {
    if (kErrorMode === true) { return false };
    try {
        SelectedTaskPortlet = $(this);
        $(".portlet.selectedTask").removeClass("selectedTask");
        SelectedTaskPortlet.addClass("selectedTask");
        return false;
    } catch (e) { kGlobalErrorHandler(e, "TaskRightClick"); }
}

function TaskRightClick(e) {
    if (kErrorMode === true) { return false };
    try {
        return false;
         $("#footer").toggle(200);
        return false;
    } catch (e) { kGlobalErrorHandler(e, "TaskRightClick"); }
}

function TaskMoved(TaskHTMLID, PhaseHTMLID) {
    if (kErrorMode === true) { return false };
    var CurrTask = new KTMTask(), Change = new KTMChange(), DestinationPhase = new KTMPhase(), SourcePhase = new KTMPhase(), MovedTask = new KTMTask();
    try {
        CurrTask = GetTaskByID(TaskHTMLID.substring(8));
        if (CurrTask === undefined) {
            return false;
        }
        DestinationPhase = GetObjectByID(PhaseHTMLID.substring(9), KTMSettings.Phases);
        SourcePhase = CurrTask.Phase;

        MovedTask.ID = CurrTask.ID
        MovedTask.TaskColor = CurrTask.TaskColor;
        MovedTask.HTMLID = CurrTask.HTMLID;
        MovedTask.Responsible = CurrTask.Responsible;
        MovedTask.Project = CurrTask.Project;
        MovedTask.HtmlTask = CurrTask.HtmlTask;
        MovedTask.Subject = CurrTask.Subject;
        MovedTask.TaskBody = CurrTask.TaskBody;

        RemoveTaskFromPhase(SourcePhase.ID, CurrTask.ID);

        MovedTask.Phase = DestinationPhase;
        DestinationPhase.Tasks.push(MovedTask);


        Change.ChangeType = "PhaseChange";
        Change.ID = MovedTask.ID;
        Change.ChangeDetails = DestinationPhase.ID;
        PostChange(Change);
        SetColumnsToMaxHeights();
    }
    catch (e) { kGlobalErrorHandler(e, "TaskMoved"); }
}