function MainMenu(){
    this.being = false;
    this.gameStart = false;
    this.timerId = null;
    this.x = 0;
    this.y = 0;
    this.widthOneItem = 380;
    this.heightOneItem = 80;
    this.dist = 15;
    this.listSelectMain = redactorOpen==false?['Играть', 'Авторы'/*, 'Помошь'*/, 'Выход']:
                                        ['Играть'/*,'Загрузить'*/,'Редактор', 'Авторы'/*, 'Помошь'*/, 'Выход'];
    this.listSelectNewGame = ['Да', 'Нет'];
    this.selectHower = null;
    this.numSelectHower = null;
    this.authorScreen = new AuthorScreen();
    this.loadMap = false;
    this.start=function()
    {
        //if (this.being==true)
        while (blockageArr.length > 0) blockageArr.splice(0,1);
        while (panzerArr.length > 0) panzerArr.splice(0,1);
        this.being = true;
        this.loadMap = false;
        levelBeingRedactor = false;
        dataRAMLevel = null;
        if (checkDataStorage()==true)
        {
            this.listSelectMain[0] = 'Продолжить';
        }
        this.y=200;
        this.x = screenWidth/2-this.widthOneItem/2;
        this.timerId=setInterval(function(){
          if (mainMenu.authorScreen.being==false) mainMenu.update(); 
        },20);
    }
    this.close=function()
    {
        this.being = false;
        clearInterval(this.timerId);
    }

    this.draw=function()
    {
        let x = this.x;
        let y = this.y;
        context.fillStyle='rgb(0,0,0)';
        context.fillRect(0,0,camera.width,camera.height);// очистка экрана
        context.fillStyle='rgb(0,255,0)';
        let strHeader = 'Panzers Tactic';
        context.font = '80px Arial';
        
        let widthTextHeid = context.measureText(strHeader).width;
        context.fillText(strHeader, screenWidth / 2 - widthTextHeid / 2, 110);
        //context.fillStyle='rgb(210,210,0)';
        context.strokeStyle = 'rgb(210,210,0)';
        let sizeFont = 60;
        context.font = sizeFont+"px Arial";
        context.fillStyle='#FF8800';
        for (let i = 0; i < this.listSelectMain.length;i++)
        {
            let widthText = context.measureText(this.listSelectMain[i]).width;
            context.save();
            context.strokeStyle = this.numSelectHower == i ? 'red' : 'blue';
            context.lineWidth = 3;
            context.strokeRect(x,y+i*(this.heightOneItem+this.dist),this.widthOneItem,this.heightOneItem);
            let addX = this.widthOneItem / 2 - widthText / 2;
            //console.log(addX);
            context.fillText(this.listSelectMain[i],x+addX,y+i*this.heightOneItem+this.dist*i+this.heightOneItem/2+sizeFont/3);
            context.restore();
        }
        this.authorScreen.draw();
    }
    this.update=function()
    {
        let mX = mouseX;//-mouseOffsetX;
        let mY = mouseY;//-mouseOffsetY;
        let x = this.x;
        let y = this.y;
        this.numSelectHower = null;
        this.selectHower = null;
        for (let i = 0;i<this.listSelectMain.length;i++)
        {
            if ( mX>x && mX<x+this.widthOneItem &&
                mY>y+i*(this.heightOneItem+this.dist)&&
                mY<y+i*(this.heightOneItem+this.dist)+ this.heightOneItem)
            {
                this.selectHower = this.listSelectMain[i];
                this.numSelectHower = i;

            }

        }
     //  console.log(this.numSelectHower);
        if (mouseLeftClick())
        {
            switch(this.selectHower)
            {
                case 'Играть': 
                case 'Продолжить': 
                    {
                        this.close();
                        redactorMode = false;
                        windowLevel.start();
                        
                    }break;
                case 'Загрузить':
                    {
                        var formFile=document.getElementById("formFile");
                        formFile.style.display="block";
                        redactorMode = false;
                        break;
                    }
                
                case 'Редактор': 
                    {
                        this.close();
                       // numSelectPanzer = null;
                        exitInRedactor();
                        //interface.select.type = null;
                        //interface.select.num = null;
                        //redactorMode = true;
                        
                    }break;
                case 'Авторы': 
                    {
                       // this.close();
                        this.authorScreen.start();
                       
                    } break;
                case 'Выход': window.close(); break;
            }
        }
        if (this.loadMap==false && dataRAMLevel!=null)
        {
            this.loadMap = true;
            loadGameMap(0,dataRAMLevel);
            //alert(222);
            this.close();
        }

    }    
}
function AuthorScreen()
{
    this.being = false;
    this.timerId = null;
    this.buttonMainMenu = { 
        width:330,
        height:40,
        x:null,
        y:null,
       
        colorText:'rgb(255,255,0)',
        text: 'Выйти в главное меню',
       

    }
    this.buttonMainMenu.x = screenWidth / 2 - this.buttonMainMenu.width / 2;
    this.buttonMainMenu.y =  530; 
    this.start=function()
    {
        //if (this.being==true)
        this.being = true;
        this.timerId=setInterval(function(){
           mainMenu.authorScreen.update(); 
        },20);
    }
    this.close=function()
    {
        this.being = false;
        clearInterval(this.timerId);
    }
    this.draw=function()
    {
        if (this.being==true)
        {
            context.fillStyle='rgb(0,0,0)';
            context.fillRect(0,0,camera.width,screenHeight/*camera.height*/);// очистка экрана
            context.fillStyle='rgb(255,255,0)';
            let strCount = 'Авторы';
            context.font = '50px Arial';
            let widthTextCount = context.measureText(strCount).width;
            context.fillText(strCount,screenWidth/2-widthTextCount/2,50) ;

            context.fillStyle='rgb(255,255,255)';
           // let strCount = 'Авторы';
            context.font = '30px Arial'
            //let widthTextCount = context.measureText(strCount).width;
            let y = 200;
            let yStep = 50;
            context.fillText('Разработчик: Владимир Костенко.', 30, y); 
            context.fillText('Источник некоторой графики и звуков:', 30, y+yStep); 
            context.fillText('1. https://opengameart.org', 30, y+yStep*2); 
            context.fillText('2. https://www.flaticon.com/free-icons/settings', 30, y+yStep*3); 

            context.strokeStyle = 'red'//"rgb(128,128,128)";
            context.strokeRect(this.buttonMainMenu.x,this.buttonMainMenu.y,
                            this.buttonMainMenu.width,this.buttonMainMenu.height);

            context.font = "32px serif";
            context.fillStyle = this.buttonMainMenu.colorText;
            context.fillText(this.buttonMainMenu.text,this.buttonMainMenu.x+8,this.buttonMainMenu.y+30)
        }
    }
    this.update=function()
    {
         //   
        if (mouseLeftClick()==true)
        {// alert(123);
            if (checkInObj(this.buttonMainMenu,mouseX,mouseY)==true)
            {
                this.close();
            }
        }
        
    }
}