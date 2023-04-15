function MessageBox()
{
    this.being = false;
    this.timerId = null;
    this.x = 0;
    this.y = 0;
    this.width = 350;
    this.height = 150;
    this.header = '';
    this.dist = 50;
    this.fontButton = '25px Arial',
    this.fontHeader = '25px Arial',
    this.valueArr = [];
    this.select = null;
    this.button={
        str:'',
        x:0,
        y:80,
        width:0,
        height:30,

    }
    this.buttonArr = [];
    this.setOption=function(option)
    {
        for (var attr1 in this)
        {
            for (var attr2 in option)
            {
                if (attr1==attr2)    this[attr1] = option[attr2];
            }
        }
        this.updateProp();
    }
    this.updateProp=function()
    {
        this.y = screenHeight / 2 - this.height / 2;
        this.x = screenWidth / 2 - this.width / 2;
        //this.header = header;
        this.buttonArr = [];
        for (let i = 0; i < this.valueArr.length;i++)
        {
            context.font = this.fontButton;
            let widthText = context.measureText(this.valueArr[i]).width;
            let buttonOne = clone(this.button);
            buttonOne.str = this.valueArr[i];
            buttonOne.width = widthText + 15;
            buttonOne.y =this.y+buttonOne.y;
            //buttonOne.height = 30;
            this.buttonArr.push(buttonOne);

        }
        let widthSumm = 0;
        for (let i = 0; i < this.buttonArr.length;i++)
        {
            widthSumm +=this. buttonArr[i].width+(i==(this.buttonArr.length-1)?0:this.dist);
        }
      //  this.dist =  (this.width - widthSumm) / (this.buttonArr.length-1);
       // let widthButSumm = widthSumm + this.dist * (this.buttonArr.length -1);
        for (let i = 0; i < this.buttonArr.length;i++)
        {
            if (i==0)
            {
                this.buttonArr[i].x =this.x+ /*this.buttonArr[i].width/2 + */this.width / 2 - widthSumm / 2;
            }
            else
            {
                this.buttonArr[i].x = this.buttonArr[i - 1].x+this.buttonArr[i - 1].width + this.dist///this.dist;
            }
            this.buttonArr[i].width = Math.trunc(this.buttonArr[i].width);
            this.buttonArr[i].x = Math.trunc(this.buttonArr[i].x);
        }
        console.log(this.buttonArr);
    }
    this.start=function(header,valueArr)
    {
        this.being = true;
        this.header = header;
        this.valueArr = valueArr;
       // console.log("widthSum: "+widthSumm+" butSumm: "+widthButSumm+" dist: "+this.dist);
       // this.timerId = setInterval(this.update,16);
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
      //      this.x++;
            context.fillStyle='blue';
            context.fillRect(this.x,this.y,this.width,this.height);

            let strHeader = this.header;
            context.fillStyle='yellow';
            context.font = this.fontHeader;
            let widthTextHeid = context.measureText(strHeader).width;
            context.fillText(strHeader,this.x+ this.width / 2 - widthTextHeid / 2, this.y+30);
            for (let i = 0; i < this.buttonArr.length;i++)
            {
                context.strokeStyle = 'red';
                context.strokeRect(this.buttonArr[i].x,this.buttonArr[i].y,
                                    this.buttonArr[i].width,this.buttonArr[i].height);
                let str = this.buttonArr[i].str;
                context.fillStyle='yellow';
                context.font = this.fontButton;
                let widthText = context.measureText(str).width;
                context.fillText(str,this.buttonArr[i].x + this.buttonArr[i].width / 2 - widthText/ 2,
                                this.buttonArr[i].y+21);
                //context.fillStyle = '#FFFF00';
                //context.fillRect(this.buttonArr[i].x,this.buttonArr[i].y,
                //                  this.buttonArr[i].width,this.buttonArr[i].height);
                //alert(45);
            }
        }
    }
    this.getSelect=function(callback)
    {
        if (this.select!=null)
        {
            let oldSelect = this.select;
            this.select = null;
            callback(oldSelect);
        }
    }
    this.update=function()
    {
        if (this.being==true)
        {
            //this.x++;
            if (mouseLeftClick()==true)
            {
                for (let i = 0; i < this.buttonArr.length;i++)
                {
                    if (mouseX>this.buttonArr[i].x &&
                        mouseX<this.buttonArr[i].x+this.buttonArr[i].width &&
                        mouseY>this.buttonArr[i].y &&
                        mouseY<this.buttonArr[i].y+this.buttonArr[i].height)
                    {
                        this.select = i;
                    }
                }
                
            }
        }
        
    }
}