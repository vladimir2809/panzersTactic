function MainMenu(){
    this.being = false;
    this.gameStart = false;
    this.timerId = null;
    this.x = 0;
    this.y = 0;
    this.widthOneItem = 380;
    this.heightOneItem = 80;
    this.dist = 15;
    this.listSelectMain = ['Играть', 'Авторы'/*, 'Помошь'*/, 'Выход'];
    this.listSelectNewGame = ['Да', 'Нет'];
    this.selectHower = null;
    this.authorScreen = new AuthorScreen();
    this.start=function()
    {
        //if (this.being==true)
        this.being = true;
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
            context.strokeStyle = this.selectHower == i ? 'red' : 'blue';
            context.lineWidth = 3;
            context.strokeRect(x,y+i*(this.heightOneItem+this.dist),this.widthOneItem,this.heightOneItem);
            let addX = this.widthOneItem / 2 - widthText / 2;
            //console.log(addX);
            context.fillText(this.listSelectMain[i],x+addX,y+i*this.heightOneItem+this.dist*i+this.heightOneItem/2+sizeFont/3);
            context.restore();
        }
        this.authorScreen.draw();
        //context.fillText("Играть.",20,y+80);
        //context.fillText("Продолжить.",20,y+120);
        //context.fillText("Помошь.",20,y+160);
        //context.fillText("Выход.",20,y+200);


        //context.fillStyle='rgb(210,210,210)';
        //context.fillRect(0,0,camera.width,camera.height);// очистка экрана
        //context.font = "58px Arial";
        //context.fillStyle='#FF8800';
        //context.fillText("PANZER-ZERO",165,60);
        //context.font = "38px Arial";
        //context.fillStyle='#3333FF';
        //let y=100;
        //context.fillText("WASD - Управление.",20,y+80);
        //context.fillText("1234 - Выбор оружия.",20,y+120);
        //context.fillText("Левая кнопка мыши - Стрелять.",20,y+160);
        //context.fillText("Колёсико мыши - сменить оружие.",20,y+200);
        //context.fillText("M - Магазин.",20,y+240);
        //context.fillText("G - Гараж.",20,y+280);
        //context.fillText("R - Войти в здание или открыть дверь.",20,y+320);
        //context.fillStyle='rgb(210,10,10)';
        //context.fillRect(this.button.x,this.button.y,
        //            this.button.width,this.button.height);
        //context.fillStyle='rgb(255,255,0)';
        //context.fillText("ИГРАТЬ",this.button.x+30,this.button.y+32);
    }
    this.update=function()
    {
        let mX = mouseX;//-mouseOffsetX;
        let mY = mouseY;//-mouseOffsetY;
        let x = this.x;
        let y = this.y;
        this.selectHower = null;
        for (let i = 0;i<this.listSelectMain.length;i++)
        {
            if ( mX>x && mX<x+this.widthOneItem &&
                mY>y+i*(this.heightOneItem+this.dist)&&
                mY<y+i*(this.heightOneItem+this.dist)+ this.heightOneItem)
            {
                this.selectHower = i;

            }

        }
        if (mouseLeftClick())
        {
            switch(this.selectHower)
            {
                case 0: 
                    {
                        this.close();
                        windowLevel.start();
                        
                    }break;
                case 1: 
                    {
                       // this.close();
                        this.authorScreen.start();
                       
                    } break;
                case 2: window.close(); break;
            }
        }
        //if (mouseLeftClick())
        //{   //alert();
        //    if (mX>this.button.x && mX<this.button.x+this.button.width &&
        //            mY>this.button.y && mY<this.button.y+this.button.height
        //       )
        //    {
                
        //        this.being=false;
        //        pause=false;
        //        clearInterval(this.timerId);
        //    }
        //}
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