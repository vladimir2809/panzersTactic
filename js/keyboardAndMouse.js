var keyUp={code:null,timeOld:0}
var pressKeyArr=[];// массив нажатых клавиш в данный момент
var keyUpArr=[];
var gameKeyArr=[];
var mouseX=250;
var mouseY=250;
var mouseOfsX = 0;
var mouseOfsY = 0;
var mouseMultX = 1;
var mouseMultY = 1;
var mouseLeftPress=false;
var mouseClick=false;
let mouseInCanvas = false;
var wheelDelta=0;
function initKeyboardAndMouse(keyArr)// инициализировать переменные для работы с клавиатурой и мышью
{
    window.addEventListener('keydown', function () {
          gameKeyArr=keyArr;//["KeyA","KeyS","KeyD","KeyW",'ArrowLeft','ArrowRight','ArrowUp','ArrowDown' ]; 
          
          if (checkElemArr(gameKeyArr,event.code)==true &&
                   checkElemArr(pressKeyArr,event.code)==false)
          {
              pressKeyArr.push(event.code);
          }
          // console.log(pressKeyArr);
    });
    window.addEventListener('keyup', function () {
          deleteElemArr(pressKeyArr,event.code);
          if (indexOfKeyUp(event.code)==-1)
          {
              let index=keyUpArr.length;
              keyUpArr[index]=clone(keyUp);
              keyUpArr[index].code=event.code;
              keyUpArr[index].timeOld=new Date().getTime();
          }
          else
          {
              let index=indexOfKeyUp(event.code);
              keyUpArr[index].timeOld=new Date().getTime();
          }
    });
    window.addEventListener('mousemove', function (e) {
        mouseOfsX=(window.innerWidth - canvas.width)/2
        mouseOfsY=(window.innerHeight - canvas.height)/2;
        mouseX = (event.clientX-mouseOfsX)/mouseMultX;
        mouseY = (event.clientY-mouseOfsY)/mouseMultY;

        //mouseX=e.pageX - e.target.offsetLeft;//event.clientX;
        //mouseY=e.pageY - e.target.offsetTop;//event.clientY;
        if (event.clientX < mouseOfsX || event.clientX > mouseOfsX + canvas.width ||
            event.clientY < mouseOfsY || event.clientY > mouseOfsY + canvas.height)
        {
            mouseInCanvas = false;
        }
        else 
        {
            mouseInCanvas = true;
        }
     //   console.log("mX:" + mouseX + " mY:" + mouseY + ' mouseInCanvas:' + (mouseInCanvas == true ? "YES" : "NO"));
    });
    window.addEventListener('mousedown', function () {
        if (event.which==1) mouseLeftPress=true;
    });
    window.addEventListener('mouseup', function () {
        if (event.which==1)
        {
            mouseLeftPress=false;
            mouseClick=true;
        } 
    });
    if (canvas.addEventListener) // событие врашеник колесиком
    {
        if ('onwheel' in document) 
        {
          // IE9+, FF17+, Ch31+
          canvas.addEventListener("wheel", onWheel);
        }
        else if ('onmousewheel' in document) {
          // устаревший вариант события
          canvas.addEventListener("mousewheel", onWheel);
        } 
        else
        {
          // Firefox < 17
          canvas.addEventListener("MozMousePixelScroll", onWheel);
        }
    } 
    else
    { // IE8-
        canvas.attachEvent("onmousewheel", onWheel);
    }
}
function onWheel(e)// если врашения колисика мыши
{
    e = e || window.event;    
    var delta = e.deltaY || e.detail || e.wheelDelta;
    if (delta>0)
    {      
        wheelDelta=1;
    }
    if (delta<0)
    {
        wheelDelta=-1;
    }
    
}
function checkWheel()// вернуть значение врашения колисика мыши
{
    res=wheelDelta;
    wheelDelta=0;
   // console.log(res);
    return res;
}
function checkMouseLeft()// была лм нажата левая кнопка мсыши
{
    return mouseLeftPress;
}

function resetMouseLeft()
{
    mouseClick=false;
}
function mouseLeftClick()// функция определения клика. после 1 вызова второй будет false
{
    var result=mouseClick;
    mouseClick=false;
    return result;
}
function addInKeyArr(key)// добавить кнопку которую нужно отслеживать для нажатия
{
    gameKeyArr.push(key);
}
function keyUpDuration(code,time)// была ли нажата определенная кнопка за время time
{
   // console.log(keyUpArr);
    if (indexOfKeyUp(code)!=-1)
    {
        let index=indexOfKeyUp(code);
        let timeNow=new Date().getTime();
        console.log(timeNow-keyUpArr[index].timeOld);
        if (time>timeNow-keyUpArr[index].timeOld && index!=-1)
        {
            keyUpArr.splice(index,1);
            return true;
        }
    }
    return false;
}
function clearPressKey()
{
    while(pressKeyArr.length > 0) 
    {
         pressKeyArr.pop();
    }    
    mouseLeftPress=false;
    mouseClick=false;
}
function checkPressKey(code)// проверить что кнопка в данный момент нажата
{
    if(checkElemArr(pressKeyArr,code)==true) return true; else return false;
}
function indexOfKeyUp(code)// расчет индекса кнопки которая была отпушенна
{
    for (let i=0; i<keyUpArr.length;i++)
    {
        if (keyUpArr[i].code==code) return i;
    }
    return -1;
}
