function Settings() {
    this.being = false;
   
    this.width = 600;
    this.height = 400;
    this.x = screenWidth/2-this.width/2;
    this.y = screenHeight/2-(this.height+interface.height)/2;
    this.timerId = null;
    this.SledersX = 500;
    this.volume = {
        slider:null,
        x:20,
        y:100,
    };
    this.buttonExit = { 
        width:40,
        height:40,
        x:null,
        y:null,
       
        colorText:'rgb(255,255,0)',
        text: 'X',
       

    }
    
    this.init=function()
    {
        this.buttonExit.x = settings.x + settings.width - this. buttonExit.width;
        this.buttonExit.y = settings.y ;
        this.volume.slider = new Slider(this.SledersX,this.y+this.volume.y-20,150,volumeSound,0,1);
        this.volume.slider.init();
    }
    this.start=function()
    {
        this.being = true;
        this.timerId=setInterval(function(){
           settings.update(); 
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

            context.font = "24x serif";
            context.fillStyle = "white";
            context.fillText('Громкость',this.x+this.volume.x,this.y+this.volume.y);
            context.fillText("Скорость движения",this.x+20,this.y+200);
            context.fillText("Автозавершение хода",this.x+20,this.y+300);
            this.volume.slider.draw();
        }
    }
    this.update=function ()
    {
        this.volume.slider.update();
        if (mouseLeftClick()==true)
        {
            if (checkInObj(this.buttonExit,mouseX,mouseY))
            {
                this.close();
            }
        }
        volumeSound = this.volume.slider.value;
        audio.volume(volumeSound);
        console.log(volumeSound);
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
        this.bar.x = this.x + this.width * this.value / (this.max - this.min);
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
        context.fillRect(this.x,this.y,this.width*this.value/(this.max-this.min),this.height);
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
                this.value = (this.max - this.min) * (this.bar.x - this.x) / this.width;
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