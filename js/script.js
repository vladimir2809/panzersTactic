var screenWidth = 800;
var screenHeight = 800;
var windowWidth=document.documentElement.clientWidth;
var windowHeight=document.documentElement.clientHeight;
var canvasWidth = 800;
var canvasHeight = 800;
var mapWidth = screenWidth * 2;
var mapHeight = screenHeight * 2;
var canvas = null;
var context = null;
var mapSize = 40;
var oldMouseX = null;
var oldMouseY = null;
var flagOldMouse = false;
var imageArr = new Map();
var nameImageArr=["body0","body1",'tower4','wall','water'];
var imageLoad = false;
var countLoadImage = 0;
var panzerArr = [];
var blockageArr = [];
var map = {
    x:1,
    y:1,
    width: mapWidth,//canvasWidth,
    height: mapHeight,//canvasHeight,
}
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
    this.x = xMap * mapSize+(mapSize/2-this.width/2);
    this.y = yMap * mapSize+(mapSize/2-this.height/2);
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
function Blockage(type,xMap,yMap)// класс препятствие
{
    this.type = type;
    this.xMap = xMap;
    this.yMap = yMap;
    this.x = xMap * mapSize;
    this.y = yMap * mapSize;
    this.nameImage = null;
    switch (this.type)
    {
        case 'wall': this.nameImage = 'wall'; break;
        case 'water':   this.nameImage = 'water'; break;
        case 0:   this.nameImage = 'wall'; break;
        case 1:   this.nameImage = 'water'; break;
    }
    this.draw=function (context,camera,scale=1)
    {
        drawSprite(context,imageArr.get(this.nameImage),this.x,this.y,camera,scale)
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
    setInterval(drawAll, 16);
    setInterval(update, 16);

});
window.onresize = function()
{
    updateSize()
}
function updateSize()
{
    windowWidth=document.documentElement.clientWidth;
    windowHeight=document.documentElement.clientHeight;
    let mult =1;
    if (windowWidth>=windowHeight)
    {
        canvasWidth = /*canvas.width = */windowHeight;//*screenWidth/screenHeight;
        canvasHeight = /*canvas.height = */windowHeight;
        //if (canvasWidth>windowWidth)
        //{
        //    mult = windowWidth/canvasWidth;
        //   // canvas.width =
        //        canvasWidth *= mult;
        //    //canvas.height =
        //        canvasHeight *= mult;
        //}
        canvasWidthMore = true;
    }
    else
    {
        canvasWidthMore = false;
        canvasWidth = /*canvas.width*/  windowWidth;
        canvasHeight = /*canvas.height*/  windowWidth;//*screenHeight/screenWidth;
    }
    
    canvas.setAttribute('width',canvasWidth);
    canvas.setAttribute('height',canvasHeight);
    canvas.style.setProperty('left', (window.innerWidth - canvas.width)/2 + 'px'); 
    canvas.style.setProperty('top', (window.innerHeight - canvas.height) / 2 + 'px'); 
    if (canvasWidthMore==true)
    {
        context.scale(windowHeight / screenHeight * mult, windowHeight / screenHeight * mult);   
        mouseMultX = windowHeight / screenHeight * mult;
        mouseMultY = windowHeight / screenHeight * mult;
    }
    else
    {
       context.scale(windowWidth/screenWidth,windowWidth/screenWidth);
        mouseMultX = windowWidth / screenWidth;
        mouseMultY = windowWidth / screenWidth;
    }
    //setOffsetMousePosXY((window.innerWidth - canvas.width)/2,
    //                        (window.innerHeight - canvas.height)/2);
    //camera.width = canvasWidth;
    //camera.height = canvasHeight;
}
function preload()
{
    loadImageArr();
   
   
}
function create() 
{
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    initKeyboardAndMouse();
    updateSize();
    //context.scale(0.1, 0.1);
    for (let i = 0; i < screenHeight / mapSize;i++)
    {
        var panzer = new Panzer(0, 1, i);
       // panzer.draw(context,camera,1);
        panzerArr.push(panzer);
    }
    for (let i = 0; i < screenWidth / mapSize;i++)
    {
        var panzer = new Panzer(0, i, 1);
       // panzer.draw(context,camera,1);
        panzerArr.push(panzer);
    }
    for (let i = 0; i < 1500;i++)
    {
        let xMap = randomInteger(0,map.width/mapSize);
        let yMap = randomInteger(0,map.height/mapSize);
        var blockage = new Blockage(randomInteger(0,1),xMap,yMap)
        // panzer.draw(context,camera,1);
        blockageArr.push(blockage);
    }
   // var panzer = new Panzer(1, 2, 2);
   //// panzer.draw(context,camera,1);
   // panzerArr.push(panzer);
}
function drawAll()
{
    context.fillStyle='rgb(210,210,210)';
    context.fillRect(0,0,camera.width,camera.height);// очистка экрана
    for (let i = 0; i < panzerArr.length;i++)
    {
        panzerArr[i].draw(context,camera,1);
    }
    for (let i = 0; i < blockageArr.length;i++)
    {
        blockageArr[i].draw(context,camera,1);
    }
}
function drawSprite(context,image,x,y,camera,scale)// функция вывода спрайта на экран
{
    if(!context || !image) return;
    context.save();
    context.scale(scale,scale);
    context.drawImage(image,x-camera.x,y-camera.y);
    context.restore();
}
function update()
{
    if (mouseLeftPress==true)
    {
      
        if (flagOldMouse==false)
        {
            
            flagOldMouse = true;
        }
        else
        {
            if (camera.x-(mouseX - oldMouseX) > 0)
            {
               camera.x -= mouseX - oldMouseX; 
            } 

            if (camera.x-(mouseX - oldMouseX) < map.width-camera.width)
            {
               camera.x -= mouseX - oldMouseX; 
            }
            
            if (camera.y-(mouseY - oldMouseY)>0  )
            {
                camera.y -= mouseY - oldMouseY;
            } 

            if (camera.y-(mouseY - oldMouseY)<map.height -camera.height )
            {
                camera.y -= mouseY - oldMouseY;
            }
            if (camera.x < 0) 
            {
                camera.x = 1;
            }

          
            if (camera.y < 0) 
            {
                camera.y = 1;
            }

           
            if (camera.x >map.width-camera.width) 
            {
                camera.x = map.width-camera.width-1;
            }

          
            if (camera.y > map.height -camera.height) 
            {
                camera.y = map.height-camera.height-1;
            }

        }
        oldMouseX = mouseX;
        oldMouseY = mouseY;
    }
    else
    {
        flagOldMouse = false;
    }
    if (mouseY>screenWidth)
    {
        camera.x++;
    }

}
