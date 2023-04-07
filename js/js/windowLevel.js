function WindowLevel(){
    this.being = false;
    this.timerId = null;
    this.sizeSquare = 60;
    this.dist = 20;
    this.beginX = screenWidth / 2 - ((this.sizeSquare + this.dist) * 5-this.dist) / 2;
    this.beginY = 200;
    this.levelSelect = 4;
    this.start=function()
    {
        this.being = true;
        this.timerId=setInterval(function(){
           windowLevel.update(); 
        },20);
    }
    this.close=function()
    {
        this.being = false;
        clearInterval(this.timerId);
    }
    this.draw = function()
    {
        context.fillStyle='rgb(210,210,210)';
        context.fillRect(0,0,camera.width,camera.height);// очистка экрана
        context.fillStyle='rgb(0,255,0)';
        let strHeader = 'Выберите уровень';
        context.font = '60px Arial';
        let widthTextHeid = context.measureText(strHeader).width;
        context.fillText(strHeader, screenWidth / 2 - widthTextHeid / 2, 110);
        let count = 1;
        let d = this.sizeSquare;
        let x = this.beginX;
        let y = this.beginY;
        let dist = this.dist;
        for (let i = 0; i < 25;i++)
        {
            context.strokeStyle="black";
            
            context.strokeRect(x+i%5*(d+dist),y+Math.trunc(i/5)*(d+dist),d,d);
            context.fillStyle='rgb(255,255,255)';
            let strCount = count+'';
            context.font = '30px Arial';
            let widthTextCount = context.measureText(strCount).width;
            if (checkElemArr(levelGameOpen,i+1)==true)
            {
                context.fillText(strCount,x+i%5*(d+dist)+d / 2 - widthTextCount / 2,
                                 y+Math.trunc(i/5)*(d+dist)+40) ;
            }
            else
            {
                drawSprite(context,imageArr.get('lock'),x+i%5*(d+dist),y+Math.trunc(i/5)*(d+dist),camera,1)
            }
            count++;
        }
        if (this.levelSelect!=null)
        {

            context.fillStyle='rgb(255,255,0)';
            let strCount = this.levelSelect+'';
            context.font = '30px Arial';
            //let widthTextCount = context.measureText(strCount).width;
            context.fillText(strCount,x,y-50) ;

        }
    }
    this.update = function()
    {
        let d = this.sizeSquare;
        let x = this.beginX;
        let y = this.beginY;
        let dist = this.dist;
        let flag = false;
        for (let i = 0; i < 25;i++)
        {
            if (mouseX>x+i%5*(d+dist) && mouseX<x+i%5*(d+dist)+d &&
                mouseY>y+Math.trunc(i/5)*(d+dist) && mouseY<y+Math.trunc(i/5)*(d+dist)+d)
            {
                if (checkElemArr(levelGameOpen,i+1)==true)
                {
                    this.levelSelect = i+1;
                    flag = true;
                }

            }
        }
        if (flag==false)
        {
            this.levelSelect = null;
        }
        if (mouseLeftClick()==true && this.levelSelect!=null)
        {
            this.close();
            levelGame=this.levelSelect-1
            loadGameMap(levelGame);
        }
    }

}