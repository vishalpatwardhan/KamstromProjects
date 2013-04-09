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
/// <reference path="KTMTaskInteraction.js" />
/// <reference path="KTMGlobalObjects.js" />
/// <reference path="KTMSearch.js" />

//Searching functionality
"use strict";

//onload event - clearing the search textbox
$(function () {
    if (kErrorMode === true) { return false };
    try {
        $("#txtSearch").val("");
    } catch (e) { kGlobalErrorHandler(e, "window onLoad"); }
});

function AttachSearchEvents() {
    if (kErrorMode === true) { return false };
    try {
        kStartTimer("AttachSearchEvents");
        $("#optProject").change(onDropdownSelectionChange);
        $("#optResponsible").change(onDropdownSelectionChange);
        $("#cmdSearch").click(ClickSearch);
        $("#txtSearch").keypress(EnterSearchBox);

        kEndTimer("AttachSearchEvents");
    }
    catch (e) {
        kGlobalErrorHandler(e, "AttachSearchEvents");
    }
};

function AddWords() {
    if (kErrorMode === true) { return false };
    var strAllText = "", intPhaseCounter =0,intTaskCounter=0, currTask = new KTMTask(), currPhase = new KTMPhase();
    try {
        kStartTimer("AddingUsedWords");
        for (intPhaseCounter = 0; intPhaseCounter < KTMSettings.Phases.length; intPhaseCounter += 1) {
            currPhase = KTMSettings.Phases[intPhaseCounter];
            for (intTaskCounter = 0; intTaskCounter < currPhase.Tasks.length;intTaskCounter+= 1) {
                currTask = currPhase.Tasks[intTaskCounter];
                AddWordsFromTask(currTask);
            }
        }
        KTMSettings.UsedWords.sort();
        $("#txtSearch").autocomplete({ source: KTMSettings.UsedWords });
        kEndTimer("AddingUsedWords");
    }
    catch (e) { kGlobalErrorHandler(e, "AddWords"); }
}

function EnterSearchBox(event) {
    if (kErrorMode === true) { return false };
    try {
        if (event.which == 13) {
            event.preventDefault();
            ClickSearch();
        }
    }
    catch (e) { kGlobalErrorHandler(e, "EnterSearchBox"); }
}
function ClickSearch() {
    if (kErrorMode === true) { return false };
    var strSearch = "", strSelector = "", cmdSearch = {}, strOptionsSelector = "";;
    try {
        cmdSearch = $("#cmdSearch");
        cmdSearch.attr("src", "css/img/ClearSearch.png");
        cmdSearch.unbind('click');
        cmdSearch.click(ClearSearch);
        SetCurrentFilter();
    }
    catch (e) { kGlobalErrorHandler(e, "ClickSearch"); }
}
function ClearSearch() {
    if (kErrorMode === true) { return false };
    var cmdSearch = {};
    try {
        cmdSearch = $("#cmdSearch");
        cmdSearch.attr("src", "css/img/search.png");
        cmdSearch.unbind('click');
        cmdSearch.click(ClickSearch);
        $("#txtSearch").val("");
        SetCurrentFilter();
    }
    catch (e) { kGlobalErrorHandler(e, "ClearSearch"); }
}

function SetCurrentFilter() {
    if (kErrorMode === true) { return false };
    var strCurrSelector = "";
    try {
        strCurrSelector = GetCurrentFilter();
        if (strCurrSelector==="") {
            $(".portlet").show();
        } else {
            $(".portlet").hide();
            $(strCurrSelector).show();
        }
        SetColumnsToMaxHeights();
    }
    catch (e) { kGlobalErrorHandler(e, "SetCurrentFilter"); }
}

function GetCurrentFilter() {
    var strCurrSelector = ""
    if (kErrorMode === true) { return false };
    try {
        strCurrSelector = GetSearchSelector();
        strCurrSelector += GetCurrentDropdownSelector();
        if (strCurrSelector.substring(strCurrSelector.length - 1, strCurrSelector.length)===".") {
            strCurrSelector = strCurrSelector.substring(0, strCurrSelector.length - 1);
        }
        return strCurrSelector;
    }
    catch (e) { kGlobalErrorHandler(e, "GetCurrentFilter"); }
}

function onDropdownSelectionChange() {
    var strCSSSelector = "";
    if (kErrorMode === true) { return false };
    try {
        kStartTimer("onDropdownSelectionChange");
        SetCurrentFilter();
        kEndTimer("onDropdownSelectionChange");
    }
    catch (e) {
        kGlobalErrorHandler(e, "onOptProjectChange");
    }
};

function GetCurrentDropdownSelector() {
    if (kErrorMode === true) { return false };
    var CurrProject = new KTMProject(), CurrResponsible = new KTMResponsible(), strCSSSelector = "",strOutFilter="", intSelectedIndex=0;
    try {
        intSelectedIndex = $("#optProject")[0].selectedIndex;
        if (intSelectedIndex>0) {
            CurrProject = KTMSettings.Projects[ intSelectedIndex -1];
            strCSSSelector = ".p" + CurrProject.ID;
            strOutFilter = strCSSSelector;
        } else {
            strOutFilter = ".p0";
        }

        intSelectedIndex = $("#optResponsible")[0].selectedIndex;
        if (intSelectedIndex>0) {
            CurrResponsible = KTMSettings.Responsibles[intSelectedIndex - 1];
            strCSSSelector += ".r" + CurrResponsible.ID;
            strOutFilter += ".r" + CurrResponsible.ID;

        }else {
            strOutFilter += "r0";
        }
        $("#txtCurrFilter").val(strOutFilter);
        return strCSSSelector;
    }
    catch (e) { kGlobalErrorHandler(e, "GetCurrentDropdownSelector"); }
}

function CurrentlyVisibleTasks(CurrPhase) {
    if (kErrorMode === true) { return false };
    var strFilter = "";
    try {
        strFilter = GetCurrentFilter();
        if (strFilter==="") {
            return CurrPhase.Tasks.length;
        } else {
            strFilter = "#" + CurrPhase.HTMLID + " " + strFilter;
            return $(strFilter).length;
        }
    }
    catch (e) { kGlobalErrorHandler(e, "CurrentlyVisibleTasks"); }
}

function GetSearchSelector() {
    if (kErrorMode === true) { return false };
    var strSearchSelector = "";
    try{
        strSearchSelector = $("#txtSearch").val();
        if (strSearchSelector!=="") {
            strSearchSelector = strSearchSelector.toUpperCase();
            strSearchSelector = "div[data-search*='" + strSearchSelector + "']";
        }
        return strSearchSelector;
    }
        catch (e) { kGlobalErrorHandler(e, "GetSearchSelector"); }
}

function AddValuesToDropDown(DropdownName, ObjectArray) {
    if (kErrorMode === true) { return false };
    var CurrObject = {}, strHTML = "", cmbDropdown = {};
    try {
        cmbDropdown = $("#" + DropdownName);
        strHTML = "<option>" + LNGALL() + "</option>'";
        cmbDropdown.append(strHTML);
        for (var i = 0; i < ObjectArray.length; i++) {
            CurrObject = ObjectArray[i];
            strHTML = "<option value = '" + CurrObject.ID + "'>" + CurrObject.Name + "</option>'";
            cmbDropdown.append(strHTML);
        }
    }
    catch (e) { kGlobalErrorHandler(e, "AddValuesToDropDown"); }
}


function AddWordsFromTask(CurrTask) {
    var Words = [], strWord = "", strAllText = "";
    if (kErrorMode === true) { return false };
    try {
        strAllText = CurrTask.Subject + " " + CurrTask.TaskBody;
        strAllText = strAllText.replace("\n", " ");
        Words = strAllText.split(' ');
        for (var i = 0; i < Words.length; i++) {
           strWord = Words[i].toLowerCase();
            if ($.inArray(strWord, KTMSettings.UsedWords)===-1) {
                KTMSettings.UsedWords.push(strWord);
            }
        }

    } catch (e) { kGlobalErrorHandler(e, "AddWordsFromTask"); }
}

function IsTaskToBeShown(CurrTask) {
    var dateNow = new Date();
    if (kErrorMode === true) { return false };
    try {
        if (CurrTask.Completed === true) {
            dateNow.setTime(Date.now());
            if ((dateNow.getTime() - CurrTask.CompletedDate.getTime()) > 2 * 86400000) {
                return false; //Current tasks is older than 48 hours and shouldn't be shown.
            }else {
                return true; //Recently closed - show
            }
        } else {
            return true; //Still open - show
        }
    } catch (e) { kGlobalErrorHandler(e, "IsTaskToBeShown"); }
}