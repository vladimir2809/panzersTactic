Bullets = function () {
    this.bullet = {
        being:false,
        x:null,
        y:null,
        angle:null,
        DMG:null,
    }
    this.speed = 20;
    this.bulletArr = [];
    this.drawBullets=function(context)
    {
        for (let i = 0; i < this.bulletArr.length;i++)
        {
            if (this.bulletArr[i].being==true)
            {
                context.beginPath();
                context.fillStyle = "#FFFF00";
	            context.arc(this.bulletArr[i].x-2,this.bulletArr[i].y-2, 5, 2*Math.PI, false);
	            context.fill();
	            context.lineWidth = 1;
	            context.strokeStyle = 'red';
	            context.stroke();
            }
        }
    }
    this.kill =function(num)
    {
        if (this.bulletArr[num].being==true)
        {
            this.bulletArr[num].being = false;
        }
    }
    this.shot=function(x,y,angle,DMG)
    {
        let bullet = clone(this.bullet);
        bullet.being = true;
        bullet.x = x;
        bullet.y = y;
        bullet.angle = angle;
        bullet.DMG = DMG;
        this.bulletArr.push(bullet);
    }
    this.update=function()
    {
        for (let i = 0; i < this.bulletArr.length;i++)
        {
            if (this.bulletArr[i].being==true)
            {
                let dx = 0;
                let dy = 0;
                dy = this.speed * Math.sin(pi*(this.bulletArr[i].angle - 90) / 180) ;
                dx = this.speed * Math.cos(pi * (this.bulletArr[i].angle - 90) / 180) ;
                this.bulletArr[i].x += dx;
                this.bulletArr[i].y += dy;
            }
        }
    }
}