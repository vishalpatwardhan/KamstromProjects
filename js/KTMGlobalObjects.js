/*!
 * Copyright 2012, Kalmstrom Enterprises AB
* http://www.kalmstrom.com/
 *
 */

/// <reference path="lib/jquery-1.8.0.min.js" />
/// <reference path="lib/jquery-ui-1.8.23.custom.min.js" />
/// <reference path="lib/kalmstromshared.js" />
/// <reference path="lib/redips-drag-min.js" />
/// <reference path="dynamic.js" />
/// <reference path="KTM.js" />
/// <reference path="KTMTaskInteraction.js" />
/// <reference path="KTMSearch.js" />

"use strict";


var KTMSettings = {
    Projects: [],
    Responsibles: [],
    Phases: [],
    UsedWords: [],
    ColorAssociation :""
}

//**********************************************************
//These function are meant to be used as classes
//**********************************************************
function KTMProject(ID, Name,Color) {
    var MyObj = new Object();
    MyObj.ID = ID;
    MyObj.Name = Name;
    MyObj.Color = Color;
    return MyObj;
}
function KTMResponsible(ID, Name,Color) {
    var MyObj = new Object();
    MyObj.ID = ID;
    MyObj.Name = Name;
    MyObj.Color = Color;
    return MyObj;
}
function KTMPhase(ID, Name, HtmlPhase, SequenceID, Tasks, HTMLID) {
    var MyObj = new Object();
    MyObj.ID = ID;
    MyObj.Name = Name;
    MyObj.HtmlPhase = HtmlPhase;
    MyObj.HTMLID = HTMLID;
    MyObj.Tasks = [];
    return MyObj;
}
function KTMTask(ID, Phase, Subject, TaskBody, Project, Responsible, TaskColor, HtmlTask, HTMLID, ProjectID,Completed,CompletedDate) {
    var MyObj = new Object();
    MyObj.ID = ID;
    MyObj.Subject = Subject;
    MyObj.TaskBody = TaskBody;

    MyObj.Project = new KTMProject();
    MyObj.Responsible = new KTMResponsible();
    MyObj.Phase = new KTMPhase();

    MyObj.TaskColor = TaskColor;
    MyObj.HtmlTask = HtmlTask;
    MyObj.HTMLID = HTMLID;
    MyObj.Completed = false;
    MyObj.CompletedDate = new Date();
    return MyObj;
}
function KTMChange(ChangeType, ID, ChangeDetails) {
    var MyObj = new Object();
    MyObj.ChangeType = ChangeType;
    MyObj.ID = ID;
    MyObj.ChangeDetails = ChangeDetails;
    return MyObj;
}
//**********************************************************



//*********************************************


//*********************************************
//Finding object functions
//*********************************************
function GetObjectByName(ObjectName, ObjectArray) {
    if (kErrorMode === true) { return false };
    var CurrObject = {};
    try {
        for (var i = 0; i < ObjectArray.length; i++) {
            CurrObject = ObjectArray[i];
            if (CurrObject.Name === ObjectName) {
                return CurrObject;
                break;
            }
        }
    }
    catch (e) { kGlobalErrorHandler(e, "GetProjectByName"); }
}
function GetObjectByID(ObjectID, ObjectArray) {
    if (kErrorMode === true) { return false };
    var CurrObject = {};
    try {
        for (var i = 0; i < ObjectArray.length; i++) {
            CurrObject = ObjectArray[i];
            if (CurrObject.ID == ObjectID) {
                return CurrObject;
                break;
            }
        }
    }
    catch (e) { kGlobalErrorHandler(e, "GetObjectByID"); }
}



function GetTaskByID(TaskID) {
    if (kErrorMode === true) { return false };
    var CurrTask = new KTMTask(), CurrPhase = new KTMPhase(), intCounter = 0;
    try {
        for (var i = 0; i < KTMSettings.Phases.length; i++) {
            CurrPhase = KTMSettings.Phases[i];
            for (intCounter = 0; intCounter < CurrPhase.Tasks.length; intCounter += 1) {
                CurrTask = CurrPhase.Tasks[intCounter];
                if (CurrTask.ID == TaskID) {
                    return CurrTask;
                    break;
                }
            }
        }
        //window.alert("Unable to find task with ID:" + TaskID);
    }
    catch (e) { kGlobalErrorHandler(e, "GetTaskByID"); }
}
//*********************************************

function AddTaskToPhase(CurrTask) {
    if (kErrorMode === true) { return false };
    try{
        if (CurrTask.Phase !== undefined && CurrTask.Responsible !== undefined && CurrTask.Project !== undefined) {
            CurrTask.Phase.Tasks.push(CurrTask);
        } else {
            // window.alert("Task " + CurrTask.ID + " has the wrong properties");
        }
    }
    catch (e) { kGlobalErrorHandler(e, "AddTaskToPhase"); }
}

function RemoveTaskFromPhase(PhaseID, TaskID) {
    if (kErrorMode === true) { return false };
    var CurrPhase = new KTMPhase, CurrTask = new KTMTask(), intCounter = 0;
    try {
        for (var i = 0; i < KTMSettings.Phases.length; i++) {
            CurrPhase = KTMSettings.Phases[i];
            if (CurrPhase.ID == PhaseID) {
                for (intCounter = 0; intCounter < CurrPhase.Tasks.length; intCounter += 1) {
                    CurrTask = CurrPhase.Tasks[intCounter];
                    if (CurrTask.ID == TaskID) {
                        CurrPhase.Tasks.splice(intCounter, 1);
                        return true;
                    }
                }

            }
        }
    }
    catch (e) { kGlobalErrorHandler(e, "RemoveTaskFromPhase"); }
}


function SortObjectsByName(a, b) {
    if (a.Name < b.Name)
        return -1;
    if (a.Name > b.Name)
        return 1;
    return 0;
}
