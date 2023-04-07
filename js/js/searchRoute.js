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
    this.point = {xMap:null,yMap:null,dist:null};
    this.maxValueWave = 0;
    this.routePointArr = [];
    this.initMap = function (widthCell,heightCell)
    {
        this.widthCell = widthCell;
        this.heightCell = heightCell;
        while (this.map.length>0)
        {
            this.map.splice(0, 1);
        }
        for (let i = 0; i < heightCell;i++)
        {
            let arrWidth = [];
            for (let j = 0; j < widthCell;j++)
            {
                let elem=0;
                arrWidth.push(elem);
            }
            this.map.push(arrWidth);
        }
        console.log(this.map);
    }
    this.changeMapXY=function(xMap,yMap,value)
    {
        this.map[yMap][xMap] = value;
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
        console.log(mapBuffer);
        return mapBuffer;

    }
    this.deleteData=function()
    {
        while (this.wavePointArr.length>0)
        {
            this.wavePointArr.splice(0, 1);
        }
        while (this.routePointArr.length>0)
        {
            this.routePointArr.splice(0, 1);
        }
    }

    this.spreadingWave=function(xStart,yStart,distance,xFinish=null,yFinish=null)// распространение волны для поиска пути
    {
        
        this.xStart = xStart;
        this.yStart = yStart;
        this.xFinish = xFinish;
        this.yFinish = yFinish;
        this.finishEnd = false;
        this.maxValueWave = 0;
        this.mapWave = this.cloneMap();
        this.deleteData();
        for (let k = 1; k < distance;k++)
        {
            if (k==1)
            {
                this.mapWave[yStart][xStart] = 1;
                this.stepWave(xStart, yStart, 1);
                this.maxValueWave =  2;

            }
            else if (k>1 && this.finishEnd==false)
            {
                for (let yMap = 0; yMap < this.heightCell;yMap++)
                {
                    for (let xMap = 0; xMap < this.widthCell;xMap++)
                    {
                        if (this.mapWave[yMap][xMap]==k )
                        {
                            this.stepWave(xMap,yMap,k);
                            this.maxValueWave = k + 1;
                            if (this.finishEnd == true) break;
                        }
                       
                    }
                    if (this.finishEnd == true) break;
                }
                if (this.finishEnd == true) break;
            }
           // if (this.finishEnd == true) break;
        }
        for (let yMap = 0; yMap < this.heightCell;yMap++)
        {
            for (let xMap = 0; xMap < this.widthCell;xMap++)
            {
                if (this.mapWave[yMap][xMap]>0)
                {
                    let point = clone(this.point);
                    point.xMap = xMap;
                    point.yMap = yMap;
                    point.dist = this.mapWave[yMap][xMap];
                    this.wavePointArr.push(point);
                }
            }
        }
       // console.log(this.wavePointArr);
    }
    this.stepWave=function(xMap,yMap,value)// функция котороя соседним клеткам присваевает плюс один
    {
        let addArr = [
            {xMap:0,yMap:-1},
            {xMap:1,yMap:0},
            {xMap:0,yMap:1},
            {xMap:-1,yMap:0},
        ];
        for (let i = 0; i < addArr.length;i++)
        {
            if (this.checkCellXY(xMap+addArr[i].xMap,yMap+addArr[i].yMap)==true &&
                (xMap+addArr[i].xMap==this.xStart && yMap+addArr[i].yMap==this.yStart)==false )
            {
   
                this.mapWave[yMap+addArr[i].yMap][xMap+addArr[i].xMap] = value + 1;
                if (this.xFinish!=null && this.yFinish!=null)
                {  
                    if (  (xMap+addArr[i].xMap==this.xFinish && yMap+addArr[i].yMap==this.yFinish)==true)
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
        let addArr = [
            {xMap:0,yMap:-1},
            {xMap:1,yMap:0},
            {xMap:0,yMap:1},
            {xMap:-1,yMap:0},
        ];
      //  console.log("this.maxValueWave " +this.maxValueWave)
        for (let i = this.maxValueWave; i >= 1; i--)
        { 
            let point = clone(this.point);
            if (i==this.maxValueWave)
            {
                point.xMap = this.xFinish;
                point.yMap= this.yFinish;
                point.dist = this.maxValueWave;
            }
            else
            {
                for (let j = 0; j < this.wavePointArr.length;j++)
                {
                    let flag = false;
                    for (let k = 0; k < addArr.length;k++)
                    {
                        let lenNum = this.routePointArr.length-1;
                        if (i==this.wavePointArr[j].dist && 
                            this.routePointArr[lenNum].xMap+addArr[k].xMap==this.wavePointArr[j].xMap &&
                            this.routePointArr[lenNum].yMap+addArr[k].yMap==this.wavePointArr[j].yMap)
                        {
                            point.xMap = this.wavePointArr[j].xMap;//+addArr[k].xMap;
                            point.yMap = this.wavePointArr[j].yMap; //+addArr[k].yMap;
                            point.dist = this.wavePointArr[j].dist;
                            flag = true;
                          //  break;
                        }
                        
                    }
                    if (flag == true) break;
                }
            }
            this.routePointArr.push(point);
        }
      //   console.log(this.routePointArr);
         
    }
    this.getRoute=function(xStart,yStart,distance,xFinish=null,yFinish=null)
    {
        this.spreadingWave(xStart, yStart, distance, xFinish, yFinish);
        this.buildRoute(this.mapWave,this.xFinish,this.yFinish);
        this.routePointArr.reverse();
  //      console.log(this.routePointArr);
        return this.routePointArr;
      
    }
    this.checkCellXY=function(xMap,yMap)
    {  
        if (yMap<0 || yMap>=this.heightCell || xMap<0 || xMap>=this.widthCell)
        {
            return false;
        }
        else if (this.mapWave[yMap][xMap]<0)
        {
            return false;
        }
      
        else if (this.mapWave[yMap][xMap]==0)
        {
            return true;
        }
    }

    this.movingObj=function(oldX,oldY,xMap,yMap)
    {
        let buffer = this.map[oldY][oldX];
        this.map[yMap][xMap] = buffer;
        this.map[oldY][oldX] = 0;
    }
    this.consoleMap=function()
    {
        console.log(this.map);
    }
}