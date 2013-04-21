/*!
 * Copyright Kalmstrom Enterprises AB
* http://www.kalmstrom.com/
 *
 */

/// <reference path="lib/jquery-1.8.0.min.js" />
/// <reference path="lib/jquery-ui-1.8.23.custom.min.js" />
/// <reference path="lib/kalmstromshared.js" />
/// <reference path="lib/redips-drag-min.js" />
/// <reference path="KTMGlobalObjects.js" />
/// <reference path="KTM.js" />
/// <reference path="KTMTaskInteraction.js" />
/// <reference path="KTMSearch.js" />
/// <reference path="KTMSPInteraction.js" />
"use strict";


//**********************************************************
// Global KTM setting for
// projects, responsible, phases and tasks
//**********************************************************

var intMaxPhaseWidth = 20;
var intMaxPhaseLength = 0;
var intResetTaskRow = 1;
var strTaskStructHtml = "";

function DisplayTasks() {
    if (kErrorMode === true) { return false };
    var intCounter = 0, CurrPhase = new KTMPhase, currTask = new KTMTask(), strWholeHTML = "",strDivHtml;
    try {
        kStartTimer("BuildTasksHTML");
			
        for (intCounter = 0; intCounter < KTMSettings.Phases.length; intCounter += 1) {
            CurrPhase = KTMSettings.Phases[intCounter];
            strWholeHTML = "";
			var TaskHtml = [ ],intTaskCounter = 0;
			for (var i = 0; i < CurrPhase.Tasks.length; i++) {
                currTask = CurrPhase.Tasks[i];
				TaskHtml[i] = currTask.HtmlTask;
				}
				var intEmptyPhasePos = CurrPhase.ID;
				for (var i = 0; i < TaskHtml.length; i++)
				{
					$('.phases').each(function(i){
						while(! $('#phase_' + intEmptyPhasePos).is(':empty') ) {
							intEmptyPhasePos += intMaxPhaseLength;
					}
					});
					$('#phase_' + intEmptyPhasePos).append(TaskHtml[i]);
				}
			}
		//strDivHtml = "<table>";
		//strDivHtml += $('#drag').html();
		//strDivHtml += "</table>";
		//$('#drag').html(strDivHtml);
        kEndTimer("BuildTasksHTML");
		InitRedips();
        AttachTaskEvents();
        SetColumnsToMaxHeights();
        kDialog.HideDialog();
        kEndAllTimers()
    } catch (e) { kGlobalErrorHandler(e, "DisplayTasks"); }
}

function SetColumnsToMaxHeights() {
    var strMaxHeight = "", CurrPhase = new KTMPhase(), intMaxHeight = 0, intCurrHeight = 0, intCounter = 0, PhaseCaption = "";
    if (kErrorMode === true) { return false };
    try {
        kStartTimer("SetColumnsToMaxHeights");

        for (intCounter = 0; intCounter < KTMSettings.Phases.length; intCounter += 1) {
            CurrPhase = KTMSettings.Phases[intCounter];
            intCurrHeight = CurrentlyVisibleTasks(CurrPhase);
            if (intCurrHeight > intMaxHeight) {
                intMaxHeight = intCurrHeight;
            }
            PhaseCaption = TruncateCaption(CurrPhase.Name, intMaxPhaseWidth) + " (" + intCurrHeight + ")";
            $("#" + CurrPhase.HTMLID + " .phase").text(PhaseCaption);
        }
        strMaxHeight = (intMaxHeight + 1) * 110 + "px";
        for (intCounter = 0; intCounter < KTMSettings.Phases.length; intCounter += 1) {
            CurrPhase = KTMSettings.Phases[intCounter];
            $("#" + CurrPhase.HTMLID).css("height", strMaxHeight);
        }
        kEndTimer("SetColumnsToMaxHeights");
    }
    catch (e) { kGlobalErrorHandler(e, "SetColumnsToMaxHeights"); }
}

function DisplayTaskStructure()
{
	kStartTimer("DisplayTaskStructure");
	$('#tbldrag').append(strTaskStructHtml);
	//$('#drag').append(strTaskStructHtml);
	kEndTimer("DisplayTaskStructure");
}

function DisplaySettings() {
    if (kErrorMode === true) { return false };
    var intCounter = 0, CurrProject = new KTMProject(), cmdDropdown = {}, strHTML = "", CurrResponsible = new KTMResponsible, CurrPhase = new KTMPhase(), strPhases = "";
    try {
        kStartTimer("DisplaySettings");
        KTMSettings.Projects.sort(SortObjectsByName);
        AddValuesToDropDown("optProject", KTMSettings.Projects);
        KTMSettings.Responsibles.sort(SortObjectsByName);
        AddValuesToDropDown("optResponsible", KTMSettings.Responsibles);
        //display divs of phases on KTM board        
        for (intCounter = 0; intCounter < KTMSettings.Phases.length; intCounter += 1) {
		CurrPhase = KTMSettings.Phases[intCounter];
        strPhases += CurrPhase.HtmlPhase;
        }
		$('#tbldrag').append(strPhases);
		//$('#drag').append(strPhases);
        setColumnsSize();
        $(".column").dblclick(PhaseDoubleClick);
        AttachSearchEvents();
        kEndTimer("DisplaySettings");
        kDialog.HideDialog();
    } catch (e) { kGlobalErrorHandler(e, "DisplaySettings"); }
}

function CreateDivPhase(objCurrPhase,MaxPhaseLength){
    if (kErrorMode === true) { return false };
    var strPhaseHTML = "", strID = "", myCurrPhase = new KTMPhase();
    try {
		myCurrPhase = objCurrPhase;
        intMaxPhaseLength = MaxPhaseLength;
		strID = "phaseDiv_" + myCurrPhase.ID;
        myCurrPhase.HTMLID = strID;
        if(myCurrPhase.ID==1)
		{
			strPhaseHTML += "<tr>";
		}
		strPhaseHTML += "<th class='mark'>";
		strPhaseHTML += "<div id='" + strID + "' class='column' unselectable=\"on\">";
        strPhaseHTML += "<div class='phase' unselectable=\"on\">" + TruncateCaption(myCurrPhase.Name, intMaxPhaseWidth) + "</div>";
        strPhaseHTML += "</div>";		
		strPhaseHTML += "</th>";
		if(myCurrPhase.ID==intMaxPhaseLength)
		{
			strPhaseHTML += "</tr>";
		}
		myCurrPhase.HtmlPhase = strPhaseHTML;
    } catch (e) { kGlobalErrorHandler(e, "CreateDivPhase"); }
}

function CreateTaskStructure(TaskLength)
{

	var intTaskCounter,intCounter = 1;
	kStartTimer("CreateStructure");
	for(intTaskCounter=1;intTaskCounter<=TaskLength;intTaskCounter++)
	{
			if (intResetTaskRow==1)
			{
				strTaskStructHtml += "<tr>";
			}
			strTaskStructHtml += "<td id = 'phase_" + intCounter + "' class = 'phases'></td>";
			if(intResetTaskRow==(intMaxPhaseLength))
			{	
				intResetTaskRow = 1;
				strTaskStructHtml += "</tr>";
			}
			else if(intTaskCounter==TaskLength)
			{
				if((intMaxPhaseLength) - intResetTaskRow > 0)
				{
					var intDiffCounter,intPhaseNumber = intResetTaskRow;
					for (intDiffCounter = 1;intDiffCounter <= ((intMaxPhaseLength)-intResetTaskRow);intDiffCounter++)
					{
						intPhaseNumber++;
						intCounter ++;
						
						strTaskStructHtml += "<td id = 'phase_" + intCounter + "' class = 'phases'>";
						strTaskStructHtml += "</td>";
					}
					intResetTaskRow = 1;
					strTaskStructHtml += "</tr>";
				}
			}
			else
			{
				intResetTaskRow++;
			}
			intCounter++;
	}
	kEndTimer("CreateStructure");
}

function createTaskDiv(objCurrTask) {
    if (kErrorMode === true) { return false };
    var strHtml = "", strSearchString = "", strCaptionStyle = "";
    try {

		objCurrTask.HTMLID = "taskDiv_" + objCurrTask.ID;
        if (objCurrTask.TaskColor != undefined) {
            strCaptionStyle = CaptionColorStyle(objCurrTask.TaskColor);
        } else {
            strCaptionStyle = "";
        }
		strHtml += "<div class='drag'>";
        strHtml += "<div class='portlet'"; 
        strHtml += "' id='" + objCurrTask.HTMLID + "'";
        if (strCaptionStyle != "") {
            strHtml += "style=\"background-color:rgb(" + objCurrTask.TaskColor + ");width:235px;\"";
        }
        strSearchString = ClearTroubleChars(objCurrTask.Subject + " " + objCurrTask.TaskBody);
        strSearchString = strSearchString.toUpperCase();
        strHtml += "data-search ='" + strSearchString + "'";
        strHtml += ">";
        strHtml += "<div class='portlet-header' unselectable=\"on\">";
        strHtml += "<h3 class='Task_title' unselectable=\"on\"" + strCaptionStyle + ">" + TruncateCaption(objCurrTask.Subject, 28) + "</h3>"
        strHtml += "<div class='pin' unselectable=\"on\"></div>";
        strHtml += "<div id='rem" + objCurrTask.ID + "' class='remove' unselectable=\"on\"></div>";
        strHtml += "<div id='edtTask_" + objCurrTask.ID + "' class='edit' unselectable=\"on\"></div>"
        strHtml+= "<div>";
		strHtml += "<div class='portlet-contents' unselectable=\"on\"" + strCaptionStyle + ">" + TruncateCaption(objCurrTask.TaskBody, 110) + "</div>";
        if (strCaptionStyle != "") {
            if (strCaptionStyle.substring(13, 18) === "white") {
                strHtml += "<div class='pr-row' unselectable=\"on\" style=\"border-top: 1px dashed white\">";
            } else {
                strHtml += "<div class='pr-row' unselectable=\"on\">";
            }
        } else {
            strHtml += "<div class='pr-row' unselectable=\"on\">";
        }
        if (objCurrTask.Project !== undefined) {
            strHtml += "<div class='p-title' unselectable=\"on\" " + strCaptionStyle + ">" + TruncateCaption(objCurrTask.Project.Name) + "</div>";
        }
        if (objCurrTask.Responsible !== undefined) {
            strHtml += "<div class='r-title' unselectable=\"on\" " + strCaptionStyle + ">" + TruncateCaption(objCurrTask.Responsible.Name) + "</div>";
        }

        strHtml += "</div></div></div>";
        strHtml += "</div>";
		strHtml += "</div>";
        objCurrTask.HtmlTask = strHtml;
    }
	catch (e) { kGlobalErrorHandler(e, "createTaskDiv"); }
}

function CaptionColorStyle(ColorCode) {
    var r = 0, g = 0, b = 0, Parts = [], strResult = "", strColor = "", yiq = 0;
    if (kErrorMode === true) { return false };
    try {
        Parts = ColorCode.split(',');
        r = parseInt(Parts[0]);
        g = parseInt(Parts[1]);
        b = parseInt(Parts[2]);
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        strResult = "style=\"color:";
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        strColor = (yiq >= 128) ? 'black' : 'white';
        strResult += strColor;
        strResult += "\"";
        return strResult;
    }
    catch (e) { kGlobalErrorHandler(e, "CaptionColorStyle"); }
}

function ClearTroubleChars(StringToClear) {
    if (kErrorMode === true) { return false };
    var NewString = "";
    try {

        var myRegExp = new RegExp("'", "g");

        NewString = StringToClear.replace(myRegExp, "");
        NewString = NewString.replace(/</g, "");
        NewString = NewString.replace(/>/g, "");
        NewString = NewString.replace(/<br\s*[\/]?>/gi, "");
        return NewString;
    }
    catch (e) { kGlobalErrorHandler(e, "ClearTroubleChars"); }
}
function TruncateCaption(Caption, MaxLength) {
    if (kErrorMode === true) { return false };
    var NewCaption = "";
    try {
        if (Caption != null) {
            NewCaption = ClearTroubleChars(Caption);
            if (MaxLength === undefined) {
                MaxLength = 15;
            }
            if (NewCaption.length > MaxLength) {
                NewCaption = NewCaption.substring(0, MaxLength - 4) + " ...";
                return NewCaption;
            } else {
                return NewCaption;
            }
        } else {
            return "";
        }
    }
    catch (e) { kGlobalErrorHandler(e, "TruncateCaption"); }
}


function setColumnsSize() {
    if (kErrorMode === true) { return false };
    var div_count = 0, remaining_size = 0, getWidth = 0;
    try {
        kStartTimer("setColumnSize");
        $('.column').width(245 + 'px');
        div_count = $('.column').size();
        if (div_count > 3) {
            getWidth = 245 * div_count;
        }
        else {
            getWidth = $(window).width();
        }
        $('body').width(getWidth + 'px');
        $('.main').width(getWidth + 'px');
        $('.SubMain').width(getWidth + 'px');
        $('.list-row').width(getWidth + 'px');
        $('.list-row2').width(getWidth + 'px');
        kEndTimer("setColumnSize");
    }
    catch (e) {
        kGlobalErrorHandler(e, "Error in setColumnsSize");
    }
};

