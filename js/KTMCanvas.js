/*!
 * Copyright Kalmstrom Enterprises AB
* http://www.kalmstrom.com/
 *
 */
/// <reference path="dynamic.js" />
/// <reference path="KTMPhrases.js" />
/// <reference path="lib/jquery-1.8.0.min.js" />
/// <reference path="lib/jquery-ui-1.8.23.custom.min.js" />
/// <reference path="lib/kalmstromshared.js" />
/// <reference path="KTMGlobalObjects.js" />
/// <reference path="KTM.js" />
/// <reference path="KTMTaskInteraction.js" />
/// <reference path="KTMSearch.js" />
/// <reference path="KTMSPInteraction.js" />
"use strict";
//declare variables used
var canvas;
var intPhaseXCordinate=0;
var intPhaseYCordinate=25;
var intPhaseWidth=245;
var intPhaseHeight=0;
var intTaskXCordinate=0;
var intTaskYCordinate=0;
var intTaskWidth=226;
var intTaskHeight=106;
var intLineWidth=3;
var divcanvas;

//Draw Canvas inside the div drawingcanvas
function DrawCanvas()
{
	var Width,Height;
	divcanvas=document.getElementById('drawingcanvas');
	Width=window.innerWidth*(90/100);
	Height=window.innerHeight*(90/100);
	divcanvas.width=Width;
	divcanvas.height=Height;
	intPhaseHeight=divcanvas.height;
	canvas = new draw2d.Canvas("drawingcanvas");
}


//Create Phase & Line
function CreatePhaseAndLine(KTMPhase)
{	
	alert(KTMPhase.ID);
	DrawPhaseRectangle(intPhaseXCordinate,intPhaseYCordinate,intPhaseWidth,intPhaseHeight
	,KTMPhase);
	intPhaseXCordinate+=245;
	DrawPhaseLine(intPhaseXCordinate,(intPhaseYCordinate),KTMPhase.ID);
}

//Draw Rectangle Phase Object
function DrawPhaseRectangle(PhaseX,PhaseY,PhaseWidth,PhaseHeight,KTMPhase)
{
//Check If Phase width exceeds than canvas width & if so then increase canvas width
	if (PhaseX>divcanvas.width)
	{
		divcanvas.width=PhaseX;
		canvas = new draw2d.Canvas("drawingcanvas");
	}
	var CurrCanvasPhase=new KTMCanvasPhase(PhaseX,PhaseY,PhaseWidth,PhaseHeight,KTMPhase);
	CurrCanvasPhase.DrawRectangle();
}

//Draw Line Phase Object
function DrawPhaseLine(LineX,LineY,LineId)
{
	var CurrCanvasLine=new KTMCanvasLine(LineId,LineX,LineY);
	CurrCanvasLine.DrawLine();
}


//Class responsible for Phase (Rectangle) Object
function KTMCanvasPhase(X,Y,Width,Height,KTMPhase)
{
//private variables sets x,y,width,height etc  of rectangle phase
	this.ID=KTMPhase.ID;
	this.X=X;
	this.Y=Y;
	this.Width=Width;
	this.Height=Height;
//public function draws Rectangle onto canvas
	this.DrawRectangle = function () {	
		var PhaseRectangle;
		PhaseRectangle = new draw2d.shape.basic.Rectangle();
		PhaseRectangle.setRadius(0);
		PhaseRectangle.setDimension(this.Width,this.Height);
		PhaseRectangle.setBackgroundColor("#FFFFFF");
		PhaseRectangle.setId("CanvasPhase" + this.ID);
		canvas.addFigure(PhaseRectangle,this.X,this.Y);
		canvas.addFigure(new draw2d.shape.basic.Label("Phase"+this.ID),(this.X + (this.Width/2)),this.Y);
	}
}

//Class responsible for line object
function KTMCanvasLine(ID,X,Y)
{
//private variables sets x,y cordinates of line
	this.ID=ID;
	this.X=X;
	this.Y=Y;
//public function to draw line onto canvas
	this.DrawLine = function() { 
		var PhaseLine;
		PhaseLine=new draw2d.shape.basic.Line(this.X,this.Y,this.X,(this.Y + intPhaseHeight));
		PhaseLine.setStroke(intLineWidth);	
		PhaseLine.setId("CanvasLine" + this.ID);
		PhaseLine.setColor("#000000");
		canvas.addFigure(PhaseLine);
	}
}


//Create Task
function CreateTask(CurrTask)
{	
//local objects & variables
	var CurrPhase=new KTMPhase(),TaskLength;
	CurrPhase=CurrTask.Phase;
//retrieve total number of tasks for current phase by Id CurrPhase.ID 
// & set it to TaskLength
	TaskLength=GetTaskLengthByPhaseId(CurrPhase.ID);
//find x-cordinate of current phase
	PhaseXCordinate=GetPhaseXCordinate(CurrPhase.ID);
//find y-cordinate of current phase
	PhaseYCordinate=GetPhaseYCordinate(CurrPhase.ID);
//switch by different length of tasks & adjust x,y of tasks which needs to draw onto canvas
	switch(TaskLength)
	{
		case 1:
			TaskYCordinate=PhaseYCordinate + 20;
		break;
		case 2:
			TaskYCordinate=PhaseYCordinate + 20;
		break;
		default : 
			TaskXCordinate=PhaseXCordinate + 5;
	}
//Draw Rectangle Task Object
	var CurrCanvasTask=new KTMCanvasTask(TaskXCordinate,TaskYCordinate,Width,Height,Count,CurrTask);
	CurrCanvasTask.CreateTaskRect();
}



function GetPhaseXCordinate(PhaseId)
{
	
}

function GetPhaseYCordinate(PhaseId)
{
	
	
}

//Returns max number of tasks pushed for the phase
function GetTaskLengthByPhaseId(PhaseId)
{
	var CurrPhase=new KTMPhase();
	CurrPhase=GetObjectByID(PhaseId, KTMSettings.Phases);
	return CurrPhase.Tasks.length;
}


 

//Class responsible for Task (rectangle) object 
function KTMCanvasTask(X,Y,Width,Height,ObjCurrTask)
{
//private variables sets x,y,width,height etc  of rectangle task
	this.ID=ObjCurrTask.ID;
	this.X=X;
	this.Y=Y;
	this.Width=Width;
	this.Height=Height;
	this.TaskColor=objCurrTask.TaskColor;
	this.ProjectId=objCurrTask.Project.ID;
	this.ProjectName=objCurrTask.Project.Name;
	this.ResponsibleId=objCurrTask.Responsible.ID;
	this.ResponsibleName=objCurrTask.Responsible.Name;
	this.TaskSubject=objCurrTask.Subject;
	this.TaskBody=objCurrTask.TaskBody;

//public function draws Rectangle onto canvas
	this.CreateTaskRect = function() 
	{
		var TaskRectangle;
		TaskRectangle = new draw2d.shape.basic.Rectangle();
		TaskRectangle.setRadius(0);
		TaskRectangle.setDimension(this.Width,this.Height);
		TaskRectangle.setColor(color);
		TaskRectangle.setId("CanvasTask"+this.ID);
		canvas.addFigure(TaskRectangle,this.X,this.Y);
		canvas.addFigure(new draw2d.shape.basic.Label("Task"+this.Count),this.X,this.Y);
	}
}