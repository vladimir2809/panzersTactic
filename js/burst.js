function Burst()
{
    this.being = false;
    this.nameImage = 'Explosion';
    this.spriteWidth = 64;
    this.spriteHeight = 64;
    this.x = 1;
    this.y = 1;
    this.count = 4;
    this.maxCount = 9;
    this.sprite = {
        x:0,
        y:0,
        width:0,
        height:0,
    }
    this.spriteArr = [];
    this.init=function()
    {
        let dx = 0;
        let dy = 0;
        for (let i = 0; i < 10;i++)
        {
            let spriteOne = clone(this.sprite);
            dx = this.spriteWidth * (i % 4);
            dy = this.spriteHeight * Math.trunc(i / 4); 
            spriteOne.x = dx;
            spriteOne.y = dy;
            spriteOne.width= this.spiteWidth;
            spriteOne.height= this.spiteHeight;
            this.spriteArr.push(spriteOne);
        }
        console.log(this.spriteArr);
    }
    this.start = function ()
    {

    }
    this.draw=function()
    {
        let scale = 10;
        context.drawImage(imageArr.get(this.nameImage),
            this.spriteArr[this.count].x, this.spriteArr[this.count].y,
            this.spriteArr[this.count].width, this.spriteArr[this.count].height,
            this.x, this.y, this.spriteWidth * scale, this.spriteHeight * scale);
    }
    this.update=function()
    {
        if (this.count <= this.maxCount-1) 
        {
            this.count++;
        }
        else
        {
            this.count = 0;
        }
       
    }

}