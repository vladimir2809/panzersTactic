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
var nameImageArr=["body0","body1",'tower4','wall','water'];
var imageLoad = false;
var countLoadImage = 0;
var panzerArr = [];
var blockageArr = [];
var speedMoveCamera = { x: 0, y: 0 };
var showDownCamera = 0.2;
var timePressMouseLeft = -1;
var timePressMouseOld = 0;
var flagMoveCamera = false;
var searchRoute=null;
var numSelectPanzer = null;
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
    this.moving = false;
    this.route = [];
    this.numPointRoute = null;
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
    this.startMovingByRoute=function (route)
    {
        this.moving = true;
        this.route = JSON.parse(JSON.stringify(route));
        this.numPointRoute = 1;
    }
    this.movingByRoute=function()
    {
        if (this.moving==true)
        {
            for (let i = 0; i < 5; i++)
            {
                let numP = this.numPointRoute;
                if (this.xMap<this.route[numP].xMap && this.yMap==this.route[numP].yMap)
                {
                    this.x++;
                }
                if (this.xMap>this.route[numP].xMap && this.yMap==this.route[numP].yMap)
                {
                    this.x--;
                }
                if (this.xMap==this.route[numP].xMap && this.yMap<this.route[numP].yMap)
                {
                    this.y++;
                }
                if (this.xMap==this.route[numP].xMap && this.yMap>this.route[numP].yMap)
                {
                    this.y--;
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
                        numSelectPanzer = null;
                        updateMapSearchRoute();
                        break;
                    }
           
                }
            }
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
//    srand(10);
    //context.scale(0.1, 0.1);
    //for (let i = 0; i < screenHeight / mapSize;i++)
    //{
    //    var panzer = new Panzer(0, 1, i);
    //   // panzer.draw(context,camera,1);
    //    panzerArr.push(panzer);
    //}
    for (let i = 0; i < 10;i++)
    {
        let xMap = randomInteger(0,(map.width/mapSize)-1);
        let yMap = randomInteger(0,(map.height/mapSize)-1);
        var panzer = new Panzer(0, xMap, yMap);
       // panzer.draw(context,camera,1);
        panzerArr.push(panzer);
    }
    for (let i = 0; i < 100;i++)
    {
        let xMap = randomInteger(0,(map.width/mapSize)-1);
        let yMap = randomInteger(0,(map.height/mapSize)-1);
        var blockage = new Blockage(randomInteger(0,1),xMap,yMap)
        // panzer.draw(context,camera,1);
        blockageArr.push(blockage);
    }
    searchRoute = new SearchRoute();
    searchRoute.initMap(map.width/mapSize,map.height/mapSize);
    let map2 = searchRoute.cloneMap();
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
function drawAll()
{
    context.fillStyle='rgb(210,210,210)';
    context.fillRect(0,0,camera.width,camera.height);// очистка экрана
    drawWaveRoute(context);
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
function drawWaveRoute(context)
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
                if (numSelectPanzer!=null && panzerArr[numSelectPanzer].moving==false) 
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
function drawPointRoute(context,x,y,dist,color)
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
function update()
{
    showDownCamera = 0.5;
    if (mouseLeftPress==true)// если нажата левая кнопка мыши
    {
        if (numSelectPanzer!=null)
        {
            for (let i = 0; i < searchRoute.wavePointArr.length;i++)
            {
                xPoint = searchRoute.wavePointArr[i].xMap;
                yPoint = searchRoute.wavePointArr[i].yMap;
                numPanz = numSelectPanzer;
                if ((mouseX>panzerArr[numPanz].xMap*mapSize && mouseX<panzerArr[numPanz].xMap*mapSize+mapSize &&
                    mouseY>panzerArr[numPanz].yMap*mapSize && mouseY<panzerArr[numPanz].yMap*mapSize+mapSize)==false)
                {
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
            if (checkInObj(panzerArr[i],mouseX,mouseY)==true)
            {
                searchRoute.spreadingWave(panzerArr[i].xMap,panzerArr[i].yMap, 30);
                numSelectPanzer = i;
             //   let route= searchRoute.getRoute(panzerArr[i].xMap,panzerArr[i].yMap, 100, 10,10);
               // panzerArr[i].startMovingByRoute(route);
                //console.log('Route Panzer');
                //console.log(route);


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
    for (let i = 0; i < panzerArr.length;i++)
    {
        panzerArr[i].movingByRoute();
    }
}
function moveCamera(speedX,speedY)
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

function updateMapSearchRoute()
{
    searchRoute.initMap(mapWidth/mapSize,mapHeight/mapSize);
    for (let i = 0; i < blockageArr.length;i++)
    {
        searchRoute.changeMapXY(blockageArr[i].xMap, blockageArr[i].yMap, -1);
    }
    for (let i = 0; i < panzerArr.length;i++)
    {
        searchRoute.changeMapXY(panzerArr[i].xMap, panzerArr[i].yMap, -2);
    }
    searchRoute.consoleMap();
}
