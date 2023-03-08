var screenWidth = 800;
var screenHeight = 800;
var windowWidth=document.documentElement.clientWidth;
var windowHeight=document.documentElement.clientHeight;
var canvasWidth = 800;
var canvasHeight = 800;
var mapWidth = screenWidth * 1;
var mapHeight = screenHeight * 1;
var canvas = null;
var context = null;
var mapSize = 40;
var oldMouseX = null;
var oldMouseY = null;
var flagOldMouse = false;
var imageArr = new Map();
var nameImageArr=["body0","body1",'tower4','wall','water','AIM'];
var imageLoad = false;
var countLoadImage = 0;
var panzerArr = [];
var blockageArr = [];
var speedMoveCamera = { x: 0, y: 0 };// скорость перемешения камеры
var showDownCamera = 0.2;// скорость замедления камеры
var timePressMouseLeft = -1;
var timePressMouseOld = 0;
var flagMoveCamera = false;
var searchRoute=null;// поиск пути
var bullets = null;
var numSelectPanzer = null;// номер выбраного танка
var numCommandStep = 0;
var autoGame = true;
var dataII = null;
var stepCommand = [null,null];
var line = { x:null, y:null, x1:null, y1:null, numP:null };// линия для вычесления пересечений
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
    this.towerX = null;// координаты башни 
    this.towerY = null;
    this.mixTowerX = 8.5;// смешение башни
    this.mixTowerY = 18.5;
    this.mixTowerPosX = 17;
    this.mixTowerPosY = 17;
    this.centrX = null;// серидина танка
    this.centrY = null;
    this.HP = 100;
    this.speed = 5;
    this.moving = false;// танк двигается
    this.endMove == true;// танк закончил движение
    this.oldEndMove = this.endMove;
    this.attackThrow = false;// танк атаковал в этом ходу
    this.attack = false;// танк атакуетр
    this.tookAim = false;// танк прицелился
    this.angleAim = null;// угол башни
    this.imUnderGun = false; // я под прицелом
    this.route = [];// массив маршрута
    this.numPointRoute = null;// номер точки в маршруте
    this.lineArr = [];

    this.updateState=function()// обновить состояние танка, пересчитывается центральная точка
    {
        this.towerX=this.x-this.mixTowerX+this.mixTowerPosX;
        this.towerY=this.y-this.mixTowerY+this.mixTowerPosY;
        this.centrX = this.x + this.width / 2;
        this.centrY = this.y + this.height / 2;
  //      this.angleTower++;
    },
    this.draw = function(context,camera,scale=1)
    {
        this.updateState();
        if(!context || !imageArr.get(this.bodyNameImage) || !imageArr.get(this.towerNameImage )) return;
        if (this.being==true)
        {
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

    this.startMovingByRoute=function (route)// старт передвижения по маршруту
    {
        this.moving = true;
        this.endMove = this.oldEndMove=false;
        this.route = JSON.parse(JSON.stringify(route));
        this.numPointRoute = 1;
    }
    this.movingByRoute=function()// перемешение по маршруту
    {
        if (this.moving==true)
        {
            
            for (let i = 0; i < 2; i++)
            {
                let numP = this.numPointRoute;
                if (this.xMap<this.route[numP].xMap && this.yMap==this.route[numP].yMap)
                {
                    this.x++;
                    this.angleBody = 90;
                    this.angleTower = 90;
                }
                if (this.xMap>this.route[numP].xMap && this.yMap==this.route[numP].yMap)
                {
                    this.x--;
                    this.angleBody = 270;
                    this.angleTower = 270;
                }
                if (this.xMap==this.route[numP].xMap && this.yMap<this.route[numP].yMap)
                {
                    this.y++;
                    this.angleBody = 180;
                    this.angleTower = 180;
                }
                if (this.xMap==this.route[numP].xMap && this.yMap>this.route[numP].yMap)
                {
                    this.y--;
                    this.angleBody = 0;
                    this.angleTower = 0;
                }
                if (this.x-(mapSize/2-this.width/2)==this.route[numP].xMap*mapSize &&
                    this.y-(mapSize/2-this.width/2)==this.route[numP].yMap*mapSize)
                {    
                    this.xMap = Math.trunc(this.x / mapSize);
                    this.yMap = Math.trunc(this.y / mapSize);
                    if (this.numPointRoute<this.route.length-1)
                    {
                        this.numPointRoute++;
                    }
                    else
                    {
                        this.moving = false;
                        this.endMove = true;
                      
                        break;
                    }
           
                }
            }
        }
    }
    this.endMoveToRoute = function (callback)// окончание перемешения по маршруту обратный вызов
    {
        if (this.endMove==true && this.oldEndMove==false)
        {
            this.oldEndMove = true;
            callback();
        }
    }
}
function Blockage(type,xMap,yMap)// класс препятствие
{
    this.type = type;
    this.xMap = xMap;
    this.yMap = yMap;
    this.x = xMap * mapSize;
    this.y = yMap * mapSize;
    this.width = mapSize;
    this.height = mapSize;
    this.nameImage = null;
    switch (this.type)
    {
        //case 'wall': this.nameImage = 'wall'; break;
        //case 'water':   this.nameImage = 'water'; break;
        case 0:   this.nameImage = 'wall'; break;
        case 1:   this.nameImage = 'water'; break;
    }
    this.lineArr = [];
  //  let line = clone(Line);
    this.draw=function (context,camera,scale=1)
    {
        drawSprite(context,imageArr.get(this.nameImage),this.x,this.y,camera,scale)
    }
}
function calcLineArr(obj,type="blockage",numP=null)// расчитать массив линий для обьекта
{
   let lineArr=[];
   for (let j=0;j<4;j++)
    {
        lineArr[j]=JSON.parse(JSON.stringify(line));//clone(line);
            
        if (j==0) lineArr[j]={
            x:obj.x,
            y:obj.y,
            x1:obj.x+obj.width,
            y1:obj.y,
        }
        if (j==1) lineArr[j]={
            x:obj.x+obj.width,
            y:obj.y,
            x1:obj.x+obj.width,
            y1:obj.y+obj.height,
        }
        if (j==2) lineArr[j]={
            x:obj.x+obj.width,
            y:obj.y+obj.height,
            x1:obj.x,
            y1:obj.y+obj.height,
        }
        if (j==3) lineArr[j]={
            x:obj.x,
            y:obj.y+obj.height,
            x1:obj.x,
            y1:obj.y,
        }
       if (type!='blockage') 
       {
           lineArr[j].numP = numP;
       }
        ////console.log(wallArr[i].lineArr[j].x);      
    }
    return lineArr;
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
    console.log(imageArr);
}
window.addEventListener('load', function () {
    preload();
    create();
    setInterval(drawAll, 6);
    setInterval(update, 6);

});
window.onresize = function()
{
    updateSize()
}
function updateSize()// изменить размер изображений для адаптивность, вызавается при изменении размеров экрана
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
    initKeyboardAndMouse(["Digit1", "Digit2", "KeyW",'KeyA',"Delete",'KeyD']);
    updateSize();
    srand(1504);
    //context.scale(0.1, 0.1);
    //for (let i = 0; i < screenHeight / mapSize;i++)
    //{
    //    var panzer = new Panzer(0, 1, i);
    //   // panzer.draw(context,camera,1);
    //    panzerArr.push(panzer);
    //}
    for (let i = 0; i < 40;i++)// создать танки
    {
        let xMap = null;
        let yMap = null;
        do {
            xMap = randomInteger(0, (map.width / mapSize) - 1);
            yMap = randomInteger(0, (map.height / mapSize) - 1);
        } while (checkObjInCell(xMap, yMap) == true);
        var panzer = new Panzer(i % 2, xMap, yMap);
        panzer.being = true;
        panzer.lineArr=calcLineArr(panzer,'panzer',i);
       // panzer.draw(context,camera,1);
        panzerArr.push(panzer);
    }
    console.log(panzerArr);
    for (let i = 0; i < 50;i++)// создать препятствия
    {
        //let xMap = randomInteger(0,(map.width/mapSize)-1);
        //let yMap = randomInteger(0,(map.height/mapSize)-1);
        let xMap = null;
        let yMap = null;
        do {
            xMap = randomInteger(0, (map.width / mapSize) - 1);
            yMap = randomInteger(0, (map.height / mapSize) - 1);
        } while (checkObjInCell(xMap, yMap) == true);
        var blockage = new Blockage(randomInteger(0,1),xMap,yMap)
        // panzer.draw(context,camera,1);
        blockage.lineArr=calcLineArr(blockage);
        blockageArr.push(blockage);
    }
    searchRoute = new SearchRoute();
    searchRoute.initMap(map.width/mapSize,map.height/mapSize);
    bullets = new Bullets();
    //map2[1][1] = 'N';
    //console.log(map2);
   
    updateMapSearchRoute();
 //   searchRoute.spreadingWave(1,1,50,10,10);
  ///  searchRoute.getRoute(panzerArr[0].xMap,panzerArr[0].yMap, 10, 10,10);
    console.log(searchRoute.mapWave);
   // var panzer = new Panzer(1, 2, 2);
   //// panzer.draw(context,camera,1);
   // panzerArr.push(panzer);
}
function drawAll()// нарисовать все
{
    context.fillStyle='rgb(210,210,210)';
    context.fillRect(0,0,camera.width,camera.height);// очистка экрана
    drawWaveRoute(context);
 
    for (let i = 0; i < blockageArr.length;i++)
    {
        blockageArr[i].draw(context,camera,1);
        
    } 
    for (let i = 0; i < panzerArr.length;i++)
    {
        panzerArr[i].draw(context,camera,1);
        context.beginPath();
        context.font = "25px serif";
        context.fillStyle = 'white';
        let x = panzerArr[i].x;
        let y = panzerArr[i].y;
        context.fillText(i+'', x+mapSize/2-camera.x-14 , y+mapSize/2-camera.y+6)
        context.stroke();
    }
    bullets.drawBullets(context);
    for (let i = 0; i < blockageArr.length; i++)
    {
        drawLineArr(blockageArr[i])
    }
    for (let i = 0; i < panzerArr.length; i++)
    {
        drawLineArr(panzerArr[i],"red")
    }
    let colorLine = "red";
    //if (crossingTwoPoint(panzerArr[0].centrX,panzerArr[0].centrY,panzerArr[1].centrX,panzerArr[1].centrY)==false)
    //{
    //    colorLine = "blue";
    //}
    //if (crossLinePanzer(0,1)==true)
    //{
    //    colorLine = "yellow";
    //}
    for (let i = 0; i < panzerArr.length;i++)
    {
        for (let j = 0; j < panzerArr.length;j++)
        {
            if (i!=j && panzerArr[i].command!=panzerArr[j].command &&
                panzerArr[i].being==true && panzerArr[j].being==true)
            {
                if (visiblePanzerToPanzer(i,j)==true)
                {
                    context.beginPath();
                    context.strokeStyle=colorLine;
                    context.moveTo(panzerArr[i].centrX,panzerArr[i].centrY); //передвигаем перо
                    context.lineTo(panzerArr[j].centrX,panzerArr[j].centrY); //рисуем линию
                    context.stroke();
                }
            }
        }
    }
    if (numSelectPanzer!=null &&panzerArr[numSelectPanzer].moving==false)
    {
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].imUnderGun==true)
            {
                drawSprite(context,imageArr.get('AIM'),panzerArr[i].x,panzerArr[i].y,camera,1)
            }
         
        }
           
    }
    if (dataII!=null)
    {
        for (let i = 0; i < dataII.length;i++)
        {
            for (let j = 0; j < dataII[i].pointAttArr.length;j++)
            {
                let x= dataII[i].pointAttArr[j].x;
                let y= dataII[i].pointAttArr[j].y;
              //  drawPointRoute(context, Math.trunc(x/mapSize), Math.trunc(y/mapSize), 0, 'blue');
                for (let k = 0; k < dataII[i].pointAttArr[j].gunArr.length;k++)
                {
                    context.beginPath();
                    context.strokeStyle='green';
                    
                
                    let num = dataII[i].pointAttArr[j].gunArr[k];
                    context.moveTo(x,y); //передвигаем перо
                    context.lineTo(panzerArr[num].centrX,panzerArr[num].centrY); //рисуем линию
                    context.stroke();
                }
            }
        }
    }
    for (let i = 0; i < panzerArr.length;i++)
    {
        context.fillStyle= 'red';
        context.fillRect(panzerArr[i].x, panzerArr[i].y - 5, panzerArr[i].width,4);
        context.fillStyle= 'green';
        context.fillRect(panzerArr[i].x, panzerArr[i].y - 5, panzerArr[i].width*panzerArr[i].HP/100,4);
    }
}
function drawLineArr(obj,color="#00FF00")// функция рисований линий, для расчета пересечений у конкретного обьекта
{
  
    for (let j=0;j<obj.lineArr.length;j++)
    {
        context.beginPath();
        context.strokeStyle=color;
        context.moveTo(obj.lineArr[j].x,obj.lineArr[j].y); //передвигаем перо
        context.lineTo(obj.lineArr[j].x1,obj.lineArr[j].y1); //рисуем линию
        context.stroke();
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
function drawWaveRoute(context)// нарисовать волну для поиска пути
{

    for (let i = 0; i < searchRoute.wavePointArr.length;i++)
    {
        let x = searchRoute.wavePointArr[i].xMap;
        let y = searchRoute.wavePointArr[i].yMap;
        let dist = searchRoute.wavePointArr[i].dist;

        if (dist>0 || (x==searchRoute.xFinish && y==searchRoute.yFinish))
        {
            let flagRoutePoint = false;
            for (let j = 0; j < searchRoute.routePointArr.length; j++)
            {
                if (x==searchRoute.routePointArr[j].xMap && y==searchRoute.routePointArr[j].yMap )
                {
                    flagRoutePoint = true;
                }
            }
            if (x==searchRoute.xFinish && y==searchRoute.yFinish/* && searchRoute.finishEnd==true*/ )
            {
                if (numSelectPanzer!=null && panzerArr[numSelectPanzer].moving==true) 
                {
                    drawPointRoute(context, x, y, dist, 'green');
                }
            }
            else if (flagRoutePoint==true)
            {
                if (numSelectPanzer!=null && panzerArr[numSelectPanzer].moving==true) 
                {
                    drawPointRoute(context, x, y, dist, 'red');
                }
            }
            else 
            {
                if (numSelectPanzer!=null && panzerArr[numSelectPanzer].moving==false &&
                    panzerArr[numSelectPanzer].attack==false &&
                    panzerArr[numSelectPanzer].attackThrow==false &&
                    panzerArr[numSelectPanzer].xMap!=searchRoute.xFinish && 
                    panzerArr[numSelectPanzer].yMap!=searchRoute.yFinish) 
                {
                    drawPointRoute(context, x, y, dist, 'blue');
                }
            }

          //	context.beginPath();
         //   if (x==searchRoute.xFinish && y==searchRoute.yFinish/* && searchRoute.finishEnd==true*/ )
         //   {
         //       context.fillStyle = 'green';
         //   }
         //   else
         //   {
	        //    context.fillStyle = 'blue';
         //   }
	        //context.arc(x*mapSize+mapSize/2-camera.x,y*mapSize+mapSize/2-camera.y, mapSize*0.4, 2*Math.PI, false);
          

	        //context.fill();
	        //context.lineWidth = 1;
	        //context.strokeStyle = 'blue';
	        //context.stroke();
         //   context.beginPath();
         //   context.font = "18px serif";
         //   context.fillStyle = 'red';
         //   context.fillText(dist+'', x*mapSize+mapSize/2-camera.x-4 , y*mapSize+mapSize/2-camera.y+6)
         //   context.stroke();

        }
    }
}
function drawPointRoute(context,x,y,dist,color)// нарисовать точку для поиска маршрута
{
         	context.beginPath();
            context.fillStyle = color;
	        context.arc(x*mapSize+mapSize/2-camera.x,y*mapSize+mapSize/2-camera.y, mapSize*0.4, 2*Math.PI, false);
	        context.fill();
	        context.lineWidth = 1;
	        context.strokeStyle = 'blue';
	        context.stroke();

            context.beginPath();
            context.font = "18px serif";
            context.fillStyle = 'red';
            context.fillText(dist+'', x*mapSize+mapSize/2-camera.x-4 , y*mapSize+mapSize/2-camera.y+6)
            context.stroke();
}
function update()// основной цикл игры
{
    showDownCamera = 0.5;
    if (mouseLeftPress==true)// если нажата левая кнопка мыши
    {
        if (numSelectPanzer!=null)// если есть выбранный танк
        {
            for (let i = 0; i < searchRoute.wavePointArr.length;i++)
            {
                xPoint = searchRoute.wavePointArr[i].xMap;
                yPoint = searchRoute.wavePointArr[i].yMap;
                numPanz = numSelectPanzer;
                // если не кликнули на выбранный танк
                if ((mouseX>panzerArr[numPanz].xMap*mapSize && mouseX<panzerArr[numPanz].xMap*mapSize+mapSize &&
                    mouseY>panzerArr[numPanz].yMap*mapSize && mouseY<panzerArr[numPanz].yMap*mapSize+mapSize)==false)
                { 
                    // если кликнули на точку пути выбранног танка
                    if (mouseX>xPoint*mapSize && mouseX<xPoint*mapSize+mapSize &&
                        mouseY>yPoint*mapSize && mouseY<yPoint*mapSize+mapSize)
                    {
                        let route= searchRoute.getRoute(panzerArr[numPanz].xMap,panzerArr[numPanz].yMap, 30, xPoint,yPoint);
                        panzerArr[numPanz].startMovingByRoute(route);
                        //numSelectPanzer = null;
                        break;
                    }
                }
            }
        }
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].being==true)
            {
                // если выбранн танк для атаки
                if (numSelectPanzer!=null)
                {
                    numPanz = numSelectPanzer;
                    //let flag = false;
                    //for (let j = 0; j < panzerArr.length;j++) 
                    //{
                    //    if (checkInObj(panzerArr[j],mouseX,mouseY) && i==j)// если мышь в танке для атаки
                    //    {
                    //        flag = true;
                    //    }
                    //}
                    if (checkInObj(panzerArr[i],mouseX,mouseY)==true && panzerArr[i].command==1 &&
                        i!=numSelectPanzer && panzerArr[numPanz].attack == false /*&& flag==true*/ &&
                        panzerArr[numPanz].attackThrow==false)
                    {
                        panzerArr[numPanz].attack = true;
                        panzerArr[numPanz].angleAim = angleIm(panzerArr[numPanz].centrX, panzerArr[numPanz].centrY, 
                                                                panzerArr[i].centrX, panzerArr[i].centrY);

                    }
               
                }
             
                // если кликнули на не выбранный танк
                if (checkInObj(panzerArr[i],mouseX,mouseY)==true && panzerArr[i].command==0)
                {
                    updateMapSearchRoute();
                    searchRoute.spreadingWave(panzerArr[i].xMap,panzerArr[i].yMap,panzerArr[i].speed);
                    numSelectPanzer = i;
                    numCommandStep = 0;
                    updateImUnderGunPanzer();
                    panzerArr[i].attackThrow = false;
                 //   let route= searchRoute.getRoute(panzerArr[i].xMap,panzerArr[i].yMap, 100, 10,10);
                   // panzerArr[i].startMovingByRoute(route);
                    //console.log('Route Panzer');
                    //console.log(route);


                }
            
            }
        }   

        if (flagOldMouse==false)// 
        {
            
            flagOldMouse = true;
            timePressMouseOld = new Date().getTime();
        }
        else
        {
            //speedMoveCamera = { x: 0, y: 0 };
            if (mouseInCanvas==true)// если мышь в канвасе
            {
                let dist = calcDist(mouseX, mouseY, oldMouseX, oldMouseY);// считаем растояние пройденые мышью
               
                    // вычесляем множитель для ускорения камеры
                    let mult = 0.335;
                    // присвоеваем ускорение камере
                    speedMoveCamera.x = (mouseX - oldMouseX) * mult;
                    speedMoveCamera.y = (mouseY - oldMouseY) * mult;                                            
                    moveCamera(mouseX - oldMouseX, mouseY - oldMouseY);
                
            }
           

        }
        // вычеслияем старые координаты мыши
        oldMouseX = mouseX;
        oldMouseY = mouseY;
    }
    else// кнопка мыши отпушена
    {
        flagOldMouse = false;
        let timeNow = new Date().getTime();
        timePressMouseLeft = timeNow - timePressMouseOld;// вычесляем которые было нажата на левую кнопку мыши
        if (flagMoveCamera==false && timePressMouseLeft<250)// если игрок сделал жест быстрого скролинга карты
        {
            flagMoveCamera = true;
        }
        if (flagMoveCamera==true)
        {
            moveCamera(speedMoveCamera.x,speedMoveCamera.y);//перемешаем камерy
        
            // уменьшаем ускорение камеры
            if (speedMoveCamera.x>0)
            {
                speedMoveCamera.x -= showDownCamera;
                if (speedMoveCamera.x < 0) speedMoveCamera.x = 0;
            }
            if (speedMoveCamera.x<0)
            {
                speedMoveCamera.x += showDownCamera;
                if (speedMoveCamera.x > 0) speedMoveCamera.x = 0;
            }
            if (speedMoveCamera.y>0)
            {
                speedMoveCamera.y -= showDownCamera;
                if (speedMoveCamera.y < 0) speedMoveCamera.y = 0;
            }
            if (speedMoveCamera.y<0)
            {
                speedMoveCamera.y += showDownCamera;
                if (speedMoveCamera.y > 0) speedMoveCamera.y = 0;
            }
            if (speedMoveCamera.x == 0 && speedMoveCamera.y == 0) flagMoveCamera = false;
        }
    }
    if (stepCommand[numCommandStep]!=null && stepCommand[numCommandStep].numPanz!=null)
    {
        if(stepCommand[numCommandStep].complete==2 )
        {
            stepCommand[numCommandStep].complete = 3;
            let numPanz = stepCommand[numCommandStep].numPanz;
            let numPAtc = stepCommand[numCommandStep].numPanzAttack;
            if (stepCommand[numCommandStep].numPanzAttack!=undefined)
            {
                panzerArr[numPanz].attack = true;
            //    alert(54);
                panzerArr[numPanz].angleAim = angleIm(panzerArr[numPanz].centrX, panzerArr[numPanz].centrY, 
                                                            panzerArr[numPAtc].centrX, panzerArr[numPAtc].centrY);
            }
        }
        if (stepCommand[numCommandStep].complete==0 )
        { 
            let numPanz = stepCommand[numCommandStep].numPanz;
            numSelectPanzer = numPanz; 
            let step = stepCommand[numCommandStep];
            updateImUnderGunPanzer();
            if ((panzerArr[numPanz].xMap==step.pointAttack.xMap &&
                panzerArr[numPanz].yMap==step.pointAttack.yMap)==false)
            {
                stepCommand[numCommandStep].complete = 1;
                updateMapSearchRoute();
                let route= searchRoute.getRoute(panzerArr[numPanz].xMap,panzerArr[numPanz].yMap, 30, 
                                                 step.pointAttack.xMap,step.pointAttack.yMap);
                panzerArr[numPanz].startMovingByRoute(route); 
            }
            else
            {
                stepCommand[numCommandStep].complete = 2;
            }
            panzerArr[numPanz].attackThrow = false;
        }
    }
    for (let i = 0; i < panzerArr.length;i++)
    {
        panzerArr[i].movingByRoute();// движение танка по маршруту
        if (numSelectPanzer!=null)
        {
            // расчитываем что делать тогда когда движение по пути танка завершенно
            panzerArr[i].endMoveToRoute(function () {
                //alert('panzer end Move');
              //  numSelectPanzer = null;
                panzerArr[i].lineArr=calcLineArr(panzerArr[i],'panzer',i);
                updateImUnderGunPanzer();
                updateMapSearchRoute();
                if (stepCommand[numCommandStep].complete==1)
                {
                    stepCommand[numCommandStep].complete = 2;
                }
            });
        }
    }
    // поведение прицеливания выбранного танка и стрельба
    if (numSelectPanzer!=null)
    {
        let numPanz = numSelectPanzer;
        if (  panzerArr[numPanz].attack==true && panzerArr[numPanz].attackThrow == false)
        {
            let angleAim = panzerArr[numPanz].angleAim;
            panzerArr[numPanz].angleTower = movingToAngle(panzerArr[numPanz].angleTower,angleAim,10);
            if (Math.abs(panzerArr[numPanz].angleTower-angleAim)<0.5)
            {
                panzerArr[numPanz].tookAim = true;
            }
            if (panzerArr[numPanz].tookAim==true)
            {
                bullets.shot(panzerArr[numPanz].centrX, panzerArr[numPanz].centrY,panzerArr[numPanz].angleTower );
                panzerArr[numPanz].attack = false;
                panzerArr[numPanz].attackThrow = true;
                panzerArr[numPanz].tookAim = false;
                console.log('angleTower='+panzerArr[numPanz].angleTower);
                console.log('angleAIM='+panzerArr[numPanz].angleAim);
                
            }
}
    }
    //if (numSelectPanzer!=null)
    //{
    //    numPanz = numSelectPanzer;
    //    for (let i = 0; i < panzerArr.length;i++)
    //    {
    //        panzerArr[i].imUnderGun=false;
    //    }
    //    for (let i = 0; i < panzerArr.length;i++)
    //    {
    //        if (panzerArr[i].command==1 && panzerArr[i].being==true)
    //        {
    //            if (visiblePanzerToPanzer(numPanz,i)==true)
    //            {
    //                panzerArr[i].imUnderGun=true;
    //                 // drawSprite(context,imageArr.get('AIM'),panzerArr[i].x,panzerArr[i].y,camera,1)
    //            }
    //        }
    //    }
           
    //}
    bullets.update();
    collisioinBulets();
    
    redactGameMap();
}
function moveCamera(speedX,speedY)// движение камеры от заданной скорости
{
    if (camera.x-speedX > 0)
    {
        camera.x -= speedX; 
    } 

    if (camera.x-speedX < map.width-camera.width)
    {
        camera.x -= speedX; 
    }
            
    if (camera.y-speedY>0  )
    {
        camera.y -= speedY;
    } 

    if (camera.y-speedY<map.height -camera.height )
    {
        camera.y -= speedY;
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
function updateImUnderGunPanzer(forII=false,numP=null,command=1)
{
    if (numSelectPanzer!=null || forII==true)
    {
        numPanz = (numP==null && forII==false)?numSelectPanzer:numP;
        for (let i = 0; i < panzerArr.length;i++)
        {
            panzerArr[i].imUnderGun=false;
        }
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].command==command && panzerArr[i].being==true)
            {
                if (visiblePanzerToPanzer(numPanz,i)==true)
                {
                    panzerArr[i].imUnderGun=true;
                        // drawSprite(context,imageArr.get('AIM'),panzerArr[i].x,panzerArr[i].y,camera,1)
                }
            }
        }
           
    }
}
function collisioinBulets()// столкновение пуль с обьектами игры
{      
    for (let i = 0; i < bullets.bulletArr.length;i++)
    {   
        if (bullets.bulletArr[i].being==true)
        {
            for (let j = 0; j < blockageArr.length; j++)
            {  //
                if ( blockageArr[j].type==0 && checkInObj(blockageArr[j], bullets.bulletArr[i].x, bullets.bulletArr[i].y)==true)
                {
                    bullets.kill(i);
                    nextStepCommand();
                    //calcStepII(1);
                //    alert(589);
          
                }
            }
            for (let j = 0; j < panzerArr.length; j++)
            {  //
                if ( j!=numSelectPanzer && panzerArr[j].being==true &&
                    checkInObj(panzerArr[j], bullets.bulletArr[i].x, bullets.bulletArr[i].y)==true)
                {
                    bullets.kill(i);

                    panzerArr[j].HP -= 50;
                    if (panzerArr[j].HP<=0)
                    {
                        panzerArr[j].being = false;
                        
                    }
                    updateImUnderGunPanzer();
                    nextStepCommand();
                    //calcStepII(1);
                //    alert(589);
          
                }
            }
        }

    }
}
function calcStepII(numCommand)
{
    let attackObj = function () {
        this.numPanz = null;
     //   this.underGunArr = [];
        this.pointAttArr = [/*{ x: null, y: null, GunArr:[] }*/];
        
    };
    let attackArr = [];
    //for (let i = 0; i < panzerArr.length; i++)
    //{
    //    if (panzerArr[i].being==true)
    //    {
    //        updateImUnderGunPanzer(false, i, numCommand);
    //    }
    //} 
    var step = {numPanz:null,numPanzAttack:null,pointAttack:{xMap:null,yMap:null,dist:null},complete:0};
    var numPanzMinHP = null;
    var minHP = 100;
    var ExceptionNumPanz = [];
    var quantityPanzInCommand = [0, 0];
    function calcQuantityPanz()
    {
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].command == 0 && panzerArr[i].being== true) quantityPanzInCommand[0]++;
            if (panzerArr[i].command == 1 && panzerArr[i].being== true) quantityPanzInCommand[1]++;

        }

    }
    function calcNumPanzMinHP()
    {
        minHP = 100;
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].HP<=minHP && checkElemArr(ExceptionNumPanz,i)==false &&
                panzerArr[i].command!=numCommandStep)
            {
                numPanzMinHP = i;
                minHP = panzerArr[i].HP;
            }
        }
    }
    for (let i = 0; i < panzerArr.length;i++)// цикл по танкам которые ходят
    if (panzerArr[i].being==true && panzerArr[i].command==numCommandStep) // если танк есть и он в команде которая ходит
    {
        let obj = new attackObj();
        // расчитаем то что танк может аттаковать с места
        let xStart = panzerArr[i].centrX;// для удобства
        let yStart = panzerArr[i].centrY;
        let underGunArr = [];
     //   let flag = false;
        for (let k = 0; k < panzerArr.length;k++)// цикл по танкам которые надо аттаковать
        {
            if (panzerArr[k].being==true && panzerArr[k].command!=numCommandStep)// если танк для аттаки есть и он из другой команды
            {
                
                //if (visiblePointToPanzer(xStart, yStart, k)==true)// если из центра танка видно танк для атаки
                if (visiblePanzerToPanzer(i,k)==true)
                {
                   // console.log(1111111);
                   // alert(111);
                    underGunArr.push(k);
                   // flag = true;
                }
            }
            
        }
        obj.numPanz = i;
        obj.pointAttArr.push({ x: xStart, y: yStart, dist:0, gunArr:underGunArr });
        //attackArr.push(obj);
        
        searchRoute.spreadingWave(panzerArr[i].xMap, panzerArr[i].yMap,panzerArr[i].speed);// распространяем волну
        for (let j = 0; j < searchRoute.wavePointArr.length;j++)// цикл по точка волны
        {
            underGunArr = [];

            let x = searchRoute.wavePointArr[j].xMap * mapSize + mapSize / 2;// для удобства
            let y = searchRoute.wavePointArr[j].yMap * mapSize + mapSize / 2;
            let dist = searchRoute.wavePointArr[j].dist;
            for (let k = 0; k < panzerArr.length;k++)// цикл по танкам которые надо аттаковать
            {
                if (panzerArr[k].being==true && panzerArr[k].command!=numCommandStep)// если танк для аттаки есть и он из другой команды
                {
                    
                    if (visiblePointToPanzer(x, y, k)==true)// если из центра точки пути видно танк для атаки
                    {
                        
                        
                        underGunArr.push(k);
                    }
                    
                    
                }
            
            }
            obj.pointAttArr.push({ x: x, y: y,dist:dist, gunArr:underGunArr });
        }obj.numPanz = i;
        attackArr.push(obj);
    }
    console.log('ATTACKARR');
    console.log(attackArr);
    calcQuantityPanz();
    if (quantityPanzInCommand[0]>0 && quantityPanzInCommand[1]>0 && attackArr[0].numPanz!=null)
    {  
        let flag = false;
        do {
            flag = false;

            calcNumPanzMinHP();
            let minDist = 100;
            for (let i = 0; i < attackArr.length; i++) 
            {

                for (let j = 0; j < attackArr[i].pointAttArr.length; j++) 
                {
                    for (let k = 0; k < attackArr[i].pointAttArr[j].gunArr.length; k++) 
                    {
                        let point = attackArr[i].pointAttArr[j];
                        // console.log('k');
                        if (point.gunArr[k] == numPanzMinHP) 
                        {
                            ////   console.log('kkk');
                            if (minDist>=point.dist)
                            {
                                minDist = point.dist;
                                flag = true;
                                step.numPanz = attackArr[i].numPanz;
                                step.numPanzAttack = point.gunArr[k];
                                step.pointAttack.xMap = Math.trunc(point.x / mapSize);
                                step.pointAttack.yMap = Math.trunc(point.y / mapSize);
                                step.pointAttack.dist = point.dist;
                                step.complete = 0;
                            
                            }
                            //var step = {numPanz:null,numPanzAttack:null,pointAttack:{xMap:null,yMap:null,dist:null},complete:0};
                        }

                    }
                    //if (flag == true) break;

                }
                //if (flag == true) break;
            }
            if (flag == false) {
                ExceptionNumPanz.push(numPanzMinHP);
            }
        } while (flag == false && numPanzMinHP != null);
    }
    //visiblePointToPanzer(x,y,numPanzer)
    //for (let i = 0; i < panzerArr.length; i++)
    //if (panzerArr[i].being==true && panzerArr[i].command==numCommand)
    //{
    //    let obj = new attackObj();
    //    obj.numPanz = i;
    //    for (let j = 0;  j < panzerArr.length;j++) 
    //    if (panzerArr[j].being==true && i!=j)
    //    {
          
    //        if (panzerArr[j].command!=numCommand )
    //        {
    //            if (visiblePanzerToPanzer(i,j)==true)
    //            {
    //               obj.underGunArr.push(j);
    //                    // drawSprite(context,imageArr.get('AIM'),panzerArr[i].x,panzerArr[i].y,camera,1)
    //            }
    //        }
    //    }
    //    attackArr.push(obj);
    //}
   

    //let minHP = 100;
    //let num = 0;
    //let numPAtc = 0;
    //let flag = false;
    //for (let i = 0; i < attackArr.length;i++)
    //{
    //    if (attackArr[i].underGunArr.length>0)
    //    {
    //        for (let j = 0; j < attackArr[i].underGunArr.length;j++)
    //        {
    //            if (panzerArr[attackArr[i].underGunArr[j]].HP <= minHP)
    //            {
    //                minHP = panzerArr[attackArr[i].underGunArr[j]].HP;
    //                num = i;
    //                numPAtc = j;
    //                flag = true;
    //            }
    //        }
        
    //     //   break;
    //    }
    //}   
    //if (flag==true)
    //{
    //    step.numPanz = attackArr[num].numPanz;
    //    step.numPanzAttack = attackArr[num].underGunArr[numPAtc];
    //}
    //else
    //{
    //    step.numPanz = attackArr[0].numPanz;
    //    step.numPanzAttack = attackArr[0].underGunArr[0];
    //}

    console.log(attackArr);
    stepCommand[numCommand] = step;
    console.log(stepCommand);
    dataII=attackArr;
    console.log(dataII);
}
function nextStepCommand ()
{
    numCommandStep += 1;
    numCommandStep %= 2;
    if (autoGame == true && numCommandStep == 0) 
    {
        calcStepII(0);
    }
    else
    {
        calcStepII(1);
    }

}
function checkObjInCell(xCell,yCell)// есть ли обьект в этой клетке
{
    for (let i = 0; i < blockageArr.length;i++)
    {
        if (xCell==blockageArr[i].xMap && yCell==blockageArr[i].yMap)
        {
            return true;
        }
    }
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (xCell==panzerArr[i].xMap && yCell==panzerArr[i].yMap)
        {
            return true;
        }
    }
    return false;

}
function updateMapSearchRoute()// обновить карту для поиска пути
{
    searchRoute.initMap(mapWidth/mapSize,mapHeight/mapSize);
    for (let i = 0; i < blockageArr.length;i++)
    {
        searchRoute.changeMapXY(blockageArr[i].xMap, blockageArr[i].yMap, -1);
    }
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].being==true)
        searchRoute.changeMapXY(panzerArr[i].xMap, panzerArr[i].yMap, -2);
    }
    searchRoute.consoleMap();
}

function redactGameMap()// редактировать карту
{

    if (checkPressKey('Delete')==true || checkPressKey('KeyD')==true)
    {
        let objUnderMouse = calcUnderMouseObj();
        if (objUnderMouse.type=='blockage')
        {  
            blockageArr.splice(objUnderMouse.numInArr,1);
        }
        if (objUnderMouse.type=='panzer')
        {  
            if (numSelectPanzer!=objUnderMouse.numInArr)
            {
                panzerArr.splice(objUnderMouse.numInArr,1);
            }
           
        }
    }
    if (checkPressKey('KeyW')==true || checkPressKey('KeyA')==true ||
        checkPressKey('Digit1')==true || checkPressKey('Digit2')==true)
    {
        let objUnderMouse = calcUnderMouseObj();
        if (objUnderMouse.type==null)
        {
            if (checkPressKey('KeyW')==true || checkPressKey('KeyA')==true)
            {
                let type = null;
                if (checkPressKey('KeyW') == true) type = 0;
                if (checkPressKey('KeyA') == true) type = 1;
                var blockage = new Blockage(type, Math.trunc(mouseX / mapSize),Math.trunc( mouseY / mapSize));
                // panzer.draw(context,camera,1);
                blockage.lineArr=calcLineArr(blockage);
                blockageArr.push(blockage);
            }
            if (checkPressKey('Digit1')==true || checkPressKey('Digit2')==true)
            {
                let command = null;
                if (checkPressKey('Digit1') == true) command = 0;
                if (checkPressKey('Digit2') == true) command = 1;
                var panzer = new Panzer(command, Math.trunc(mouseX / mapSize),Math.trunc( mouseY / mapSize));
                panzer.being = true;
                // panzer.draw(context,camera,1);
                
                panzerArr.push(panzer);
                let len = panzerArr.length - 1;
                panzerArr[len].lineArr=calcLineArr(panzerArr[len],'panzer',len);
                updateImUnderGunPanzer();
                console.log(panzerArr);
            }
        }
    }
}
function calcUnderMouseObj()// расчитать что находится под указателем мыши
{
    let objUnderMouse = { type: null, numInArr: null };
    for (let i = 0; i < blockageArr.length;i++)
    {
        if (checkInObj(blockageArr[i], mouseX, mouseY)==true)
        {
            objUnderMouse.type = 'blockage';
            objUnderMouse.numInArr = i;
            break;
        }
    }
    for (let i = 0; i < panzerArr.length;i++)
    {
      //  if (checkInObj(panzerArr[i], mouseX, mouseY)==true)
        if (mouseX/mapSize > panzerArr[i].xMap && mouseX/mapSize < panzerArr[i].xMap+1 &&
            mouseY/mapSize > panzerArr[i].yMap && mouseY/mapSize < panzerArr[i].yMap+1)
        {
            objUnderMouse.type = 'panzer';
            objUnderMouse.numInArr = i;
            break;
        }
    }
    return objUnderMouse;
}
function visiblePointToPanzer(x,y,numPanzer)
{
    let panz = panzerArr[numPanzer];
    for (let i = 0; i < panzerArr.length;i++)
    {
        for (let j = 0; j < panzerArr[i].lineArr.length;j++)
        {
            if (panzerArr[i].being==true)
            {
                let line = panzerArr[i].lineArr[j];
                
                if (line.numP!=numPanzer/* && i!=numPanzer*/)
                {
                    if (IsCrossing(x,y,panz.centrX,panz.centrY,line.x,line.y,line.x1,line.y1)==true)
                    {
                        return false;
                    }
                }
                //else
                {
                    
                }
            }
        }
    }
    if (crossingTwoPoint(x,y,panz.centrX,panz.centrY)==true)
    {
        return false;
    }
    return true;
}
function crossingTwoPoint(x1,y1,x2,y2)// проверяет могут ли 2 точки соединиться по прямой без препятсвий стен
{
    for (let i = 0; i < blockageArr.length;i++)
    {
        if (blockageArr[i].type==0)
        {
          //alert(55);
            for (let j = 0; j < blockageArr[i].lineArr.length;j++)
            {
            
                let line = blockageArr[i].lineArr[j];
                if (IsCrossing(x1, y1, x2, y2,line.x,line.y,line.x1,line.y1)==true)
                {
                    return true;
                }
            }

        }
    }
    return false;
}
function crossLinePanzer(numPanz1,numPanz2)
{
    for (let i = 0; i < panzerArr.length;i++)
    {
        for (let j = 0; j < panzerArr[i].lineArr.length;j++)
        {
            if (panzerArr[i].being==true)
            {
                let line = panzerArr[i].lineArr[j];
                let panz1 = panzerArr[numPanz1];
                let panz2 = panzerArr[numPanz2];
                if (line.numP!=numPanz1 && line.numP!=numPanz2)
                {
                    if (IsCrossing(panz1.centrX, panz1.centrY,panz2.centrX, panz2.centrY,line.x,line.y,line.x1,line.y1)==true)
                    {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
function visiblePanzerToPanzer(numPanz1,numPanz2)// проверяет может ли танк увидеть другой танк.
{
    let panz1 = panzerArr[numPanz1];
    let panz2 = panzerArr[numPanz2];
    if (crossingTwoPoint(panz1.centrX, panz1.centrY,panz2.centrX, panz2.centrY)==false &&
        crossLinePanzer(numPanz1,numPanz2)==false)
    {
        return true;
    }
    return false;
}
function   IsCrossing( x1,  y1,  x2,  y2,  x3,  y3,  x4,  y4)// функция расчета пересечния двух прямых
{
    var a_dx = x2 - x1;
    var a_dy = y2 - y1;
    var b_dx = x4 - x3;
    var b_dy = y4 - y3;
    var s = (-a_dy * (x1 - x3) + a_dx * (y1 - y3)) / (-b_dx * a_dy + a_dx * b_dy);
    var t = (+b_dx * (y1 - y3) - b_dy * (x1 - x3)) / (-b_dx * a_dy + a_dx * b_dy);
    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
}