var screenWidth = 800;
var screenHeight = 800;
var windowWidth=document.documentElement.clientWidth;
var windowHeight=document.documentElement.clientHeight;
var canvasWidth = 800;
var canvasHeight = 800;
var mapSize = 40;
var mapWidth = screenWidth * 1;
var mapHeight = screenHeight -mapSize*2;
var canvas = null;
var context = null;
var oldMouseX = null;
var oldMouseY = null;
var flagOldMouse = false;
var imageArr = new Map();
var nameImageArr=["body13","body12","body11","body21","body22","body23",'tower13','tower12','tower11',
                   'tower13','tower12','tower11','tower23','tower22','tower21',
                   'wall','water','AIM','arrow','arrowBack','video','lock','settings','Explosion',
                  'speakerOff',"speakerOn",'delete',"deleteBig",'menu'];
var imageLoad = false;
var countLoadImage = 0;
var soundOn = true;
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
var autoGame = false;
var pause = false;
var speedMotionPanz = 10;
var autoStepEnd = false;
var movePanzerGreen = false;// танк двигался в этом ходу
var quantityBackStep = 15;
var dataII = null;
var stepCommand = [null,null];
var autoAttack = false;
var listBackStep = [];
var backStepOne = [];
var gameLevel = 1;
var panzerMoveFlag = false;// выбранный танк в этом ходу двигался
var numPanzerDead = null;
var saveSelect = {numPanz:null,flag:false};
var quantityPanzInCommand = [0, 0];
var levelGameOpen = [1,]// список открытых уровней

for (let i = 2; i <= 25; i++) levelGameOpen.push(i);

var redactorOpen = true;
var redactorMode = false;
var levelGame = 0;// текуший уровень игры
var dataRAMLevel = null;// уровень в памяти
var levelBeingRedactor = false;
var line = { x:null, y:null, x1:null, y1:null, numP:null };// линия для вычесления пересечений
var audio = null;
var volumeSound = 0.5;
var countUpdate = 0;
var burst;
/* https://opengameart.org/ 
 <a href="https://www.flaticon.com/free-icons/settings" title="settings icons">Settings icons created by Freepik - Flaticon</a>*/
var map = {
    x:1,
    y:1,
    width: mapWidth,//canvasWidth,
    height: mapHeight,//canvasHeight,
}
var camera = {
    x:0,
    y:0,
    width: canvasWidth,
    height:canvasHeight-mapSize*2,
};
function Panzer(command,type,xMap,yMap)// класс танк
{
    this.xMap = xMap;
    this.yMap = yMap;
    this.command = command;
    this.type = type;
    this.width = panzerOption[type].width;
    this.height = panzerOption[type].height;
    this.x = xMap * mapSize+(mapSize/2-this.width/2);
    this.y = yMap * mapSize+(mapSize/2-this.height/2);
    this.bodyNameImage = panzerOption[type].bodyNameImage//this.command == 0 ? 'body13' : 'body23';
    this.towerNameImage = panzerOption[type].towerNameImage;
    this.angleBody = command == 0 ? 0 : 180;
    this.angleTower = command == 0 ? 0 : 180;
    this.towerX = null;// координаты башни 
    this.towerY = null;
    this.mixTowerX = panzerOption[type].mixTowerX;// смешение башни
    this.mixTowerY = panzerOption[type].mixTowerY;
    this.mixTowerPosX = panzerOption[type].mixTowerPosX;
    this.mixTowerPosY = panzerOption[type].mixTowerPosY;
    this.centrX = this.x + this.width / 2;// серидина танка
    this.centrY = this.y + this.height / 2;
    this.maxHP = panzerOption[type].maxHP;
    this.HP = this.maxHP;
    this.speed = panzerOption[type].speed;
    this.DMG = panzerOption[type].DMG;
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
    this.imSelect = false;
    this.timerFlashing = 0;
    this.lineArr = [];
    if (command==1)
    {
        let str=this.bodyNameImage;
        this.bodyNameImage=str.replace('body1','body2');;
        //str=this.towerNameImage;
        //this.towerNameImage=str.replace('tower1','tower2');;
    }
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
            if (this.imSelect==true)
            {
                this.timerFlashing++;
                let value = 50;
                if (this.timerFlashing<value)
                {
                    context.fillStyle = "rgba(255,0,0,0.5)";
                    context.fillRect(this.x,this.y,this.width,this.height);
                }
                if (this.timerFlashing >= value * 2) this.timerFlashing = 0;
            }
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
            
            for (let i = 0; i < speedMotionPanz; i++)
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
function Interface()// класс интерфейса внизу экрана
{
    this.being = true;
    this.x = 1;
    this.y = screenHeight - 2 * mapSize;
    this.width = screenWidth;
    this.height = 2 * mapSize;
    this.textLabel = '';
    this.powerCommand0 = 0;
    this.powerCommand1 = 0;
    this.sizeCell = 60;
    this.select = {num:null,name:null,type:null,nameImage:null,typePanzer:null,command:null};
    this.objArr=[
         {
            name: 'arrowGo',
            x: 550,//650
            y: 27+5,
            width: 60,
            height: 30,
            nameImage: 'arrow',
        },
        //{
        //    name:'arrowBack',
        //    x: 60,
        //    y: 22+5,
        //    width: 60,
        //    height: 45,
        //    nameImage: 'arrowBack',
        //},
        //{
        //    name:'videoButton',
        //    x: 205,
        //    y: 22+5,
        //    width: 60,
        //    height: 40,
        //    nameImage: 'video',
        //},
        {
            name: 'buttonSettings',
            x:380,
            y:20+5,
            width:60,
            height:60,
            nameImage:'settings',

        },
        {
            name: 'buttonSpeaker',
            x:170,//510
            y:12+5,
            width:60,
            height:60,
            nameImageArr:['speakerOn','speakerOff'],
        }
    ]
    this.objArrRedactor=[
        {
            name: 'wall',
            type:'blockage',
            x:20,
            y:25+5,
            width:40,
            height:40,
            nameImage:'wall',
        },
        {
            name: 'water',
            type:'blockage',
            x:20+this.sizeCell,
            y:25+5,
            width:40,
            height:40,
            nameImage:'water',
        },
        {
            name: 'delete',
            type:'delete',
            x:20+this.sizeCell*8,
            y:25+5,
            width:40,
            height:40,
            nameImage:'deleteBig',
        },
        {
            name: 'menu',
            type:'button',
            x:20+this.sizeCell*12,
            y:20+5,
            width:40,
            height:40,
            nameImage:'menu',
        },

        //{
        //    name: 'panzer11',
        //    type:'panzer',
        //    x:380,
        //    y:20+5,
        //    width:40,
        //    height:40,
        //    nameImage:'',
        //},
    ]
    for (let i = 0; i < 6;i++)
    {
        
        this.objArrRedactor.push({
            name: 'panzer'+(Math.trunc((i/3))+1)+''+((i%3)+1),
            type:'panzer',
            typePanzer: i % 3,
            command: Math.trunc((i / 3)),
            width:panzerOption[i % 3].width,
            height:panzerOption[i % 3].height,
            x:140+i*this.sizeCell,
            y:25+5,
            nameImage:'',
        });
        
    }
    for (let i = 0; i < this.objArrRedactor.length;i++)    
    {
        if (this.objArrRedactor[i].type =='panzer')
        {
            this.objArrRedactor[i].x += this.sizeCell/3-this.objArrRedactor[i].width / 2;
            this.objArrRedactor[i].y += this.sizeCell/3-this.objArrRedactor[i].height / 2;
        }
    }
    console.log(this.objArrRedactor);
    //var nameImageArr=["body13","body12","body11","body21","body22","body23",'tower13','tower12','tower11',
    //               'tower13','tower12','tower11','tower23','tower22','tower21',
    //               'wall','water','AIM','arrow','arrowBack','video','lock','settings','Explosion',
    //              'speakerOff',"speakerOn"];
    this.drawArrowGo = function () // нарисовать стрелку вперед
    {
        drawSprite(context,imageArr.get(this.arrowGo.nameImage),
                            this.x+this.arrowGo.x,this.y+this.arrowGo.y,camera,1)
    };
    this.drawArrowBack = function () // нарисовать стрелку отменить ход
    {
        drawSprite(context,imageArr.get(this.arrowBack.nameImage),
                            this.x+this.arrowBack.x,this.y+this.arrowBack.y,camera,1)
    };
    this.drawVideoButton = function () // нарисовать значок смотреть видео
    {
        drawSprite(context,imageArr.get(this.videoButton.nameImage),
                            this.x+this.videoButton.x,this.y+this.videoButton.y,camera,1)
    };
    this.drawSettings=function()
    {
         drawSprite(context,imageArr.get(this.buttonSettings.nameImage),
                            this.x+this.buttonSettings.x,this.y+this.buttonSettings.y,camera,1)
    }
    this.drawSpeaker=function(numImage)    
    {
         drawSprite(context,imageArr.get(this.buttonSpeaker.nameImageArr[numImage]),
                            this.x+this.buttonSpeaker.x,this.y+this.buttonSpeaker.y,camera,1)
    }
    this.drawCountBackStep=function()
    {
        context.beginPath();
        context.font = "25px serif";
        context.fillStyle = 'yellow';
        context.fillText('x' + quantityBackStep, this.x + this.objArr[1].x + this.objArr[1].width + 5
                         , this.y + this.objArr[1].y + 38);
        context.stroke();
    }
    this.draw=function ()
    {
        //context.fillStyle='rgb(150,70,0)';
        context.save();
        context.fillStyle='rgb(205,133,63)';
        context.fillRect(this.x,this.y,this.width,this.height);
        context.strokeStyle = 'rgb(150,70,0)';
        context.lineWidth = 3;
        context.strokeRect(this.x,this.y,this.width-2,this.height-2);
        context.restore();
        if (redactorMode==false)
        {
            for (let i = 0; i < this.objArr.length;i++)
            {

                if (this.objArr[i].name=='buttonSpeaker')
                {
                    let nameImg = this.objArr[i].nameImageArr[soundOn == true ? 0 : 1];
                    this.objArr[i].nameImage = nameImg;
                }
                drawSprite(context, imageArr.get(this.objArr[i].nameImage),
                    this.x + this.objArr[i].x, this.y + this.objArr[i].y, camera, 1);
            }
        }
        else
        {
            for (let i = 0; i < this.objArrRedactor.length;i++)
            {
                if (this.objArrRedactor[i].type!='panzer')
                {
                    drawSprite(context, imageArr.get(this.objArrRedactor[i].nameImage),
                                this.x + this.objArrRedactor[i].x, 
                                this.y + this.objArrRedactor[i].y, camera, 1);
                }
                else if (this.objArrRedactor[i].type=='panzer')
                {
                    //Panzer(command, type, xMap, yMap);
                    drawPanzer(this.x + this.objArrRedactor[i].x,this.y + this.objArrRedactor[i].y,
                        this.objArrRedactor[i].typePanzer,this.objArrRedactor[i].command)
                    //let panzer = new Panzer(this.objArrRedactor[i].command,
                    //                this.objArrRedactor[i].typePanzer,0,0);
                    //panzer.x = this.x + this.objArrRedactor[i].x;
                    //panzer.y = this.y + this.objArrRedactor[i].y;
                    //panzer.being = true;
                    //panzer.draw (context,camera,1);
                    //console.log(panzer);
                }
                if (this.select.num==i)
                {
                    context.save();
                    context.lineWidth = 3;
                    context.strokeStyle = "blue";
                    context.strokeRect(this.x+this.objArrRedactor[i].x,this.y+ this.objArrRedactor[i].y,
                                        this.objArrRedactor[i].width, this.objArrRedactor[i].height);
                    context.restore();
                }
            }
        }
       // this.drawCountBackStep();
        //this.drawArrowGo();
        //this.drawArrowBack();
        
        //this.drawVideoButton();
        //this.drawSettings();
        //this.drawSpeaker(soundOn == true ? 0 : 1);
        context.beginPath();
        context.font = "24px serif";
        context.fillStyle = 'white';
        context.fillText(this.textLabel, this.x +5, this.y +20);
        context.stroke();

        //context.beginPath();
        //context.font = "22px serif";
        //context.fillStyle = 'green';
        //context.fillText(this.powerCommand0, this.x +300, this.y +50);
        //context.stroke();

        //context.beginPath();
        //context.font = "22px serif";
        //context.fillStyle = 'red';
        //context.fillText(this.powerCommand1, this.x +450, this.y +50);
        //context.stroke();
    }
    this.calcPower=function()
    {
        this.powerCommand0 = 0;
        this.powerCommand1 = 0;
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].being==true)
            {
                if (panzerArr[i].command == 0) this.powerCommand0 += panzerArr[i].HP * panzerArr[i].DMG;
                if (panzerArr[i].command == 1) this.powerCommand1 += panzerArr[i].HP * panzerArr[i].DMG;
            }
        }
    }
    this.update=function()
    {
        
        let mouseIn = '';
        let flag = false;
        let commandPanz = null;
        let typePanz = null;
        if (redactorMode==false)
        {
            for (let i = 0; i < this.objArr.length;i++)
            {
                if (mouseX > this.x + this.objArr[i].x && 
                    mouseX < this.x + this.objArr[i].x +this.objArr[i].width &&
                    mouseY > this.y + this.objArr[i].y && 
                    mouseY < this.y + this.objArr[i].y +this.objArr[i].height )
                {
                    mouseIn = this.objArr[i].name;
                    flag = true;
                    //quantityBackStep--;
                }
            }
        }
        else
        {
            for (let i = 0; i < this.objArrRedactor.length;i++)
            {
                if (mouseX > this.x + this.objArrRedactor[i].x && 
                    mouseX < this.x + this.objArrRedactor[i].x +this.objArrRedactor[i].width &&
                    mouseY > this.y + this.objArrRedactor[i].y && 
                    mouseY < this.y + this.objArrRedactor[i].y +this.objArrRedactor[i].height )
                {
                 //   if(this.objArrRedactor[i].type!='panzer')
                    {
                        mouseIn = this.objArrRedactor[i].name;
                    }
                    //else
                    //{
                    //    mouseIn ='panzer';
                    //    commandPanz = this.objArrRedactor[i].command;
                    //    typePanz = this.objArrRedactor[i].typePanz;
                    //}
                
                    flag = true;
                    //quantityBackStep--;
                }
            }
        }
        if (flag==false)
        {
            mouseIn = 'none';

        }
    
        if (mouseLeftClick()==true)
        {
            let arr = [];
            if (mouseIn == 'arrowBack' && quantityBackStep>0 && listBackStep.length>0)
            {
                quantityBackStep--;
                panzerArr=listBackStep.pop();
                numSelectPanzer = null;
              //  searchRoute.deleteData();
            }
            if (mouseIn == 'arrowGo') 
            {
                if (movePanzerGreen==false)
                {
                    saveStepData(panzerArr);
                    addListBackStep();
                }
                nextStepCommand();
            }
            if (mouseIn == 'videoButton') { }
            if (mouseIn == 'buttonSettings') 
            {
                settings.start();
            }
            if (mouseIn == 'buttonSpeaker')
            {
                soundOn = !soundOn;
            }
            if (mouseIn == 'arrowGo' || mouseIn == 'arrowBack')
            {
               if (soundOn==true) audio.play('click');
            }
            if (redactorMode==true)
            {
                for (let i = 0; i < this.objArrRedactor.length;i++)
                {
                    if (mouseX > this.x + this.objArrRedactor[i].x && 
                        mouseX < this.x + this.objArrRedactor[i].x +this.objArrRedactor[i].width &&
                        mouseY > this.y + this.objArrRedactor[i].y && 
                        mouseY < this.y + this.objArrRedactor[i].y +this.objArrRedactor[i].height )
                    {
                        if (this.objArrRedactor[i].type!='button')
                        {
                            this.select.num = i;
                            this.select.type = this.objArrRedactor[i].type;
                            this.select.name = this.objArrRedactor[i].name;
                            this.select.nameImage = this.objArrRedactor[i].nameImage;
                            if (this.select.type=='panzer')
                            {
                                this.select.typePanzer = this.objArrRedactor[i].typePanzer;
                                this.select.command = this.objArrRedactor[i].command;
                            }
                            else
                            {
                                this.select.typePanzer =null;
                                this.select.command = null;
                            }
                        }
                        else if (this.objArrRedactor[i].type=='button' &&
                                this.objArrRedactor[i].name=='menu')
                        {
                            menuRedactor.start();
                        }

                        console.log(this.select);
                    }
                }
            }
           // resetMouseLeft();
            console.log('listBackStep');
            console.log(listBackStep);
            console.log('Arr');
            console.log(arr);
        }
        else
        {
            if (mouseIn == 'arrowBack')this.textLabel='Отменить ход';
            if (mouseIn == 'arrowGo') this.textLabel='Передать ход';
            if (mouseIn == 'videoButton') this.textLabel='Смотреть видео за 3 отмены ходов';
            if (mouseIn == 'buttonSettings') this.textLabel='Настройки';
            if (mouseIn == 'buttonSpeaker')
            {
                this.textLabel=soundOn==true?'Выключить звук':'Включить звук';
            }
            if (mouseIn == 'wall') this.textLabel='Выбрать стену';
            if (mouseIn == 'water') this.textLabel='Выбрать воду';
            if (mouseIn == 'panzer11') this.textLabel='Выбрать легкий танк команды зеленных';
            if (mouseIn == 'panzer12') this.textLabel='Выбрать средний танк команды зеленных';
            if (mouseIn == 'panzer13') this.textLabel='Выбрать тяжелый танк команды зеленных';
            if (mouseIn == 'panzer21') this.textLabel='Выбрать легкий танк команды красных';
            if (mouseIn == 'panzer22') this.textLabel='Выбрать средний танк команды красных';
            if (mouseIn == 'panzer23') this.textLabel='Выбрать тежылый танк команды красных';
            if (mouseIn == 'delete') this.textLabel='Удаление';
            if (mouseIn == 'menu') this.textLabel='Меню';
            

            if (mouseIn == 'none') this.textLabel='';
        }
        this.calcPower();
        

    }

}
function BigText()// класс большой текст
{
    this.being = false;
    this.count = 0;
    this.maxCount = 0;
    this.str = '';
    this.color = "#FF0000";
    this.value = null;
    this.draw = function ()
    {
        if (this.being==true)
        {
            context.font = "58px Arial";
            context.fillStyle=this.color;
            let widthText=context.measureText(this.str).width+10;
            let x=screenWidth/2-widthText/2;
            context.fillText(this.str,x,380);
        }
    }
    this.init= function (str,color,maxCount,value)
    {
        this.being=true;
        this.str=str;
        this.color=color;
        this.maxCount=maxCount;
        this.value=value;
        //pause=true;
    
    }
    this.control = function ()
    {
        if (this.being==true)
        {
            if (this.maxCount!=0) this.count++;
           // pause=true;
            if (this.count>=this.maxCount)
            {
                this.being=false;
                //pause=false;
                this.count=0;
                switch (this.value)
                {
                    case 1://  уровень пройден
                    {
                        //levelGame++;
                        if (levelBeingRedactor==false)
                        {    
                            if (checkElemArr(levelGameOpen,levelGame + 2)==false)
                            {
                                levelGameOpen.push(levelGame + 2);
                            
                            }
                            windowLevel.start();
                            autoGame = false;
                            saveDataStorage();
                        }
                        else
                        {  
                          //  redactorMode = true;
                            exitInRedactor();
                            loadGameMap(0, dataRAMLevel);
                       
                        }
                        
                    }
                    break;
                    case 2:// вы проиграли
                    {
                        if (levelBeingRedactor==false)
                        {
                            windowLevel.start();
                            autoGame = false;
                        }
                        else
                        {
                            //redactorMode = true;
                            exitInRedactor();
                            loadGameMap(0, dataRAMLevel);
                            
                        }

                    }
                    break;
                    case 3:// у красных нет хода
                    {
                        pause = false;

                    }
                    break;
                }
            }
        }
    }
    
}
function calcLineArr(objOrigin,type="blockage",numP=null)// расчитать массив линий для обьекта
{
   let lineArr=[];
   let obj=JSON.parse(JSON.stringify(objOrigin))
   if (type=='panzer')
   {
       obj.x = Math.trunc(obj.x / mapSize) * mapSize;
       obj.y = Math.trunc(obj.y / mapSize) * mapSize;
       obj.width=mapSize;
       obj.height=mapSize;
   }
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

    //setInterval(drawAll, 6);
    setInterval(function()  {
        if (mainMenu.being==false && windowLevel.being==false &&
            settings.being==false ) // если не открыты мени и окно выбора уровней
        {
            if ( redactorMode==false)
            {
                update();// основной цикл игры
            }
            else
            {
               if (menuRedactor.being==false) updateRedactor();
              //  console.log(menuRedactor.being);
            }

        }
        drawAll();
    },16);
    const file = document.getElementById('your-files');
    file.addEventListener("change", handleFiles);
    function handleFiles()
    {
        var form=document.getElementById('formFile');
        
        var fileOne=file.files[0];
        //console.log(fileOne);
        //objMap.loadMap(JSON.parse(localStorage.getItem('gameMap')));
     //   alert(readFile(file));
        var reader = new FileReader();
        reader.readAsText(fileOne);
        reader.onload = function() {
          //objMap.loadMap(JSON.parse(reader.result));
            dataRAMLevel = reader.result;//JSON.parse(reader.result);
            console.log(dataRAMLevel);
            if (menuRedactor.loadMap!=undefined)
            {
                menuRedactor.loadMap = true;
               // alert(111);
            }
        // alert(reader.result);
        }
        reader.onerror = function() {
        
            alert('ошибка загрузки карты');
        }
        //;
        
        file.value="";
        form.style.display='none';
   //     this.form.reset;
    }

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
    audio = new Howl({
        src: ['sound/sound.mp3'],
        volume: 0.5 ,
        sprite:{
            shot: [6566,1603],
            burstPanzer: [1,700], 
            click: [9678,265], 
            // soundTrack:[10*1000,4*60*1000,true]
        },
       
    //        onend: function () {
    //          console.log('Finished sound!');
    //     }
    });
   
   
}
function createRandomMap(quantityBlockage,quantityPanzer) // сгенировать случайную карту
{
    while (blockageArr.length > 0) blockageArr.splice(0,1);
    while (panzerArr.length > 0) panzerArr.splice(0,1);
    for (let i = 0; i < quantityPanzer;i++)// создать танки
    {
        let xMap = null;
        let yMap = null;
        do {
            xMap = randomInteger(0, (map.width / mapSize) - 1);
            yMap = randomInteger(0, (map.height / mapSize) - 1);
        } while (checkObjInCell(xMap, yMap) == true);
        var panzer = new Panzer(i % 2, randomInteger(0,2), xMap, yMap);
        panzer.being = true;
        panzer.lineArr=calcLineArr(panzer,'panzer',i);
       // panzer.draw(context,camera,1);
        panzerArr.push(panzer);
    }
    console.log(panzerArr);
   //saveStepData(panzerArr,false);
    for (let i = 0; i < quantityBlockage;i++)// создать препятствия
    {
        //let xMap = randomInteger(0,(map.width/mapSize)-1);
        //let yMap = randomInteger(0,(map.height/mapSize)-1);
        let xMap = null;
        let yMap = null;
        do {
            xMap = randomInteger(0, (map.width / mapSize) - 1);
            yMap = randomInteger(0, (map.height / mapSize) - 1);
        } while (checkObjInCell(xMap, yMap) == true);
        var blockage = new Blockage(Math.trunc(randomInteger(0,10)/8),xMap,yMap)
        // panzer.draw(context,camera,1);
        blockage.lineArr=calcLineArr(blockage);
        blockageArr.push(blockage);
    }
 //   updateMapSearchRoute();
}
function saveDataStorage()// сохранитиь данные в локальное хранилище
{
    localStorage.setItem('dataPanzersTactic',JSON.stringify({levelGameOpen:levelGameOpen,
                            volumeSound:volumeSound,speedMotionPanz:speedMotionPanz,
                            autoStepEnd:autoStepEnd}));
}
function readDataStorage()// считать данные из локального хранилища
{
    let data=localStorage.getItem('dataPanzersTactic');
    data = JSON.parse(data);
    console.log(data);
    if (Array.isArray(data.levelGameOpen)==true)
    {
        levelGameOpen = data.levelGameOpen;
    }
    if (typeof(data.volumeSound)=='number')
    {
        volumeSound = data.volumeSound;
        audio.volume(volumeSound);
    }
    if (typeof(data.speedMotionPanz)=='number')
    {
        speedMotionPanz = data.speedMotionPanz;
    }
    if (typeof(data.autoStepEnd)=='boolean')
    {
        autoStepEnd = data.autoStepEnd;
    }
}
function checkDataStorage()// проверить есть ли данные в локальном хранилише
{
    if (localStorage.getItem('dataPanzersTactic')==null ||
        localStorage.getItem('dataPanzersTactic')==undefined)
    {
        return false;
    }
    else
    {
        return true;
    }
}
function removeDataStorage()// удалить данные из локальнного хранилиша
{
    localStorage.removeItem('dataPanzersTactic');
}
function create() 
{
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    initKeyboardAndMouse(["Digit1", "Digit2","Digit3", "Digit4","Digit5", "Digit6", "KeyW",'KeyA',
                            "Delete",'KeyD','F2','KeyP','KeyL',,'KeyR']);
    updateSize();
    srand(1415);

   // loadGameMap(0);
    if (checkDataStorage()==true)
    {
        readDataStorage();
    }
    mainMenu = new MainMenu();
    mainMenu.start();
    menuRedactor = new MenuRedactor();
    windowLevel = new WindowLevel();
    searchRoute = new SearchRoute();
    searchRoute.initMap(map.width/mapSize,map.height/mapSize)
   // createRandomMap(100,18);
    bullets = new Bullets();
    interface = new Interface();
    bigText = new BigText();
    burst = new Burst();
    burst.init();
    settings = new Settings();
    settings.init();
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
    context.fillRect(0,0,camera.width,camera.height+interface.height);// очистка экрана
    if (mainMenu.being==true)
    {
        mainMenu.draw();
        return;
    }
    if (windowLevel.being==true)
    {
        windowLevel.draw();
        return;

    }
   
    drawWaveRoute(context);
    
    for (let i = 0; i < blockageArr.length;i++)
    {
        blockageArr[i].draw(context,camera,1);
        
    } 
    for (let i = 0; i < panzerArr.length;i++)
    {
        panzerArr[i].draw(context,camera,1);
        //if (panzerArr[i].being==true)   
        //{
        //    drawLineArr(panzerArr[i],"red")
  

        //};
    }
    //for (let i = 0; i < blockageArr.length; i++)
    //{
    //    drawLineArr(blockageArr[i])
    //}
    bullets.drawBullets(context);
 


    if (numSelectPanzer!=null &&panzerArr[numSelectPanzer].moving==false)
    {
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].imUnderGun==true)
            {
                drawSprite(context,imageArr.get('AIM'),panzerArr[i].xMap*mapSize,panzerArr[i].yMap*mapSize,camera,1)
            }
         
        }
           
    }   
   // drawDataII(context);
   // drawVisibleAttackLine(context);
    interface.draw();
    if (autoGame==true)
    {
        context.beginPath();
        context.font = "18px serif";
        context.fillStyle = 'yellow';
        context.fillText('AUTOGAME', 10, screenHeight - mapSize*2- 20);
        context.stroke();

    }
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].being==true)   
        {
            //drawLineArr(panzerArr[i],"red")
            let addY = 0;
            if (panzerArr[i].yMap==0)
            {
                addY = panzerArr[i].height + 7+3;
            }
            if (panzerArr[i].HP>0)
            {
                context.fillStyle= 'red';
                context.fillRect(panzerArr[i].x, panzerArr[i].y - 7+addY, panzerArr[i].width,4);
                context.fillStyle= 'green';
                context.fillRect(panzerArr[i].x, panzerArr[i].y - 7+addY,
                                panzerArr[i].width*panzerArr[i].HP/panzerArr[i].maxHP,4);
            }
        }
    }
    if (redactorMode==true )
    {
        if (menuRedactor.being==true)
        {
            menuRedactor.draw();
        }
        let select = interface.select;
        let xMap = Math.trunc(mouseX / mapSize);
        let yMap = Math.trunc(mouseY / mapSize);
        if (mouseY < interface.y && menuRedactor.being==false)
        {
            if (checkPressKey('Delete')==true || select.type=="delete" )
            {
                drawSprite(context,imageArr.get('delete'),xMap*mapSize+10,yMap*mapSize+10,camera,1)
            }
            else
            {
                if (select.type=="blockage")
                {
                    drawSprite(context,imageArr.get(select.nameImage),xMap*mapSize,yMap*mapSize,camera,1)
                }
                else if (select.type=="panzer")
                {
                    let x = xMap * mapSize + mapSize / 2 - panzerOption[select.typePanzer].width / 2;
                    let y = yMap * mapSize + mapSize / 2 - panzerOption[select.typePanzer].height / 2;
                    drawPanzer(x, y, select.typePanzer, select.command);
                }
                //else if (select.type=="delete")
                {
             //       drawSprite(context,imageArr.get('delete'),xMap*mapSize+10,yMap*mapSize+10,camera,1)
                }
            }
        }
       
    }
    bigText.draw();
    burst.draw();
    settings.draw();
   
}
function drawPanzer(x,y,type,command)
{
    let panzer = new Panzer(command,type,0,0);
    panzer.x = x;
    panzer.y = y;
    panzer.being = true;
    panzer.draw (context,camera,1);
}
function drawVisibleAttackLine(context)
{
    let colorLine = "red";
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
}

function drawDataII(context)
{
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
                    panzerArr[numSelectPanzer].command==0 &&
                    panzerArr[numSelectPanzer].attack==false &&
                    panzerArr[numSelectPanzer].attackThrow==false &&
                    panzerArr[numSelectPanzer].xMap!=searchRoute.xFinish && 
                    panzerArr[numSelectPanzer].yMap!=searchRoute.yFinish 
                    ) 
                {
                    drawPointRoute(context, x, y, dist, 'blue');
                }
            }

            if (stepCommand[0]!=null)
            {
                let xMap = stepCommand[0].pointAttack.xMap;
                let yMap = stepCommand[0].pointAttack.yMap;
                drawPointRoute(context, xMap, yMap, 0, 'yellow');
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
function saveStepData(arr,flagCommand=true)
{
   // if (flagCommand==false || numCommandStep==1)
    {
        panzerMoveFlag = false;
        let arrPanz = [];
        for (let i = 0; i < arr.length;i++)
        {
            let panz = {};
            for (var attr in arr[i])
            {
                panz[attr] = arr[i][attr];
            }
            arrPanz.push(panz);
        }
        backStepOne = arrPanz;
        //
    }
}
function addListBackStep()
{
    listBackStep.push(backStepOne);
}
function deleteListBackStep()
{
    while (this.listBackStep.length>0)
    {
        this.listBackStep.splice(0, 1);
    }
}
function updateRedactor ()
{
    interface.update();
    let select = interface.select;
    levelBeingRedactor = true;
    if (mouseLeftPress==true)
    {
        if (checkObjInCell(Math.trunc(mouseX/mapSize),Math.trunc(mouseY/mapSize))==false&&
            mouseY<interface.y)
        {
           if (select.type=='blockage')
           {
                let type = null;
                if (select.name=='wall') type = 0;
                if (select.name=='water') type = 1;
                var blockage = new Blockage(type, Math.trunc(mouseX / mapSize),Math.trunc( mouseY / mapSize));
                // panzer.draw(context,camera,1);
                blockage.lineArr=calcLineArr(blockage);
                blockageArr.push(blockage);
           }
           else if (select.type=='panzer')
           {
                var panzer = new Panzer(select.command,select.typePanzer, Math.trunc(mouseX / mapSize),
                                        Math.trunc( mouseY / mapSize));
                panzer.being = true;
                // panzer.draw(context,camera,1);
                
                panzerArr.push(panzer);
                console.log('NEW PANZER');
                let len = panzerArr.length - 1;
                panzerArr[len].lineArr=calcLineArr(panzerArr[len],'panzer',len);
                updateImUnderGunPanzer();
            }
            else if (select.type=='panzer')
            {
           

            }

        }  
        if (checkPressKey('Delete')==true || select.type=='delete')
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
    }
        
 
   
}
function update()// основной цикл игры
{
    showDownCamera = 0.5;
    if (mouseLeftPress==true)// если нажата левая кнопка мыши
    {
        if (pause == false)
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
                            mouseY>yPoint*mapSize && mouseY<yPoint*mapSize+mapSize && 
                            movePanzerGreen==false && panzerArr[numPanz].command==0)
                        {
                         //   saveStepData(panzerArr);
                            let route= searchRoute.getRoute(panzerArr[numPanz].xMap,panzerArr[numPanz].yMap,
                                        panzerArr[numPanz].speed, xPoint,yPoint);
                            panzerArr[numPanz].startMovingByRoute(route);
                            movePanzerGreen = true;
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
                            panzerArr[numPanz].command==0 && i!=numSelectPanzer && panzerArr[numPanz].attack == false /*&& flag==true*/ &&
                            panzerArr[numPanz].attackThrow==false && flagOldMouse==false /*&& movePanzerGreen==false*/)
                        {
                            if(movePanzerGreen==true)
                            {

                                if (visiblePanzerToPanzer(numPanz,i)==true)
                                {

                            
                                    panzerArr[numPanz].attack = true;
                                    panzerArr[numPanz].angleAim = angleIm(panzerArr[numPanz].centrX,
                                                                    panzerArr[numPanz].centrY, 
                                                                    panzerArr[i].centrX, panzerArr[i].centrY);
                                }
                            }
                            else
                            {
                                calcStepII(0,numPanz, i);
                                if (numCommandStep==0 && stepCommand[numCommandStep]==null)
                                {
                                    //nextStepCommand();
                                    bigText.init('Сюда нет пути!', 'red', 150, null);
                                    searchRoute.deleteData();
                                    searchRoute.spreadingWave(panzerArr[numPanz].xMap,panzerArr[numPanz].yMap,
                                                    panzerArr[numPanz].speed); 
                                    // autoAttack = false; 
                                    //bigText.start();
                                }
                                else
                                {
                          
                                } 
                                autoAttack = true;
                            }
                       
                            //stepCommand[0].complete = 0;
                      
                        
                        }
               
                    }
             
                    // если кликнули на не выбранный танк
                    if ((checkInObj(panzerArr[i],mouseX,mouseY)==true && panzerArr[i].command==0 &&
                        movePanzerGreen==false && flagOldMouse==false)
                        )
                    {
                        if (numSelectPanzer==null)  saveStepData(panzerArr);
                        updateMapSearchRoute();
                        searchRoute.spreadingWave(panzerArr[i].xMap,panzerArr[i].yMap,panzerArr[i].speed); 
                        if (saveSelect.numPanz!=null && saveSelect.flag==true && numCommandStep==0)
                        {
                            numSelectPanzer = saveSelect.numPanz;
                        }
                        else
                        {                    
                            numSelectPanzer = i;
                            saveSelect.numPanz = numSelectPanzer;
                        }
                        console.log(saveSelect);
                        saveSelect.flag = false;
                        
                        numCommandStep = 0;
                        updateImUnderGunPanzer();
                        panzerArr[i].attackThrow = false;
                     //   let route= searchRoute.getRoute(panzerArr[i].xMap,panzerArr[i].yMap, 100, 10,10);
                       // panzerArr[i].startMovingByRoute(route);
                        //console.log('Route Panzer');
                        //console.log(route);


                    }
            
                }
            
                if (numSelectPanzer==i)
                {
                    panzerArr[i].imSelect = true;
                }
                else
                {
                   panzerArr[i].imSelect = false; 
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
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (numSelectPanzer==i)
        {
            panzerArr[i].imSelect = true;
        }
        else
        {
            panzerArr[i].imSelect = false; 
        }
    }
    
    if (saveSelect.numPanz!=null && saveSelect.flag==true && numCommandStep==0)
    {
        if (numSelectPanzer==null)  saveStepData(panzerArr);
        updateMapSearchRoute();
       // searchRoute.spreadingWave(panzerArr[i].xMap,panzerArr[i].yMap,panzerArr[i].speed); 
      //  if (saveSelect.numPanz!=null && saveSelect.flag==true && numCommandStep==0)
        {
            numSelectPanzer = saveSelect.numPanz;
        }
        searchRoute.spreadingWave(panzerArr[numSelectPanzer].xMap,panzerArr[numSelectPanzer].yMap,
                                    panzerArr[numSelectPanzer].speed)
        //else
        //{                    
        //    numSelectPanzer = i;
        //    saveSelect.numPanz = numSelectPanzer;
        //}
        console.log(saveSelect);
        saveSelect.flag = false;
                        
        numCommandStep = 0;
        updateImUnderGunPanzer();
        panzerArr[numSelectPanzer].attackThrow = false;
    }
    if (numCommandStep==1 && stepCommand[numCommandStep]==null &&
        quantityPanzInCommand[0]>0 && quantityPanzInCommand[1]>0)
    {
        nextStepCommand();
        bigText.init('У красных нет хода!', 'red', 150, 3)
        pause = true;
        //bigText.start();
    }
    //if (numCommandStep==0 && numSelectPanzer!=null && autoAttack==true && stepCommand[numCommandStep]==null)
    //{
    //    //nextStepCommand();
    //    bigText.init('Сюда нет пути!', 'red', 150, null)
    //   // autoAttack = false; 
    //    //bigText.start();
    //}
    if (stepCommand[numCommandStep]!=null && stepCommand[numCommandStep].numPanz!=null )
    {
        if(stepCommand[numCommandStep].complete==2 )
        {
            stepCommand[numCommandStep].complete = 3;
            if (numCommandStep==1)saveSelect.flag = true;
            let numPanz = numSelectPanzer;// stepCommand[numCommandStep].numPanz;
            let numPAtc = stepCommand[numCommandStep].numPanzAttack;
            if (stepCommand[numCommandStep].numPanzAttack!=undefined && panzerArr[numPanz].attackThrow==false)
            {
                panzerArr[numPanz].attack = true;
            //    alert(54);
                panzerArr[numPanz].angleAim = angleIm(panzerArr[numPanz].centrX, panzerArr[numPanz].centrY, 
                                                            panzerArr[numPAtc].centrX, panzerArr[numPAtc].centrY);
            }
        //    }
        //    else
        //    {
        //       /// numCommandStep = 1;
        //       // calcStepII(1);
        ////       nextStepCommand();
        //    }
        }
        if (stepCommand[numCommandStep].complete==0)
        { 
          //  saveStepData(panzerArr);
            let numPanz = stepCommand[numCommandStep].numPanz;
            numSelectPanzer = numPanz; 
            let step = stepCommand[numCommandStep];
            updateImUnderGunPanzer();
            panzerArr[numPanz].attackThrow = false;
            if ((panzerArr[numPanz].xMap==step.pointAttack.xMap &&
                panzerArr[numPanz].yMap==step.pointAttack.yMap)==false  /*|| stepCommand[numCommandStep].attack==false*/)
            {
                stepCommand[numCommandStep].complete = 1;
                updateMapSearchRoute();
                let route= searchRoute.getRoute(panzerArr[numPanz].xMap,panzerArr[numPanz].yMap, panzerArr[numPanz].speed, 
                                                 step.pointAttack.xMap,step.pointAttack.yMap);
         

                panzerArr[numPanz].startMovingByRoute(route); 
            }
            else
            {
               stepCommand[numCommandStep].complete = 2;
            }  
            if (numCommandStep == 0)
            {
                console.log('PUTESHESTVIE '+countUpdate);//alert(123);
                console.log('PUTESHESTVIE '+JSON.stringify(stepCommand[numCommandStep]));
            }
            
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
                if (numCommandStep == 0)
                {
                    addListBackStep();
                    panzerMoveFlag = true;
                }
                if (visiblePanzForAttack(numSelectPanzer)==false && autoStepEnd==true && 
                    numCommandStep == 0 && autoGame==false)
                {
                    nextStepCommand();
                }
                if (stepCommand[numCommandStep]!=null && stepCommand[numCommandStep].complete==1)
                {
                    stepCommand[numCommandStep].complete = 2; 
                    if ( stepCommand[numCommandStep].attack==false)
                    {
                        stepCommand[numCommandStep].complete = 3;
                         if (numCommandStep==1) saveSelect.flag = true;
                        //if (numCommandStep==1 /*&& autogame==false*/) 
                       // saveStepData(panzerArr);
                        nextStepCommand();
                       

                    }
                }
               
            });
        }
    }
    if (numSelectPanzer==null)
    {
        for (let i = 0; i < panzerArr.length;i++)
        {
            panzerArr[i].imSelect = false; 
        }
    }
    // поведение прицеливания выбранного танка и стрельба
    if (numSelectPanzer!=null)
    {
        let numPanz = numSelectPanzer;
        if (  panzerArr[numPanz].attack==true && panzerArr[numPanz].attackThrow == false)
        {
            let angleAim = panzerArr[numPanz].angleAim;
            panzerArr[numPanz].angleTower = movingToAngle(panzerArr[numPanz].angleTower,angleAim,30);
            if (Math.abs(panzerArr[numPanz].angleTower-angleAim)<0.5)
            {
                panzerArr[numPanz].tookAim = true;
            }
            if (panzerArr[numPanz].tookAim==true)
            {
                bullets.shot(panzerArr[numPanz].centrX, panzerArr[numPanz].centrY,
                            panzerArr[numPanz].angleTower,panzerArr[numPanz].DMG );
                if (soundOn==true) audio.play("shot");
                panzerArr[numPanz].attack = false;
                panzerArr[numPanz].attackThrow = true;
                panzerArr[numPanz].tookAim = false;
                console.log('angleTower='+panzerArr[numPanz].angleTower);
                console.log('angleAIM='+panzerArr[numPanz].angleAim);
                
            }
        }
    }

    burst.end(function () {
        if (numPanzerDead!=null)
        {
            panzerArr[numPanzerDead].being = false;
            numPanzerDead = null;
            //burst.start(panzerArr[j].centrX, panzerArr[j].centrY);
            updateMapSearchRoute();
            calcQuantityPanz();
           // audio.play("burstPanzer");
            if (quantityPanzInCommand[0]==0)
            {
                bigText.init('Вы проиграли!', 'red', 200, 2);
            }
            if (quantityPanzInCommand[1]==0)
            {
                bigText.init('Уровень пройден!', 'green', 200, 1);
                //saveDataStorage();
            }
            nextStepCommand();
        }
    });
    bullets.update();
    collisioinBulets();
    interface.update();
   // ControllKeyBoard();
    bigText.control();
    burst.update();
    countUpdate++;
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
function visiblePanzForAttack(numPanz)
{
    
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[numPanz].command!=panzerArr[i].command && panzerArr[i].being==true)
        {
            if (visiblePanzerToPanzer(numPanz,i)==true)
            {
                return true;
            }
        }
    }
    
    return false;

}
function collisioinBulets()// столкновение пуль с обьектами игры
{      
    for (let i = 0; i < bullets.bulletArr.length;i++)
    {   
        if (bullets.bulletArr[i].being==true)
        {
            for (let j = 0; j < blockageArr.length; j++)
            {  //
                if ( blockageArr[j].type==0 && checkInObj(blockageArr[j], 
                    bullets.bulletArr[i].x, bullets.bulletArr[i].y)==true)
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
                   // saveStepData(panzerArr);
                    panzerArr[j].HP -= bullets.bulletArr[i].DMG;
                    bullets.kill(i);
                    numSelectPanzer = null;
                    if (numCommandStep == 0 && panzerMoveFlag==false)
                    {
                        addListBackStep();
                    }
                    if (panzerArr[j].HP<=0)
                    {
                        //panzerArr[j].being = false;
                        burst.start(panzerArr[j].centrX, panzerArr[j].centrY);
                        numPanzerDead = j;
                        if (saveSelect.numPanz == j) saveSelect.numPanz = null;
                        if (soundOn==true)  audio.play("burstPanzer");
                        //updateMapSearchRoute();
                        //calcQuantityPanz();
                        
                        //if (quantityPanzInCommand[0]==0)
                        //{
                        //    bigText.init('Вы проиграли!', 'red', 500, 2);
                        //}
                        //if (quantityPanzInCommand[1]==0)
                        //{
                        //    bigText.init('Уровень пройден!', 'green', 500, 1);
                        //}
                        
                    }
                    else
                   // if (stepCommand[numCommandStep].attack==true && stepCommand[numCommandStep].complete==3)
                    {
                        //if (numCommandStep==1 /*&& autogame==false*/) 
                   
                        nextStepCommand();
                      
                    }
                    updateImUnderGunPanzer();
                    //calcStepII(1);
                //    alert(589);
          
                }
            }
        }

    }
}
function exitInRedactor()
{
    numSelectPanzer = null;
    searchRoute.deleteData();
    interface.select.type = null;
    interface.select.num = null;
   // if (redactorMode==true)loadGameMap(0,dataRAMLevel);
    redactorMode = true;
}
function calcQuantityPanz()
{
    quantityPanzInCommand[0] = 0;
    quantityPanzInCommand[1] = 0;
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].command == 0 && panzerArr[i].being== true) quantityPanzInCommand[0]++;
        if (panzerArr[i].command == 1 && panzerArr[i].being== true) quantityPanzInCommand[1]++;

    }

}

function calcStepII(numCommand,numPanzStep=null,numPanzForAttack=null)
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
    var step = {numPanz:null,numPanzAttack:null,attack:true,pointAttack:{xMap:null,yMap:null,dist:null},complete:0};
    var numPanzValueAtt = null;
    var maxValueAtt = 0;
    var ExceptionNumPanz = [];
    let flagVisible = false;
    stepCommand[numCommand] = null;
    function calcNumPanzValueAtt()
    {
        maxValueAtt = 0;
        for (let i = 0; i < panzerArr.length;i++)
        if (panzerArr[i].being==true)
        {
            let valueAtt = panzerArr[i].HP > 0 ? panzerArr[i].maxHP / panzerArr[i].HP * panzerArr[i].DMG : 0;
            if (valueAtt>=maxValueAtt && checkElemArr(ExceptionNumPanz,i)==false &&
                panzerArr[i].command!=numCommandStep)
            {
                numPanzValueAtt = i;
                maxValueAtt = valueAtt;
            }
            console.log('panz['+i+'].valueAtt='+valueAtt);
        }
    }
    function calcAttackArr(distWave=null) 
    {
        while (attackArr.length > 0) attackArr.splice(0,1);;
    
        for (let i = 0; i < panzerArr.length;i++)// цикл по танкам которые ходят
        if (panzerArr[i].being==true && panzerArr[i].command==numCommandStep) // если танк есть и он в команде которая ходит
        {
            let obj = new attackObj();
            // расчитаем то что танк может аттаковать с места
            let xStart = panzerArr[i].centrX;// для удобства
            let yStart = panzerArr[i].centrY;
            let underGunArr = [];
         //   let flag = false;
            if (numPanzForAttack==null)
            {

            
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
                            obj.numPanz = i;
                            flagVisible = true;
                           // flag = true;
                        }
                    }
            
                }
            }
            else if (numPanzForAttack!=null)
            {
                if (numPanzStep!=null && numPanzForAttack!=null &&
                    visiblePanzerToPanzer(numPanzStep,numPanzForAttack)==true)
                {
                    // console.log(1111111);
                    // alert(111);
                    xStart = panzerArr[numPanzStep].centrX;// для удобства
                    yStart = panzerArr[numPanzStep].centrY;
                    underGunArr.push(numPanzForAttack);
                    obj.numPanz = numPanzStep;
                    flagVisible = true;
                    //alert(5215);
                    // flag = true;
                }
            }
            //if (flagVisible==true) 
                obj.pointAttArr.push({ x: xStart, y: yStart, dist:0, gunArr:underGunArr });
            //attackArr.push(obj);
            if (numPanzForAttack==null)
            {
                searchRoute.spreadingWave(panzerArr[i].xMap, panzerArr[i].yMap,
                                            distWave==null? panzerArr[i].speed:distWave);// распространяем волну
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
                                flagVisible = true;
                                //alert();
                            }
                    
                    
                        }
            
                    }
                    obj.pointAttArr.push({ x: x, y: y,dist:dist, gunArr:underGunArr });
                }
                
                
            }
            else if (numPanzForAttack!=null && numPanzStep==i)
            {
                searchRoute.spreadingWave(panzerArr[numPanzStep].xMap, panzerArr[numPanzStep].yMap,
                                        distWave==null? panzerArr[numPanzStep].speed:distWave);// распространяем волну
                 for (let j = 0; j < searchRoute.wavePointArr.length;j++)// цикл по точка волны
                 {
                    underGunArr = [];

                    let x = searchRoute.wavePointArr[j].xMap * mapSize + mapSize / 2;// для удобства
                    let y = searchRoute.wavePointArr[j].yMap * mapSize + mapSize / 2;
                    let dist = searchRoute.wavePointArr[j].dist;
                    if (visiblePointToPanzer(x, y, numPanzForAttack)==true)// если из центра точки пути видно танк для атаки
                    {
                        underGunArr.push(numPanzForAttack);   
                        flagVisible = true;
                        console.log(numPanzForAttack);
                        //alert(12);
                    } 
                    obj.pointAttArr.push({ x: x, y: y,dist:dist, gunArr:underGunArr });
                 }
               

            }
                    
            obj.numPanz = numPanzStep == null ? i : numPanzStep;
            //obj.numPanz = i ;
            attackArr.push(obj);
        }
    
        //if (numPanzForAttack!=null)
        //{
        //    if (visiblePanzerToPanzer(numPanz,numPanzForAttack)==true)
        //    {
        //    }
        //}
    }
   
    
    calcAttackArr();
    if (attackArr[0]!=null && attackArr[0].numPanz!=null)
    {
        if (flagVisible==true)
        {
            console.log('ATTACKARR');
            console.log(attackArr);
            calcQuantityPanz();
            if (quantityPanzInCommand[0]>0 && quantityPanzInCommand[1]>0 && attackArr[0].numPanz!=null)
            {  
                let flag = false;
                do
                {
                    flag = false;
                    calcNumPanzValueAtt();
                    let minDist = 100;
                    var maxDMG = 0;
                    for (let i = 0; i < attackArr.length; i++) 
                    {

                        for (let j = 0; j < attackArr[i].pointAttArr.length; j++) 
                        {
                            for (let k = 0; k < attackArr[i].pointAttArr[j].gunArr.length; k++) 
                            {
                                let point = attackArr[i].pointAttArr[j];
                               // console.log('k');
                                if (numPanzForAttack==null)
                                {
                                    if (point.gunArr[k] == numPanzValueAtt) 
                                    {
                                        // console.log('kkk');
                                        if (minDist>=point.dist &&
                                            maxDMG<=panzerArr[attackArr[i].numPanz].DMG)
                                        {
                                            minDist = point.dist;
                                            maxDMG = panzerArr[attackArr[i].numPanz].DMG;
                                            flag = true;
                                            step.numPanz = attackArr[i].numPanz;
                                            step.numPanzAttack = point.gunArr[k];
                                            step.attack = true;
                                            step.pointAttack.xMap = Math.trunc(point.x / mapSize);
                                            step.pointAttack.yMap = Math.trunc(point.y / mapSize);
                                            step.pointAttack.dist = point.dist;
                                            step.complete = 0;
                            
                                        }
                                        //var step = {numPanz:null,numPanzAttack:null,pointAttack:{xMap:null,yMap:null,dist:null},complete:0};
                                    }
                                }
                                else if (numPanzForAttack!=null)
                                {
                                    if (point.gunArr[k] == numPanzForAttack) 
                                    {
                                        if (minDist>=point.dist)
                                        {
                                            minDist = point.dist;
                                            flag = true;
                                            step.numPanz = attackArr[i].numPanz;
                                            step.numPanzAttack = numPanzForAttack//point.gunArr[k];
                                            step.attack = true;
                                            step.pointAttack.xMap = Math.trunc(point.x / mapSize);
                                            step.pointAttack.yMap = Math.trunc(point.y / mapSize);
                                            step.pointAttack.dist = point.dist;
                                            step.complete = 0;
                                        }

                                    }
                                }

                            }
                            //if (flag == true) break;

                        }
                        //if (flag == true) break;
                    }
                    if (flag == false) 
                    {
                        ExceptionNumPanz.push(numPanzValueAtt);
                    }
                }while (flag == false && numPanzValueAtt != null);
            }
            stepCommand[numCommand] = step;
        }
        else 
        {
            calcAttackArr(100);
            let flag = false;
            let minWavePoint = 100;
            let minPoint = { numPanz: null, point: { xMap: null, yMap: null, dist: null } };
            let route = null;
            for (let i = 0; i < attackArr.length; i++) 
            if (attackArr[i].numPanz!=null)
            {
                for (let j = 0; j < attackArr[i].pointAttArr.length; j++) 
                {
                    if (attackArr[i].pointAttArr[j].gunArr.length>0)
                    {
                         let panzUnderGun = attackArr[i].pointAttArr[j].gunArr[0];
                         if ( /*panzerArr[panzUnderGun].command!=numCommandStep &&*/
                            minWavePoint>=attackArr[i].pointAttArr[j].dist)
                         {
                            minWavePoint = attackArr[i].pointAttArr[j].dist;
                            minPoint.numPanz = attackArr[i].numPanz;
                            minPoint.point.xMap = Math.trunc(attackArr[i].pointAttArr[j].x / mapSize);
                            minPoint.point.yMap = Math.trunc(attackArr[i].pointAttArr[j].y / mapSize);
                            minPoint.point.dist = attackArr[i].pointAttArr[j].dist;
                            flag = true;
                         }
                    }
                }
            } 
            if (flag==true)
            {
                console.log("COMMANDSTEP "+numCommandStep);
                console.log('attackArr');
                console.log(attackArr);
             
                console.log('MInPoint');
                console.log(minPoint);
                updateMapSearchRoute();
                let numPanz = minPoint.numPanz;
                route=searchRoute.getRoute(panzerArr[numPanz].xMap,panzerArr[numPanz].yMap,minPoint.point.dist, 
                        minPoint.point.xMap,minPoint.point.yMap);
                ///route=searchRoute.getRoute(1,1, 10, 2,10);
                console.log('route');
                console.log(route);
          
            
   
                step.numPanz = minPoint.numPanz;
                step.numPanzAttack =null;
                step.attack = false;
                step.pointAttack.xMap = route[panzerArr[numPanz].speed-1].xMap;
                step.pointAttack.yMap = route[panzerArr[numPanz].speed-1].yMap;
                step.pointAttack.dist = panzerArr[numPanz].speed;
                step.complete = 0;

                stepCommand[numCommand] = clone(step);
            }
        }
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
   

    //let maxValueAtt = 100;
    //let num = 0;
    //let numPAtc = 0;
    //let flag = false;
    //for (let i = 0; i < attackArr.length;i++)
    //{
    //    if (attackArr[i].underGunArr.length>0)
    //    {
    //        for (let j = 0; j < attackArr[i].underGunArr.length;j++)
    //        {
    //            if (panzerArr[attackArr[i].underGunArr[j]].HP <= maxValueAtt)
    //            {
    //                maxValueAtt = panzerArr[attackArr[i].underGunArr[j]].HP;
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
    console.log("stepCommand");
    console.log(stepCommand);
    dataII=attackArr;
    console.log(dataII);
}
function nextStepCommand ()
{
    numCommandStep += 1;
    numCommandStep %= 2;
    numSelectPanzer = null;
    movePanzerGreen = false;
    if (autoGame == true && numCommandStep == 0) calcStepII(0);
  
    if (numCommandStep == 1)   calcStepII(1); 
  //  saveStepData(panzerArr);
    

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
 //   searchRoute.consoleMap();
}
function createDataLevel()
{
    let dataPanzer = [];
    let dataBlockage = [];
    for (let i = 0; i < blockageArr.length;i++)
    {
        //if (blockageArr[i].being==true)
        {
            dataBlockage.push({xMap:blockageArr[i].xMap,yMap:blockageArr[i].yMap,type:blockageArr[i].type});
        }

    }
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].being==true)
        {
            dataPanzer.push({xMap:panzerArr[i].xMap,yMap:panzerArr[i].yMap,
                    command:panzerArr[i].command,type:panzerArr[i].type});
        }

    }
    return JSON.stringify({blockage:dataBlockage,panzer:dataPanzer});
}
function ControllKeyBoard()// редактировать карту
{

    if (keyUpDuration('F2',500)==true)
    {
        autoGame = !autoGame;
        if (autoGame==true) calcStepII(numCommandStep);
    }
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
    if (keyUpDuration('KeyR',1000)==true)
    {
        createRandomMap(115,0 );
    }
    if (checkPressKey('KeyW')==true || checkPressKey('KeyA')==true ||
        checkPressKey('Digit1')==true || checkPressKey('Digit2')==true||
        checkPressKey('Digit3')==true || checkPressKey('Digit4')==true||
        checkPressKey('Digit5')==true || checkPressKey('Digit6')==true)
    {
        let objUnderMouse = calcUnderMouseObj();
        if (objUnderMouse.type==null && mouseY<mapHeight)
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
            if (checkPressKey('Digit1')==true || checkPressKey('Digit2')==true||
                checkPressKey('Digit3')==true || checkPressKey('Digit4')==true||
                checkPressKey('Digit5')==true || checkPressKey('Digit6')==true)
            {
                let command = null;
                let type = null;
               // (str,color,maxCount,value)
                bigText.init('Вы установили танк','green',300,3);
                if (checkPressKey('Digit1') == true ||
                    checkPressKey('Digit2') == true||checkPressKey('Digit3') == true) 
                {
                    command = 0;
                }
                if (checkPressKey('Digit4') == true ||
                    checkPressKey('Digit5') == true||checkPressKey('Digit6') == true)
                {
                    command = 1;
                }
                if (checkPressKey('Digit1') == true || checkPressKey('Digit4') == true) type = 0;
                if (checkPressKey('Digit2') == true || checkPressKey('Digit5') == true) type = 1;
                if (checkPressKey('Digit3') == true || checkPressKey('Digit6') == true) type = 2;
                var panzer = new Panzer(command,type, Math.trunc(mouseX / mapSize),Math.trunc( mouseY / mapSize));
                panzer.being = true;
                // panzer.draw(context,camera,1);
                
                panzerArr.push(panzer);
                console.log('NEW PANZER');
                let len = panzerArr.length - 1;
                panzerArr[len].lineArr=calcLineArr(panzerArr[len],'panzer',len);
                updateImUnderGunPanzer();
                console.log(panzerArr);
            }
        }
    }
   
    if (keyUpDuration('KeyP',500)==true)
    {
        //let data = {};
        //let dataPanzer = [];
        //let dataBlockage = [];
        //for (let i = 0; i < blockageArr.length;i++)
        //{
        //    //if (blockageArr[i].being==true)
        //    {
        //        dataBlockage.push({xMap:blockageArr[i].xMap,yMap:blockageArr[i].yMap,type:blockageArr[i].type});
        //    }

        //}
        //for (let i = 0; i < panzerArr.length;i++)
        //{
        //    if (panzerArr[i].being==true)
        //    {
        //        dataPanzer.push({xMap:panzerArr[i].xMap,yMap:panzerArr[i].yMap,
        //                command:panzerArr[i].command,type:panzerArr[i].type});
        //    }

        //}
        //data = JSON.stringify({blockage:dataBlockage,panzer:dataPanzer});
        data = createDataLevel();
        downloadAsFile(data);
    }
    if (keyUpDuration('KeyL',500)==true)
    {
        loadGameMap(0);
    }
    if (keyUpDuration('KeyX',500)==true)
    {
        dataRAMLevel = [];
        dataRAMLevel = createDataLevel();
        bigText.init('уровень сохранен в ОЗУ',"yellow",200,3);
        console.log(dataRAMLevel);
    }
    if (keyUpDuration('KeyZ',500)==true)
    {
        loadGameMap(0,dataRAMLevel);
    }

    
}
function loadGameMap(numMap,dataRAM=null)
{
    while (blockageArr.length > 0) blockageArr.splice(0,1);
    while (panzerArr.length > 0) panzerArr.splice(0,1);
    searchRoute.deleteData();
    deleteListBackStep();
    numSelectPanzer = null;
    numCommandStep = 0;
    let data = dataRAM==null?mapArr[numMap]:JSON.parse(dataRAM);
    for (let i = 0; i < data.panzer.length;i++)
    {
        var panzer = new Panzer(data.panzer[i].command,/*randomInteger(0,2)*/data.panzer[i].type, 
                        data.panzer[i].xMap, data.panzer[i].yMap);
        panzer.being = true;
        panzer.lineArr=calcLineArr(panzer,'panzer',i);
        // panzer.draw(context,camera,1);
        panzerArr.push(panzer);
    
        console.log(panzerArr);
    }
    for (let i = 0; i < data.blockage.length;i++)// создать препятствия
    {
        
        var blockage = new Blockage(data.blockage[i].type,
                            data.blockage[i].xMap,data.blockage[i].yMap)
        // panzer.draw(context,camera,1);
        blockage.lineArr=calcLineArr(blockage);
        blockageArr.push(blockage);
    }
    updateMapSearchRoute();
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
        if (mouseX/mapSize >= panzerArr[i].xMap && mouseX/mapSize < panzerArr[i].xMap+1 &&
            mouseY/mapSize >= panzerArr[i].yMap && mouseY/mapSize < panzerArr[i].yMap+1)
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
                    if (IsCrossing(panz1.centrX, panz1.centrY,panz2.centrX, panz2.centrY,
                        line.x,line.y,line.x1,line.y1)==true)
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