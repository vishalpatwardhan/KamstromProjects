/*!
 * Copyright Kalmstrom Enterprises AB
* http://www.kalmstrom.com/
 *
 */
"use strict"
//Version 2.5 - last edited by Peter Kalmström 2012-09-18 - used in Multilang, DT, KTM, Swedish grammar
//Relias on JQuery 1.8 and Jquery UI 1.8.23
//*****************
//Errror handling
//*****************
var kErrorMode = false, kDebugMode = true, kUserEmail = "";
var kApplication = {
    version:0,
    name: ""
}
function kGlobalErrorHandler(e, strFunction, AdditionalMessage) {
    var strMessage = "ERROR:\n", strQuestion = "";
    if (kApplication.version > 0) {
        strMessage += kApplication.name + "v: " + kApplication.version + "\n";
    }
    strMessage += "**************\n";
    strMessage += "Function: " + strFunction + "\n";
    if (e.lineNo != undefined) {
        strMessage += "Line: " + e.lineNo + "\n";
    }
    if (e.name != undefined) {
        strMessage += "Name: " + e.name + "\n";
    }
    if (e.message != undefined) {
        strMessage += "Message: " + e.message + "\n";
    }
    if (e.stack != undefined) {
        strMessage += "Stack: \n" + e.stack.toString() + "\n";
    }
    if (AdditionalMessage != null && AdditionalMessage != undefined && AdditionalMessage != "") {
        strMessage += "Additional info: \n" + AdditionalMessage + "\n";

    } else {
        AdditionalMessage = "";
    }
    strMessage += "**************\n";
    strQuestion = LNGSENDTOKALMSTROM();

    kErrorMode = true;

    if (window.confirm(strMessage + "\n" + strQuestion)) {
        var ContactEmail = window.prompt(LNGEMAILPLEASE(), kUserEmail);
        if (ContactEmail != "") {
            var DataToReport = {
                strProductName: "Javascript error in " + window.location.href,
                strFunction: strFunction,
                strErrorFileName: window.location.href,
                ErrorNu: 0,
                strErrorDescription: strMessage,
                strComments: "",
                strClientName: "",
                strClientEmailId: ContactEmail,
                strOSVersion: window.navigator.userAgent,
                strOutlookVersion: ""
            }
            kReportError(DataToReport);
        }
    }
}

function kReportError(DataToSend) {

    try {
        var strErrorMessage = LNGUNABLETOSEND();
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "http://spmetacreator.biz/kalmstromServices.svc/ReportError",
            data: DataToSend,
            dataType: "jsonp",
            success: ErrorReturn,
            error: function (e) {
                window.alert(strErrorMessage);
            }
        });
    } catch (e) {
        window.alert(strErrorMessage);
    }
}

function ErrorReturn(data) {
    if (data != true) {
        window.alert(data);
    } else {
        window.alert(LNGTHANKSFORSENDING());
    }
}
//*****************
//Timing - used for measuring progress of a task
//*****************
var kTimers = [];

function kStartTimer(TimerName) {
    if (kDebugMode === false) { return true; }
    var blnNewTimer = true, MyTimer = {};
    for (var i = 0; i < kTimers.length; i++) {
        MyTimer = kTimers[i];
        if (MyTimer.TimerName === TimerName) {
            blnNewTimer = false;
            break
        }
    }
    if (blnNewTimer === true) {
        MyTimer = new Object();
    }

    MyTimer.StartTime = new Date().getTime();
    MyTimer.ElapsedTime = -1;
    if (blnNewTimer = true) {
        MyTimer.TimerName = TimerName;
        kTimers.push(MyTimer);
    }
}

function kEndTimer(TimerName) {
    if (kDebugMode === false) { return true; }
    var Timer = {};
    var CurrTime = new Date().getTime();
    for (var i = 0; i < kTimers.length; i++) {
        Timer = kTimers[i];
        if (Timer.TimerName === TimerName) {
            Timer.ElapsedTime = (CurrTime - Timer.StartTime);
        }
    }
}

function kEndAllTimers() {
    if (kDebugMode === false) { return true; }
    var Timer = {}, strMessage = "", intTotalMs = 0;
    for (var i = 0; i < kTimers.length; i++) {
        Timer = kTimers[i];
        if (Timer.ElapsedTime === -1) {
            kEndTimer(Timer.TimerName);
        }
        intTotalMs += parseInt(Timer.ElapsedTime);
        strMessage += Timer.TimerName + ": " + Timer.ElapsedTime + " ms\n";
    }
    strMessage += "*************\n";
    strMessage += "Total " + intTotalMs + " ms";
    window.alert(strMessage);
    kTimers = [];
}
//dialog code
var kDialog = {
    HideDialog: function () {
        if (kErrorMode === true) { return false };
        try {
            $("#divWorking").dialog("close");
        }
        catch (e) { kGlobalErrorHandler(e, "HideDialog"); }
    },

    StartLongTasks: function (ProgressTitle, CallBack) {
        if (kErrorMode === true) { return false };
        try {
            kDialog.ShowModalMessage(ProgressTitle);
            window.setTimeout(CallBack, 10);
        }
        catch (e) { kGlobalErrorHandler(e, "StartLongTasks"); }
    },
    Expiration: function () {
        if (kErrorMode === true) { return false };
        var strMessage = "";
        try {
            strMessage = LNGUNSUBSCRIBED();
            strMessage=strMessage.replace("[PRODUCT]", kApplication.name);
            kDialog.ShowModalMessage(strMessage);
            kDialog.HideProgressAnimation();
            kErrorMode = true;
        }
        catch (e) { kGlobalErrorHandler(e, "Expiration"); }
    },

    ShowModalMessage: function (Message) {
        if (kErrorMode === true) { return false };
        try {
            $("#divWorking").dialog({
                height: 140,
                modal: true,
                resizable: false,
                title: kApplication.name,
                //draggable: false,
                buttons:[],
            });
            $("#divWorkingCaption").text("");

            //insert hyperlinks if there are email addresses in the text
            Message = Message.replace(/([\w-]+@([\w-]+\.)+[\w-]+)/, '<a href="mailto:$1">$1</a>');
            $("#divWorkingCaption").append(Message);

            $(".ui-dialog-titlebar-close").hide();
        }
        catch (e) { kGlobalErrorHandler(e, "ShowModalMessage"); }
    },
    HideProgressAnimation: function () {
        if (kErrorMode === true) { return false };
        try {
            $("#imgProgress").hide();
        }
        catch (e) { kGlobalErrorHandler(e, "HideDialog"); }
    },
    ConfirmYesNo: function (ConfirmationText, CallBack, YesCaption, NoCaption, CurrentData) {
        if (kErrorMode === true) { return false };
        try {
            if (YesCaption === undefined||YesCaption ==="") {
                YesCaption = LNGYES();
            }
            if (NoCaption === undefined||NoCaption==="") {
                NoCaption = LNGNO();
            }
            $("#divWorkingCaption").text(ConfirmationText);
            kDialog.HideProgressAnimation();
            $("#divWorking").dialog({
                height: 140,
                modal: true,
                resizable: false,
                title: kApplication.name,
                //draggable: false,
                buttons: [{
                    text: YesCaption,
                    click: function () {
                        CallBack(true, CurrentData);
                    }
                }, {
                    text: NoCaption,
                    click: function () {
                        CallBack(false, CurrentData);
                    }
                }]
            });
        }
        catch (e) { kGlobalErrorHandler(e, "ConfirmYesNo"); }
    }
}
//Multi-language

function SetCaptions() {
    var TranslatableElements = {}, CurrElement = {}, strCurrCaption = "", strNewCaption = "";
    if (kErrorMode === true) { return false };
    try {
        kStartTimer("SetCaptions");
        LoadLocalPhrases();
        TranslatableElements = $(".translatable");
        for (var i = 0; i < TranslatableElements.length; i++) {
            CurrElement = TranslatableElements[i];
            strCurrCaption = $(CurrElement).text();
            strNewCaption = eval(strCurrCaption + "();");
            $(CurrElement).text(strNewCaption).show();
        }

        kEndTimer("SetCaptions");
    } catch (e) { kGlobalErrorHandler(e, "SetCaptions"); }
}


var Phrases = [];
function LoadLocalPhrases() {
    if (kErrorMode === true) { return false };
    try {
        var userLang = (navigator.language) ? navigator.language : navigator.userLanguage;
        userLang = userLang.substring(0, 2);
        //userLang = "ru";
        switch (userLang) {
            case "da":
                Phrases = DanishPhrases();
                break
            case "de":
                Phrases = GermanPhrases();
                break
            case "et":
                Phrases = EstonianPhrases();
                break
            case "fi":
                Phrases = FinnishPhrases();
            case "fr":
                Phrases = FrenchPhrases();
                break
            case "gr":
                Phrases = GreekPhrases();
                break
            case "nl":
                Phrases = DutchPhrases();
                break
            case "no":
                Phrases = NorwegianPhrases();
                break
            case "ru":
                Phrases = RussianPhrases();
                break
            case "sv":
                Phrases = SwedishPhrases();
                break
            default:
                Phrases = EnglishPhrases();
                break
        }
    } catch (e) { kGlobalErrorHandler(e, "LoadLocalPhrases"); }
}


//Cookies

function createCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}