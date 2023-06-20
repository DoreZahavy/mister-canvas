'use strict'

var gIsPainting = false
var gTool = {
    shape: null,
    brush: false,
    clrFill:'white',
    clrStroke:'Black'
}

function setTool(tool = {}){
    if (tool.shape !== undefined) gTool.shape = tool.shape
    if (tool.brush !== undefined) gTool.brush = tool.brush
    if (tool.clrFill !== undefined) gTool.clrFill = tool.clrFill
    if (tool.clrStroke !== undefined) gTool.clrStroke = tool.clrStroke
    console.log('tool:', tool)
    console.log('gTool:', gTool)
}

function getTool(){
    return gTool
}

function setIsPainting(value){
    gIsPainting = value
}

function getIsPainting(){
    return gIsPainting
}