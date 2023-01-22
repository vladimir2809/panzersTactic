var screenWidth = 800;
var screenHeight = 800;
var canvasWidth = 800;
var canvasHeight = 800;
var context = null;
var mapSize = 40;

var imageArr = new Map();
var nameImageArr=["body0","body1",'tower4','wall'];
var imageLoad = false;
var countLoadImage = 0;
var panzerArr = [];
var camera = {
    x:1,
    y:1,
    width: 800,//canvasWidth,
    height: 800,//canvasHeight,
}

function Panzer(command,xMap,yMap)
{
    this.xMap = xMap;
    this.yMap = yMap;
    this.command = command;
    this.width = 35;
    this.height = 35;
    this.x = xMap * mapSize;
    this.y = yMap * mapSize;
    this.bodyNameImage = this.command == 0 ? 'body0' : 'body1';
    this.towerNameImage = 'tower4';
    this.angleBody = 90;
    this.angleTower = 90;
    this.towerX = null;
    this.towerY = null;
    this.mixTowerX = 8.5;
    this.mixTowerY = 18.5;
    this.mixTowerPosX = 17;
    this.mixTowerPosY = 17;
    this.updateState=function()// обновить состояние танка, пересчитывается центральная точка
    {
        this.towerX=this.x-this.mixTowerX+this.mixTowerPosX;
        this.towerY=this.y-this.mixTowerY+this.mixTowerPosY;
        this.angleTower++;
    },
    this.draw = function(context,camera,scale=1)
    {
        this.updateState();
        if(!context || !imageArr.get(this.bodyNameImage) || !imageArr.get(this.towerNameImage )) return;
        context.save();
    
        context.translate((this.x+this.width/2-camera.x)*scale,
                            (this.y+this.height/2-camera.y)*scale);
        context.scale(scale,scale);
        context.rotate(this.angleBody*Math.PI/180);                  
        context.drawImage(imageArr.get(this.bodyNameImage),-this.width/2/*-camera.x*/,
                           /*panzer.y-*/-this.height/2/*-camera.y*/);
        context.restore();
    
        context.save();
        context.translate((this.towerX+this.mixTowerX-camera.x)*scale,
                            (this.towerY+this.mixTowerY-camera.y)*scale);
        context.scale(scale,scale);
        context.rotate(this.angleTower*Math.PI/180);
        context.drawImage(imageArr.get(this.towerNameImage),-this.mixTowerX,-this.mixTowerY);
        context.restore();
    }
}
//function drawPanzer(context,panzer,camera,scale)// функция рисования танка вместе с башней
//{
//    if(!context || !imageArr.get(panzer.bodyNameImage) || !imageArr.get(panzer.towerNameImage )) return;
//    context.save();
    
//    context.translate((panzer.x+panzer.width/2-camera.x)*scale,
//                        (panzer.y+panzer.height/2-camera.y)*scale);
//    context.scale(scale,scale);
//    context.rotate(panzer.angleBody*Math.PI/180);                  
//    context.drawImage(imageArr.get(panzer.bodyNameImage),-panzer.width/2/*-camera.x*/,
//                       /*panzer.y-*/-panzer.height/2/*-camera.y*/);
//    context.restore();
    
//    context.save();
//    context.translate((panzer.towerX+panzer.mixTowerX-camera.x)*scale,
//                        (panzer.towerY+panzer.mixTowerY-camera.y)*scale);
//    context.scale(scale,scale);
//    context.rotate(panzer.angleTower*Math.PI/180);
//    context.drawImage(imageArr.get(panzer.towerNameImage),-panzer.mixTowerX,-panzer.mixTowerY);
//    context.restore();
// //   console.log(panzer.bodyNameImage);
//}
function loadImageArr()// загрузить массив изображений
{
    // заполняем массив изображений именами
    for (let value of nameImageArr  )
    {
        let image=new Image();
        image.src="img/"+value+".png";       
        imageArr.set(value,image);
    }
    // проверяем загружены ли все изображения
    for (let pair of imageArr  )
    {
             imageArr.get(pair[0]).onload = function() {
                   countLoadImage++;
                   //console.log(imageArr);
                   console.log(countLoadImage);
                   if (countLoadImage==imageArr.size) 
                   {
                       imageLoad=true;
                    //  console.log(imageArr);
                   } // если загруженны все ищображения
             }
             imageArr.get(pair[0]).onerror = function() {   
                   alert("во время загрузки произошла ошибка");
                   //alert(pair[0].name);
                   
             }
     }  
}
window.addEventListener('load', function () {
    preload();
    create();
    setInterval(drawAll, 60);

});
function preload()
{
    loadImageArr();
   
   
}
function create() 
{
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    //context.scale(0.1, 0.1);
    var panzer = new Panzer(0, 1, 1);
   // panzer.draw(context,camera,1);
    panzerArr.push(panzer);
    var panzer = new Panzer(1, 2, 2);
   // panzer.draw(context,camera,1);
    panzerArr.push(panzer);
}
function drawAll()
{
    context.fillStyle='rgb(210,210,210)';
    context.fillRect(0,0,camera.width,camera.height);// очистка экрана
    for (let i = 0; i < panzerArr.length;i++)
    {
        panzerArr[i].draw(context,camera,1);
    }
}
function update()
{

}
