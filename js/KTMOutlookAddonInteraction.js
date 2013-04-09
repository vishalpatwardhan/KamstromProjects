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
/// <reference path="KTMTaskInteraction.js" />
/// <reference path="KTMPhrases.js" />
"use strict"

//**********************************************************
// Window onLoad 
//**********************************************************
$(function () {
    if (kErrorMode === true) { return false };
    try {
        WindowOnload();
    } catch (e) { kGlobalErrorHandler(e, "window onLoad"); }
});

function WindowOnload() {
    if (kErrorMode === true) { return false };
    try {
        kApplication.version = "1.1";
        kApplication.name = "Kanban Task Manager for Outlook";
        kDebugMode = false;
        kStartTimer("window onload");
        SetCaptions();
        kEndTimer("window onload");
    }
    catch (e) { kGlobalErrorHandler(e, "WindowOnload"); }
}





function TaskFromJson(objJson,TaskLength) {
    //Read task values from json node
    if (kErrorMode === true) { return false };
    var intCounter = 0, CurrTask = new KTMTask();
    try {
        CurrTask.ID = objJson.TaskId;

        CurrTask.Subject = objJson.Task_Name;
        CurrTask.TaskBody = objJson.Task_Body;

        CurrTask.Project = GetObjectByID(objJson.ProjectID, KTMSettings.Projects);
        CurrTask.Responsible = GetObjectByID(objJson.ResponsibleID, KTMSettings.Responsibles);
        if (KTMSettings.ColorAssociation === "Project") {
            CurrTask.TaskColor = CurrTask.Project.Color;
        } else {
            CurrTask.TaskColor = CurrTask.Responsible.Color;
        }
        CurrTask.Completed = objJson.completed != 0;
        CurrTask.CompletedDate.setTime(parseInt(objJson.DateCompleted.substr(6, objJson.DateCompleted.length - 8)));
        CurrTask.Phase = GetObjectByID(objJson.PhaseId, KTMSettings.Phases);
        createTaskDiv(CurrTask,TaskLength);
        return CurrTask;
    }
    catch (e) { kGlobalErrorHandler(e, "AddJsonTask",  "KTMSettings.ColorAssociation =" + KTMSettings.ColorAssociation +"\nReading json: " + JSON.stringify(objJson)) ; }
}

function ReadJsonTasks(jsonTasks) {
    if (kErrorMode === true) { return false };
    var intCounter = 0, CurrJson = {}, optMaxSelect = {}, intMax = 15000,CurrTask = new KTMTask();
    try {
        
        if (kDebugMode === true) {
            optMaxSelect = $("#optMaxNumberTasks")[0];
            intMax = optMaxSelect.options[optMaxSelect.selectedIndex].value;
            if (intMax === "") {
                intMax = 100000;
            }
        }
		//intMax = 3;
        kStartTimer("CreatingObjectsFromJson");
		CreateTaskStructure(jsonTasks.length);
		DisplayTaskStructure();
        for (intCounter = 0; intCounter < jsonTasks.length; intCounter += 1) {
            if (intCounter < intMax) {
                CurrJson = jsonTasks[intCounter];
                if (CurrJson.IsDeleted!=true) {
                    CurrTask = TaskFromJson(CurrJson,jsonTasks.length);
                    //if (IsTaskToBeShown(CurrTask)===true) {
                        AddTaskToPhase(CurrTask);
                    //}
                }
            }
        }
        kEndTimer("CreatingObjectsFromJson");
        
        if (jsonTasks.lengt<400) {
            AddWords();
        }
        jsonTasks = {};
    } catch (e) { kGlobalErrorHandler(e, "ReadJsonTasks"); }
}

function ReadSettingsAndTasks() {
    if (kErrorMode === true) { return false };
   try {
        if (Phrases.length===0) {
            WindowOnload();
        }
        kDialog.StartLongTasks(LNGLOADINGSET(), ReadSettings);
	}
    catch (e) { kGlobalErrorHandler(e, "ReadSettingsAndTasks"); }
}


function ReadSettings() {
    if (kErrorMode === true) { return false };
    var strJson = "", txtXMLArea = {}, strMessage="";
    try {
        KTMSettings.Phases = [];
        KTMSettings.Responsibles = [];
        KTMSettings.Projects = [];
        $(".SubMain").html("");
        txtXMLArea = $("#txtSettings");
        if (txtXMLArea.length > 0) {
            
            strJson = txtXMLArea[0].value;
            if (strJson.length < 30) {
                kDialog.Expiration();
            } else {
                if (strJson.length>3) {
                   ReadJsonSettings(JSON.parse(strJson));
				   DisplaySettings();
                }
            }
           kDialog.StartLongTasks(LNGLOADINGSET(), onTasksReady, "Kanban Task Manager");
        }
    }
    catch (e) { kGlobalErrorHandler(e, "ReadSettings"); }
}


function onTasksReady() {
    if (kErrorMode === true) { return false };
    var jsonTasks = {}, txtJson = {};
    var strJson = "";
    try {
        kStartTimer("ReadTasksJson");
        txtJson = $("#txtTasks");
        if (txtJson.length > 0) {
            strJson = txtJson[0].value;
            kEndTimer("ReadTasksJson");
            if (strJson !== "") {
                kStartTimer("ParseTasksJson");
                jsonTasks = JSON.parse(strJson);
                kEndTimer("ParseTasksJson");
                ReadJsonTasks(jsonTasks);
				kDialog.StartLongTasks(LNGPLEASEWAITSYNCHRONIZINGALLTASKS(), DisplayTasks,"Kanban Task Manager");
            } else {
                kDialog.HideDialog();
            }
        } else {
            kDialog.HideDialog();
        }
    }
    catch (e) { kGlobalErrorHandler(e, "onTasksReady"); }
	}

//**********************************************************
// read XMl with projects, responsibles and phases
//**********************************************************
function ReadJsonSettings(jsonObject) {
    if (kErrorMode === true) { return false };
    var CurrNodesColl = {}, CurrNode = {}, intCounter = 0, xml="";
    try {

        // for read project name from json 
        KTMSettings.ColorAssociation = jsonObject.objDicRegistration.ColorAssociation;
        for (intCounter = 0; intCounter < jsonObject.objProjectProp.length; intCounter += 1) {
            CurrNode = jsonObject.objProjectProp[intCounter];
            AddJsonProject(CurrNode, KTMSettings.ColorAssociation === "Project");
        }
        // for read responsible name from json    
        for (intCounter = 0; intCounter < jsonObject.objResponsibleProp.length; intCounter += 1) {
            CurrNode = jsonObject.objResponsibleProp[intCounter];
            AddJsonResponsible(CurrNode, KTMSettings.ColorAssociation === "Responsible");
        }
        // for read phase name from XML        
        for (intCounter = 0; intCounter < jsonObject.objPhaseProp.length ; intCounter += 1) {
            CurrNode = jsonObject.objPhaseProp[intCounter];
            AddJsonPhase(CurrNode,jsonObject.objPhaseProp.length);
        }
    } catch (e) { kGlobalErrorHandler(e, "ReadXML"); }
}


//*********************************************
//Reading xml nodes into javascript object
//*********************************************
function AddJsonProject(Node,ReadColor) {
    if (kErrorMode === true) { return false };
    var CurrProject = new KTMProject();
    try {
        CurrProject.ID = Node.ProjectId;
        CurrProject.Name = Node.ProjectName;
        if (ReadColor===true) {
            CurrProject.Color = Node.ColorCode;
        }
        KTMSettings.Projects.push(CurrProject);
    } catch (e) { kGlobalErrorHandler(e, "AddJsonProject"); }
}

function AddJsonResponsible(Node,ReadColor) {
    if (kErrorMode === true) { return false };
    var CurrResponsible = new KTMResponsible();
    try {
        CurrResponsible.ID = Node.ResponsibleId;
        CurrResponsible.Name = Node.ResponsibleName;
        if (ReadColor === true) {
            CurrResponsible.Color = Node.ColorCode;
        }
        KTMSettings.Responsibles.push(CurrResponsible);
    } catch (e) { kGlobalErrorHandler(e, "AddJsonResponsible"); }
}
function AddJsonPhase(Node,MaxPhaseLength) {
    if (kErrorMode === true) { return false };
    var CurrPhase = new KTMPhase();
    try {
        CurrPhase.ID =Node.PhaseID;
        CurrPhase.Name = Node.PhaseCaption;

        CreateDivPhase(CurrPhase,MaxPhaseLength);
        KTMSettings.Phases.push(CurrPhase);
    } catch (e) { kGlobalErrorHandler(e, "AddJsonPhase"); }
}

function inCommandChange() {
    var ChangeObject = new KTMChange(), strJson = "", ChangedTasks = [], CurrTaskJson = {}, intCurrID = 0,CurrTask = new KTMTask(), blnNewItems = false;
    if (kErrorMode === true) { return false };
    try {
        strJson = $("#txtInCommands").val();
        ChangedTasks = JSON.parse(strJson);
        for (var i = 0; i < ChangedTasks.length; i++) {
            CurrTaskJson = ChangedTasks[i];
            intCurrID = CurrTaskJson.TaskId;
            CurrTask = GetTaskByID(intCurrID);
            if (CurrTask === undefined) {
                //A new task, not previously in Outlook
                if (CurrTaskJson.IsDeleted!=true) {
                    CurrTask = TaskFromJson(CurrTaskJson);

                    $("#" + CurrTask.Phase.HTMLID).append(CurrTask.HtmlTask); //Add to DOM
                    blnNewItems = true;
                    CurrTask.Phase.Tasks.push(CurrTask);
                    KTMSettings.UsedWords.sort();
                    $("#txtSearch").autocomplete({ source: KTMSettings.UsedWords });
                }
            } else {
                RemoveTaskFromPhase(CurrTask.Phase.ID, CurrTask.ID); //Remove old values
                CurrTask = TaskFromJson(CurrTaskJson);
                $("#" + CurrTask.HTMLID).remove();
                if (CurrTaskJson.IsDeleted != true) {
                    //Update in memory object
                    AddTaskToPhase(CurrTask); //Save new values
                    $("#" + CurrTask.Phase.HTMLID).append(CurrTask.HtmlTask); //Update values in DOM
                } 
            }
        }
        SetColumnsToMaxHeights();
        //re-attach the event handlers
        AttachTaskEvents();
    }catch (e) { kGlobalErrorHandler(e, "inCommandChange",strJson); }
}


function PostChange(NewChange) {
    if (kErrorMode === true) { return false };
    try {
        $("#txtOutCommands").val(JSON.stringify(NewChange));
    }
    catch (e) { kGlobalErrorHandler(e, "PostChange"); }
}
