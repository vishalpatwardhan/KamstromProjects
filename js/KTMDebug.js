/// <reference path="lib/jquery-1.8.0.min.js" />
/// <reference path="lib/jquery-ui-1.8.23.custom.min.js" />
/// <reference path="lib/kalmstromshared.js" />

/// <reference path="lib/redips-drag-min.js" />
/// <reference path="ktmoutlookaddoninteraction.js" />




$(function () {
    if (kErrorMode === true) { return false };
    try {
        $("#btnXml").click(onSettingsChanged);
        $("#btnJson").click(onTasksReady);
        $("#btnInCommand").click(inCommandChange);
        $("#cmdGetExampleData").click(GetExampleData);
        $("#cmdReadSettings").click(ReadSettingsAndTasks);
        $("#cmdNewTask").click(NewTaskClick);
        $("#cmdNewTask").click(NewTaskClick);
        $("#chkDebugMode").click(ToggleDebug);
        kDebugMode = true;
    } catch (e) { kGlobalErrorHandler(e, "window onLoad"); }
});


function onSettingsChanged() {
    if (kErrorMode === true) { return false };
    try {
        kDialog.StartLongTasks(LNGLOADINGSET(), ReadSettings, "Kanban Task Manager");
    }
    catch (e) { kGlobalErrorHandler(e, "onSettingsChanged"); }
}

function GetExampleData() {
    var strJsonPath = "";
    if (kErrorMode === true) { return false };
    try {
        kStartTimer("GetExampleSettings");
        $.getJSON("json/10000Settings.js", ExampleSettingsReceived);

        kStartTimer("GetExampleTasks");
        $.getJSON("json/10000Tasks.js", ExampleTasksReceived);
    }
    catch (e) { kGlobalErrorHandler(e, "GetExampleData"); }
}

function ExampleSettingsReceived(data) {
    if (kErrorMode === true) { return false };
    try {
        $("#txtSettings").val(JSON.stringify(data));
    }
    catch (e) { kGlobalErrorHandler(e, "ExampleSettingsReceived"); }
}

function ExampleTasksReceived(data) {
    if (kErrorMode === true) { return false };
    try {
        $("#txtTasks").val(JSON.stringify(data));
        kEndAllTimers();
        window.setTimeout(ReadSettingsAndTasks, 1000);
    }
    catch (e) { kGlobalErrorHandler(e, "ExampleTasksReceived"); }
}

function JsonFailure(e) {
    if (kErrorMode === true) { return false };
    try {
        window.alert(e.toString());
    }
    catch (e) { kGlobalErrorHandler(e, "JsonFailure"); }
}



function NewTaskClick() {
    if (kErrorMode === true) { return false };
    var newChange = new KTMChange();
    try {
        newChange.ChangeType = "Changes";
        newChange.ChangeDetails = "[{\"TaskId\":220,\"PhaseId\":3,\"Task_Name\":\"Deleting items from SP list 2\",\"Task_Body\":\"deleting items from SP list\u003cbr\u003e\u003cbr\u003e\u003cbr\u003edone for project, phase and responsible\u003cbr\u003eremaining for registration and task\",\"ProjectID\":18,\"ResponsibleID\":7,\"TaskColor\":5},{\"TaskId\":219,\"PhaseId\":3,\"Task_Name\":\"Deleting items from SP list\",\"Task_Body\":\"deleting items from SP list\u003cbr\u003e\u003cbr\u003e\u003cbr\u003edone for project, phase and responsible\u003cbr\u003eremaining for registration and task\",\"ProjectID\":18,\"ResponsibleID\":7,\"TaskColor\":5}]";
        $("#txtInCommands").val(JSON.stringify(newChange));
        inCommandChange();
    }
    catch (e) { kGlobalErrorHandler(e, "NewTaskClick"); }
}

function ToggleDebug() {
    if (kErrorMode === true) { return false };
    try {
        $(".debug").toggle();
    }
    catch (e) { kGlobalErrorHandler(e, "ToggleDebug"); }
}