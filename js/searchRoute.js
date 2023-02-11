function SearchRoute()
{
    this.map=[];
    this.mapWave = [];
    this.widthCell = null;
    this.heightCell = null;
    this.xStart = null;
    this.yStart = null;
    this.xFinish = null;
    this.yFinish = null;
    this.finishEnd = false;
    this.wavePointArr = [];
    this.point = {x:null,y:null,dist:null};
    this.routePointArr = [];
    this.initMap = function (widthCell,heightCell)
    {
        this.widthCell = widthCell;
        this.heightCell = heightCell;
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
    this.cloneMap = function()
    {
        let mapBuffer = [];
        for (let i = 0; i < this.map.length;i++)
        {
            let buffer = [];
            arrElemCopy(buffer, this.map[i]);
            mapBuffer.push(buffer);
        }
        return mapBuffer;
    }
    this.spreadingWave=function(xStart,yStart,distance,xFinish=null,yFinish=null)// распространение волны для поиска пути
    {
        this.mapWave = this.cloneMap();
        this.xStart = xStart;
        this.yStart = yStart;
        this.xFinish = xFinish;
        this.yFinish = yFinish;
        this.finishEnd = false;
        maxValueWave = 0;
        for (let k = 1; k < distance;k++)
        {
            if (k==1)
            {
                this.mapWave[yStart][xStart] = 1;
                this.stepWave(xStart, yStart, 1);

            }
            else if (k>1)
            {
                for (let y = 0; y < this.heightCell;y++)
                {
                    for (let x = 0; x < this.widthCell;x++)
                    {
                        if (this.mapWave[y][x]==k )
                        {
                            this.stepWave(x,y,k);
                            if (this.finishEnd == true) break;
                        }
                       
                    }
                    if (this.finishEnd == true) break;
                }
                if (this.finishEnd == true) break;
            }
            if (this.finishEnd == true) break;
        }
        for (let y = 0; y < this.heightCell;y++)
        {
            for (let x = 0; x < this.widthCell;x++)
            {
                if (this.mapWave[y][x]>0)
                {
                    let point = clone(this.point);
                    point.x = x;
                    point.y = y;
                    point.dist = this.mapWave[y][x];
                    this.wavePointArr.push(point);
                }
            }
        }
        console.log(this.wavePointArr);
    }
    this.stepWave=function(x,y,value)// функция котороя соседним клеткам присваевает плюс один
    {
        let addArr = [
            {x:0,y:-1},
            {x:1,y:0},
            {x:0,y:1},
            {x:-1,y:0},
        ];
        for (let i = 0; i < addArr.length;i++)
        {
            if (this.checkCellXY(x+addArr[i].x,y+addArr[i].y)==true &&
                (x+addArr[i].x==this.xStart && y+addArr[i].y==this.yStart)==false
               )
            {
   
                this.mapWave[y+addArr[i].y][x+addArr[i].x] = value + 1;
                if (this.xFinish!=null && this.yFinish!=null)
                {  
                    if (  (x+addArr[i].x==this.xFinish && y+addArr[i].y==this.yFinish)==true)
                    {  
                        this.finishEnd = true;
                        break;
                    } 
              
                }     
            }
        }
    }
    this.buildRoute=function(mapWave,xFinish,yFinish)
    {

    }
    this.checkCellXY=function(x,y)
    {  
        if (y<0 || y>this.widthCell || x<0 || x>this.heightCell)
        {
            return false;
        }
        else if (this.mapWave[y][x]<0)
        {
            return false;
        }
      
        else if (this.mapWave[y][x]==0)
        {
            return true;
        }
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