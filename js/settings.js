function Settings() {
    this.being = false;
   
    this.width = 600;
    this.height = 400;
    this.x = screenWidth/2-this.width/2;
    this.y = screenHeight/2-(this.height+interface.height)/2;
    this.timerId = null;
    this.SledersX = 500;
    this.messageBox = new MessageBox();
    this.volume = {
        slider:null,
        x:20,
        y:100,
    };
    this.speedMotion = {
        slider:null,
        x:20,
        y:200,
    }
    this.buttonExit = { 
        width:40,
        height:40,
        x:null,
        y:null,
       
        colorText:'rgb(255,255,0)',
        text: 'X',
       

    }
    this.buttonMainMenu = { 
        width:330,
        height:40,
        x:null,
        y:null,
       
        colorText:'rgb(255,255,0)',
        text: 'Выйти в главное меню',
             //levelBeingRedactor
       

    }
    this.toggle = null;
    this.init=function()
    {
        this.buttonExit.x = this.x + this.width - this. buttonExit.width;
        this.buttonExit.y = this.y ;
        this.buttonMainMenu.x = this.x + this.width / 2 - this.buttonMainMenu.width / 2;
        this.buttonMainMenu.y = this.y + 330; 
        this.volume.slider = new Slider(this.SledersX,this.y+this.volume.y-20,150,volumeSound,0,1);
        this.volume.slider.init();
        //Slider(x,y,width,value,min,max)
        this.speedMotion.slider = new Slider(this.SledersX,this.y+this.speedMotion.y-20,150,speedMotionPanz,1,30);
        this.speedMotion.slider.init();
        this.toggle = new Toggle(this.SledersX+88, this.y + 275,autoStepEnd);
    }
    this.start=function()
    {
        this.being = true;
        this.buttonMainMenu.text = levelBeingRedactor == false ? 'Выйти в главное меню' : 'Выйти в редактор';
        this.timerId=setInterval(function(){
            if (settings.messageBox.being==false)
            {
                settings.update(); 
            }
            else
            {
                settings.messageBox.update();
                settings.messageBox.getSelect(function (value) {
                    //console.log('select='+value);
                    switch (value) {
                        case 0:
                            {
                                settings.close();
                                autoGame = false;
                                if (levelBeingRedactor == false) {
                                    mainMenu.start();
                                }
                                else {

                                    exitInRedactor();
                                    //searchRoute.deleteData();

                                    //interface.select.type = null;
                                    //interface.select.num = null;
                                    loadGameMap(0, dataRAMLevel);
                                    //redactorMode = true;
                                }
                                settings.messageBox.close();
                                break;
                            }
                        case 1: { settings.messageBox.close(); break; }
                    }
                });
            }
        },30);
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
            context.fillStyle = 'black';
            context.fillRect(this.x,this.y,this.width,this.height);

            context.font = "32px serif";
            context.fillStyle = 'yellow'
            context.fillText('Настройки',this.x+230,this.y+30);


            context.strokeStyle = 'red'//"rgb(128,128,128)";
            context.strokeRect(this.buttonExit.x,this.buttonExit.y,
                                this.buttonExit.width,this.buttonExit.height);

            context.font = "32px serif";
            context.fillStyle = this.buttonExit.colorText;
            context.fillText(this.buttonExit.text,this.buttonExit.x+8,this.buttonExit.y+30);

            context.strokeStyle = 'red'//"rgb(128,128,128)";
            context.strokeRect(this.buttonMainMenu.x,this.buttonMainMenu.y,
                                this.buttonMainMenu.width,this.buttonMainMenu.height);

            //context.font = "32px serif";
            
            //context.fillText(this.buttonMainMenu.text,this.buttonMainMenu.x+8,this.buttonMainMenu.y+30);
            context.fillStyle = this.buttonMainMenu.colorText;
            let strHeader = this.buttonMainMenu.text;
            context.font = '32px serif';
            let widthText = context.measureText(strHeader).width;
            context.fillText(strHeader,this.buttonMainMenu.x+ this.buttonMainMenu.width / 2 - widthText / 2, 
                this.buttonMainMenu.y+30);

            context.font = "24x serif";
            context.fillStyle = "white";
            context.fillText('Громкость',this.x+this.volume.x,this.y+this.volume.y);
            context.fillText("Скорость движения",this.x+20,this.y+200);
            context.fillText("Автозавершение хода",this.x+20,this.y+300);
            this.volume.slider.draw();
            this.speedMotion.slider.draw();
            this.toggle.draw();
            settings.messageBox.draw();
        }
    }
    this.update=function ()
    {   
        let mouseCLick = mouseLeftClick();
        if (mouseCLick==true)
        { 
            if (checkInObj(this.buttonExit,mouseX,mouseY)==true)
            {
                saveDataStorage();
                this.close();
             
            } 
            if (checkInObj(this.buttonMainMenu,mouseX,mouseY)==true)
            { 
                this.messageBox.start('Вы действительно хотите выйти?', ['Да','Нет']/*['да', 'нет',]*/);
                this.messageBox.setOption({width:520});
                //this.close();
                //autoGame = false;
                //if (levelBeingRedactor==false)
                //{
                //    mainMenu.start();
                //}
                //else
                //{
                    
                //    exitInRedactor();
                //    //searchRoute.deleteData();

                //    //interface.select.type = null;
                //    //interface.select.num = null;
                //    loadGameMap(0,dataRAMLevel);
                //    //redactorMode = true;
                //}
                
            }
            this.toggle.update(mouseCLick);
            autoStepEnd = this.toggle.valueOn;
            console.log("ASE "+autoStepEnd);
        }
        this.speedMotion.slider.update();
        speedMotionPanz = this.speedMotion.slider.value;
        this.volume.slider.update();
       
        
        volumeSound = this.volume.slider.value;
        audio.volume(volumeSound);
        console.log(speedMotionPanz);
        this.volume.slider.clickBar(function () {
            audio.play('shot');
        });
        
       // alert(55);
    }

}
function Slider(x,y,width,value,min,max)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 30;
    this.value = value;
    this.max = max;
    this.min = min;
    this.grabMouseBar = false;
    this.oldX = null;
    this.click = false;
    this.countMousePress = null;
    this.bar={
        x: null,
        y: null,
        width:20,
        height:40,
    }
    this.updateBar=function()
    {
        this.bar.x = this.x + this.width * (this.value -this.min)/ (this.max - this.min);
        this.bar.y = this.y - (this.bar.height - this.height) / 2;
    }
    this.init=function()
    {
        //this.bar.x = this.x + this.width * this.value / (this.max - this.min);
        //this.bar.y = this.y - (this.bar.height - this.height) / 2;
        this.updateBar();
    }
    this.draw=function()
    {
        context.fillStyle = "green";
        context.fillRect(this.x,this.y,this.width*(this.value-this.min)/(this.max-this.min),this.height);
        context.strokeStyle = "red";
        context.strokeRect(this.x,this.y,this.width,this.height);
        context.fillStyle = "red";
        context.fillRect(this.bar.x,this.bar.y,this.bar.width,this.bar.height);
        context.strokeStyle = "white";
        context.strokeRect(this.bar.x,this.bar.y,this.bar.width,this.bar.height);

    }
    this.clickBar=function(callback)
    {
        if (this.click==true)
        {
            this.click = false;
            if (checkInObj(this.bar,mouseX,mouseY)==true)
            {
                callback();
            }
            
        }
    }
    this.update=function()
    {
        if (mouseLeftPress==true)
        {
            
            if (checkInObj(this.bar,mouseX,mouseY)==true)
            {
                this.grabMouseBar = true;
            }
         
            if (this.grabMouseBar==true)
            {
                this.bar.x +=( mouseX - this.oldX);
                if (this.bar.x > this.x + this.width)
                {
                    this.bar.x = this.x + this.width;
                    this.grabMouseBar = false;
                }
                if (this.bar.x < this.x)
                {
                    this.bar.x = this.x;
                    this.grabMouseBar = false;
                }
                this.value = this.min+((this.max - this.min) * (this.bar.x - this.x) / this.width);
            }
            console.log(this.value);
            //if (this.countMousePress==null)
            //{
            //    this.countMousePress=1;
            //}
            //else
            //{
            //    this.countMousePress++;
            //}

        }  
        else
        {
            if (this.grabMouseBar==true)
            {
                this.click = true;
            }
            this.grabMouseBar = false;
            //if (this.countMousePress!=null && this.countMousePress<20)
            //{
            //    this.click = true;
            //    this.countMousePress = null;
            //}
            //this.countMousePress = null;
        }
        this.oldX = mouseX;
    }
}
function Toggle(x,y,valueOn)
{
    this.being = true;
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 30;
    this.depthRect = 4;
    this.valueOn = valueOn;
    this.bar = {
        x:null,
        y:null,
        width:null,
        height:null,
        depth: 4,
    };
    this.bar.width = this.height - this.depthRect*2;
    this.bar.height = this.height - this.depthRect*2;
    this.calcBarX=function()
    {
        if (this.valueOn==true)
        {
            this.bar.x = this.x + this.width-this.depthRect-this.bar.width;

        }
        else
        {
            this.bar.x=this.x + this.depthRect;
        }
    }
    this.calcBarX();
    //this.bar.x = x + this.depthRect;
    this.bar.y = y + this.depthRect;
    
    this.draw=function()
    {
        context.save();
        context.strokeStyle = 'rgb(128,128,128)';
        context.lineWidth = this.depthRect;
        context.strokeRect(this.x,this.y,this.width,this.height);
        context.restore();

        context.save();
        context.fillStyle = this.valueOn==true?'rgb(128,128,255)':'rgb(128,128,128)';
        context.fillRect(this.bar.x,this.bar.y,this.bar.width,this.bar.height);

        context.strokeStyle = 'white';
        context.lineWidth = this.bar.depth;
        context.strokeRect(this.bar.x,this.bar.y,this.bar.width,this.bar.height);
        context.restore();
    }
    this.update=function(clickMouse)
    {
        if (clickMouse==true)
        {
            if (checkInObj(this,mouseX,mouseY))
            {
                this.valueOn = !this.valueOn;
            }
            this.calcBarX();         
        }
    
    }


}