function WindowLevel(){
    this.being = false;
    this.timerId = null;
    this.start=function()
    {
        this.being = true;
        this.timerId=setInterval(function(){
           WindowLevel.update(); 
        },20);
    }
    this.draw = function()
    {
        context.fillStyle='rgb(210,210,210)';
        context.fillRect(0,0,camera.width,camera.height);// очистка экрана
        context.fillStyle='rgb(0,255,0)';
        let strHeader = 'Выберите уровень';
        context.font = '50px Arial';
        let widthTextHeid = context.measureText(strHeader).width;
        context.fillText(strHeader, screenWidth / 2 - widthTextHeid / 2, 110);
        let count = 1;
        for (let i = 0; i < 25;i++)
        {
            context.strokeStyle="black";
            let d = 40;
            context.strokeRect(i%5*(d+5),Math.trunc(i/5)*(d+5),d,d);
        }
    }
    this.update = function()
    {

    }

}