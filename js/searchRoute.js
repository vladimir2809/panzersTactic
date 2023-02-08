function SearchRoute()
{
    this.map=[];
    this.initMap = function (widthCell,heightCell)
    {
        for (let i = 0; i < widthCell;i++)
        {
            let arrWidth = [];
            for (let j = 0; j < heightCell;j++)
            {
                let elem=0;
                arrWidth.push(elem);
            }
            this.map.push(arrWidth);
        }
        console.log(this.map);
    }
    this.changeMapXY=function(x,y,value)
    {
        this.map[y][x] = value;
    }
    this.movingObj=function(oldX,oldY,x,y)
    {
        let buffer = this.map[oldY][oldX];
        this.map[y][x] = buffer;
        this.map[oldY][oldX] = 0;
    }
    this.consoleMap=function()
    {
        console.log(this.map);
    }
}