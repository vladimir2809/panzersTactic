function MenuRedactor()
         //MenuRedactor
{
    this.being=false;
    this.timerId = null;
    this.x = 0;
    this.xMenu = 0;
    this.yMenu = 0;
    this.y = 0;
    this.width = 350;
    this.height = 380;
    this.widthOneItem = 200;
    this.heightOneItem = 40;
    this.dist = 15;
    this.listSelect = ['Тест','Главное меню','Сохранить', 'Загрузить', 'Выход'];
    this.numSelectHower = null;
    this.selectHower = null;
    this.messageBox = new MessageBox();
    this.loadMap = false;
    this.loadMapTrue = true;
    this.blocking = false;
    this.start=function()
    {
        //if (this.being==true)
        this.being = true;
        this.blocking = false;
        this.y = screenHeight / 2 - this.height / 2;
        this.x = screenWidth / 2 - this.width / 2;
        this.xMenu =this.x+ this.width/2-this.widthOneItem/2;
        this.yMenu = this.y+this.height/2-(this.listSelect.length)*(this.heightOneItem+this.dist)/2 ;
        this.yMenu += this.dist/2;
        this.timerId=setInterval(function(){
           if (menuRedactor.messageBox.being==false) 
           {
               menuRedactor.update(); 
           }
           else
           {
               menuRedactor.messageBox.update();
               menuRedactor.messageBox.getSelect(function (value) {
                   //console.log('select='+value);
                   switch (value)
                   {
                       case 0:
                        {
                               //data = createDataLevel();
                               //downloadAsFile(data);
                               saveMap();
                               if (checkPower2Command()==true)
                               {
                                 
                                   menuRedactor.close();
                                   mainMenu.start();
                               } 
                               menuRedactor.messageBox.close();
                               break; 
                       }
                       case 1: 
                       {
                                menuRedactor.messageBox.close()
                                menuRedactor.close();
                                mainMenu.start();
                                break; 
                       }
                       case 2: { menuRedactor.messageBox.close(); break; }
                   }
               });


           }
        },20);
    }
    this.close=function()
    {
        this.being = false;
        clearInterval(this.timerId);
    }
    this.draw=function ()
    {
        let x = this.xMenu;
        let y = this.yMenu;
        context.fillStyle='rgb(0,0,0)';
        context.fillRect(this.x,this.y,this.width,this.height);// очистка экрана
        context.fillStyle='rgb(0,255,0)';

        let strHeader = 'Меню';
        context.font = '30px Arial';
        let widthTextHeid = context.measureText(strHeader).width;
        context.fillText(strHeader,this.x+ this.width / 2 - widthTextHeid / 2, this.y+30);

        //context.fillStyle='rgb(210,210,0)';
        context.strokeStyle = 'rgb(210,210,0)';
        let sizeFont = 20;
        context.font = sizeFont+"px Arial";
        context.fillStyle='#FF8800';
        for (let i = 0; i < this.listSelect.length;i++)
        {
            let widthText = context.measureText(this.listSelect[i]).width;
            context.save();
            context.strokeStyle = this.numSelectHower == i ? 'red' : 'blue';
            context.lineWidth = 3;
            context.strokeRect(x,y+i*(this.heightOneItem+this.dist),this.widthOneItem,this.heightOneItem);
            let addX = this.widthOneItem / 2 - widthText / 2;
            //console.log(addX);
            context.fillText(this.listSelect[i],x+addX,y+i*this.heightOneItem+this.dist*i+this.heightOneItem/2+sizeFont/3);
            context.restore();
        }
        this.messageBox.draw();
    }
    this.update=function()
    {
        let mX = mouseX;//-mouseOffsetX;
        let mY = mouseY;//-mouseOffsetY;
        let x = this.xMenu;
        let y = this.yMenu;
        this.numSelectHower = null;
        this.selectHower = null;
        if (this.blocking==false)
        {
            for (let i = 0;i<this.listSelect.length;i++)
            {
                if ( mX>x && mX<x+this.widthOneItem &&
                    mY>y+i*(this.heightOneItem+this.dist)&&
                    mY<y+i*(this.heightOneItem+this.dist)+ this.heightOneItem)
                {
                    this.numSelectHower = i;
                    this.selectHower = this.listSelect[i];

                }

            }
        }
        if (mouseLeftClick())
        {
            switch(this.selectHower)
            {
                case 'Главное меню':
                    {
                        //this.close();
                        this.messageBox.start('Вы действительно хотите выйти?', ['Сохранить','Не сохранять',"Отмена"]/*['да', 'нет',]*/);
                        this.messageBox.setOption({width:520});
                       // mainMenu.start();
                        break;
                    }
                case 'Сохранить':
                    {
                        saveMap();
                     //   data = createDataLevel();
                       //downloadAsFile(data); 
                        break;
                    }
                case 'Загрузить':
                    {
                        var formFile=document.getElementById("formFile");
                        formFile.style.display="block";
                        this.blocking = true;
                       
                    }
                    break;
                case 'Выход':
                    {
                        this.close();
                        break;
                    }
                case 'Тест':
                    {
                        if (checkPower2Command()==true)
                        {
                            
                            redactorMode = false;
                            dataRAMLevel = [];
                            dataRAMLevel = createDataLevel();  
                            this.close();
                        }
                        else
                        {
                            alert ('На карте должен быть минимум один зеленый и красный танк.')
                        }
                    
                        break;
                    }
            }
       
        }   
        //if (/*this.loadMap==true &&*/ this.loadMapTrue == false)
        //{
        //    this.loadMapTrue = true;
        //    alert('Неверный формат файла.');
        //}
        if (this.loadMap==true && dataRAMLevel!=null )
        {
            this.loadMap = false;
            loadGameMap(0,dataRAMLevel);
            if (this.loadMapTrue == false)
            {
                this.loadMapTrue = true;
                this.blocking = false;
                alert('Неверный формат файла.');
            }
            else
            {
                this.close();
            } 
        }
    }
}
function saveMap()
{
    if (checkPower2Command()==true)
    {
        data = createDataLevel();
        downloadAsFile(data);
    }
    else
    {
        alert ('На карте должен быть минимум один зеленый и красный танк.')
    }
    
}
function checkPower2Command()
{
    powerCommand0 = 0;
    powerCommand1 = 0;
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].being==true)
        {
            if (panzerArr[i].command == 0) powerCommand0 += panzerArr[i].HP * panzerArr[i].DMG;
            if (panzerArr[i].command == 1) powerCommand1 += panzerArr[i].HP * panzerArr[i].DMG;
        }
    }
    if (powerCommand0 > 0 && powerCommand1 > 0) return true; else return false;
}