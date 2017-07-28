
function renderCells(cells, data) {
  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i];
    var key = cell.innerText;
    if (data[key]) {
      cell.innerText = data[key];
      cell.parentElement.className = "rendered";
    } else {
      cell.parentElement.parentElement.removeChild(cell.parentElement);
    }
  }
};

/**
 * Returns true if the supplies object has no properties.
 */
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

/**
 * Resizes the window to the current dimensions of this page's body.
 */
function resizeWindow() {
  window.setTimeout(function() {
    chrome.tabs.getCurrent(function (tab) {
      var newHeight = Math.min(document.body.offsetHeight + 140, 700);
      chrome.windows.update(tab.windowId, {
        height: newHeight,
        width: 520
      });
    });
  }, 150);
};

/**
 * Called directly by the background page with information about the
 * image.  Outputs image data to the DOM.
 */
function renderImageInfo(imageinfo) {
  console.log('imageinfo', imageinfo);

  var divloader = document.querySelector('#loader');
  var divoutput = document.querySelector('#output');
  divloader.style.display = "none";
  divoutput.style.display = "block";

  var divinfo = document.querySelector('#info');
  var divexif = document.querySelector('#exif');

  // Render general image data.
  var datacells = divinfo.querySelectorAll('td');
  renderCells(datacells, imageinfo);

  // If EXIF data exists, unhide the EXIF table and render.
  if (imageinfo['exif'] && !isEmpty(imageinfo['exif'])) {
    divexif.style.display = 'block';
    var exifcells = divexif.querySelectorAll('td');
    renderCells(exifcells, imageinfo['exif']);
  }
};

/**
 * Renders the URL for the image, trimming if the length is too long.
 */
function renderUrl(url) {
  var divurl = document.querySelector('#url');
  var urltext = (url.length < 45) ? url : url.substr(0, 42) + '...';
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.innerText = urltext;
  divurl.appendChild(anchor);
};

/**
 * Renders a thumbnail view of the image.
 */
function renderThumbnail(url) {
  var canvas = document.querySelector('#thumbnail');
  var context = canvas.getContext('2d');

  canvas.width = 100;
  canvas.height = 100;

  var image = new Image();
  image.addEventListener('load', function() {
    var src_w = image.width;
    var src_h = image.height;
    var new_w = canvas.width;
    var new_h = canvas.height;
    var ratio = src_w / src_h;
    if (src_w > src_h) {
      new_h /= ratio;
    } else {
      new_w *= ratio;
    }
    canvas.width = new_w;
    canvas.height = new_h;
    context.drawImage(image, 0, 0, src_w, src_h, 0, 0, new_w, new_h);
  });
  image.src = url;
};

function gaosi(x,y,a){ //根据高斯二维公式，获取点的高斯值
        var e = Math.E ;
        var pi = Math.PI ;
        return 1/(2*pi*a*a)*Math.pow(e,-((x*x+y*y)/(2*a*a)))
}
//假设radius=x,那么会获得一个(2*x+1)×(2*x+1)的数组矩阵
//数组第一个元素的坐标是【-x,x】
function getQuan(radius){ //获取每个点的高斯值，返回数组
        var quan = []
        for (var i=-radius;i<=radius ;i++ )
        {
          for (var j=-radius;j<=radius ;j++ )
            {
                quan.push(gaosi(i,j,radius));
            }
        }
  return quan ;
}
function ArrSub(arr){ //返回高斯数组所有元素的值的和
        var sub = 0 ;
        for (var i=0,len=quan.length;i<len ;i++ )
        {
            sub += quan[i] ;
        }
        return sub ;
}

function jiaQuan(arr,quanSub){ //获取权的数组
        for (var i=0,len=arr.length;i<len ;i++ )
        {
              arr[i] = arr[i]/quanSub;
        }
        return arr ;
}


function renderCanvas(url){//渲染图片到HTML






  var ctxt = canvas.getContext('2d');
  var img = new Image;
  var orderData;

//图片加载完成后执行变换
  img.onload = function(){
    ctxt.drawImage(img, 0, 0);
    //得到图片的HCL格式 changedData是HCL的三维向量
    orderData = ctxt.getImageData(0, 0, img.width, img.height).data;//读取整张图片的像素。
      // console.log('image',orderData);
    changedData = changeImageData(img.width,img.height,orderData);//返回HCL的三维向量.
      // console.log('changedData', changedData[0]);//hue

    // 得到规范化色彩空间一致性二维数组 consistencyHue,consistencyChrome;
    var ZH = 0 ;
    var ZC = 0 ;
    var consistencyHue = new Array;
    var consistencyChrome = new Array;
      

      //得到高斯核G(x,y)
          var radius = 10;//设定高斯模糊的半径 M = radius*radius
          var theta = 1.5;//设定高斯模糊的方差 
          var quan = getQuan(radius);//获取得到a*a的未规范化权值数组
          var quanSub = ArrSub(quan);//获得数组和
          var gaussian = jiaQuan(quan,quanSub); //quan/quanSub//获取得到G(x,y);

    //得到规范化前的一致性矩阵
    for(var  i = 0 ; i < img.height; i ++){
      var rowHue = new Array;
      var rowChrome = new Array;
      for(var  j = 0 ; j < img.width; j ++){
        // 得到（x,y）点的Hue和chrome的期望值
        var E_M_H = expectationH(radius,changedData[0],i,j,img.height,img.width); //2行1列 （x,y）是正方形区域的中心
        var E_M_C = expectationC(radius,changedData[1],i,j,img.height,img.width); //值
        // 得到（x,y）点的Hue和chrome的一致性
        var U_H = consistencyH(radius,gaussian,changedData[0],E_M_H,i,j,img.height,img.width);
        rowHue.push(U_H);
        ZH += U_H;
        var U_C = consistencyC(radius,gaussian,changedData[1],E_M_C,i,j,img.height,img.width);
        rowChrome.push(U_C);
        ZC += U_C;
      }
      consistencyHue.push(rowHue);
      consistencyChrome.push(rowChrome);
    }
      //规范化
      var reverseZH = 1 / ZH;
      var reverseZC = 1 / ZC;
    for(var i = 0 ; i < img.height; i++){
      for(var j = 0 ; j < img.width; j ++){
        consistencyHue[i][j] *= reverseZH;
        consistencyChrome[i][j] *= reverseZC; 
      }
    }

  // 计算图片结构信息 deltaH,C,L;
    var C0 = 1;//设定chroma的动态范围
    var lambdaH = 2;//设定好的范围调节数
    var seta =findSeta(changedData[0],img.height,img.width);
    var redefinedHue = redefined(changedData[0],seta,img.height,img.width);//返回的redifinedHue是用pi表示的角度。
    var gradientHue = gradient(redefinedHue,img.height,img.width);
    var deltaHue = redefinedGradient(gradientHue,changedData[1],img.height,img.width,C0,lambdaH);
    var deltaChrome = gradient(changedData[1],img.height,img.width);
    var deltaLightness = gradient(changedData[2],img.height,img.width);

  // 计算优先级因子 priorityH,C,L;
    var lambdaC = 5;
    var lambdaL = 5;
    var priorityHue = 1;
    var priorityChrome = priorityC(consistencyHue,lambdaC,img.height,img.width);
        var tempPriority = priorityC(consistencyChrome,lambdaL,img.height,img.width);
    var priorityLightness = priorityL(priorityChrome,tempPriority,img.height,img.width);

  //计算最终图像转换矩阵。
    

  }
  img.src = url;//src也可以是从文件选择控件中取得。
}

function priorityL(priorityChrome,tempPriority,maxX,maxY){
  var priorityLightness = priorityChrome;
  for(var i = 0 ; i < maxX; i ++){
    for(var j = 0 ; j < maxY; j++){
      priorityLightness[i][j] = priorityChrome[i][j] * tempPriority[i][j];
    }
  }
  return priorityLightness;
}

function priorityC(consistencyHue,lambdaC,maxX,maxY){
  var priorityChrome = consistencyHue;
  for(var i = 0 ; i < maxX; i ++){
    for(var j = 0 ; j < maxY; j++){
      priorityChrome[i][j] = Math.exp( - lambdaC * consistencyHue[i][j]);
    }
  }
  return priorityChrome;
}

function redefinedGradient(gradientHue,chrome,maxX,maxY,C0,lambdaH){
  var redefinedGradientHue = gradientHue;
  for(var i = 0 ; i < maxX; i ++){
    for(var j = 0 ; j < maxY; j++){
      var sign = -1;
      if(gradientHue[i][j]>=0) sign = 1;
      var temp = Math.pow(chrome[i][j]/C0,lambdaH);
      redefinedGradientHue[i][j] = sign * temp * Math.abs(gradientHue[i][j]);
    }
  }
  return redefinedGradientHue;
}

function gradient(hue,maxX,maxY){
  var gradientHue = hue;
  for(var i = 0 ; i < maxX; i ++){
    for(var j = 0 ; j < maxY; j++){
      var dx,dy;
      if(i + 1 < maxX){
        dx = hue[i+1][j] - hue[i][j];
      }
      else {
        dx = hue[i][j] - hue[i-1][j];
      }
      if(j + 1 < maxY){
        dy = hue[i][j+1] - hue[i][j];
      }
      else {
        dy = hue[i][j] - hue[i][j-1];
      }
      gradientHue[i][j] =Math.sqrt( dx * dx + dy * dy );
    }
  }
  return gradientHue;
}

function redefined(hue,seta,maxX,maxY){
  var pi = Math.PI;
  for(var i = 0 ; i < maxX; i ++){
    for(var j = 0 ; j < maxY; j++){
      var hue[i][j] = hue[i][j]/360 - seta;
      if(hue[i][j]<0) hue[i][j] += 2*pi;
    }
  }
  return hue;
}

function findSeta(hue,maxX,maxY){//找到最大的初始角 seta 有[0,1,...,255]*2Pi/256 种可能
    var maxSeta;
    var compareMax = 0;
    var res = 2 * Math.PI / 256 ;
    for(var  k = 0 ; k < 256; k ++){
      var seta = k * res;
      var compare = 0 ;
      for( var i = 0 ; i < maxX; i ++){
        for( var j = 0 ; j < maxY; j ++){
          var a = Math.cos(hue[i][j]/360)-Math.cos(seta);
          var b = Math.sin(hue[i][j]/360)-Math.sin(seta);
          compare = compare + ( a * a ) + ( b * b ) ;
        }
      }
      if(compare > compareMax) {
        compareMax = compare;
        maxSeta = seta;
      }
    }
    return maxSeta;
}

function consistencyH(radius,gaussian,hue,expectation,x,y,maxX,maxY){
  var R = 100;
  var GHC = 0;
  var GHS = 0;
  var cal = 0;
  for (var i=-radius;i<=radius ;i++ )
    {
    for (var j=-radius;j<=radius ;j++ )
      { 
        // 如果超出边界，即取(x,y)为中心相对应的那一点的值代替。
        var a = x + i;
        var b = y + j;  
        if( x + i < 0 || x + i >= maxX ) a = x - i;
        if( y + j < 0 || y + j >= maxY ) b = y - j;

        GHC += Math.cos(hue[a][b]/360) * gaussian[cal];
        GHS += Math.sin(hue[a][b]/360) * gaussian[cal];
        cal ++;
      }
    }
  GHS = GHS * R;
  GHC = GHC * R;
  var GH = $M([
    [GHC],
    [GHS]
    ]);
  GH = expectation - GH;
  var des = GH.e(1,1) * GH.e(1,1) + GH.e(2,1) * GH.e(2,1);
  return des;

}

function consistencyC(radius,gaussian,chrome,expectation,x,y){
  var GC=0;
  var len = radius*radius ; 
  var cal = 0;
  for (var i=-radius;i<=radius ;i++ )
    {
      for (var j=-radius;j<=radius ;j++ )
        {
          var a = x + i;
          var b = y + j;  
          if( x + i < 0 || x + i >= maxX ) a = x - i;
          if( y + j < 0 || y + j >= maxY ) b = y - j;
          GC += chrome[a][b] * gaussian[cal];
          cal ++;
        }
    }
  var U_C = Math.abs(expectation - GC);
  return U_C;
}



function expectationC(radius,chrome,x,y){//chrome期望
  var reverseDM = 1/(M*M);
  var E_M_C =0;
  for (var i=-radius;i<=radius ;i++ )
    {
      for (var j=-radius;j<=radius ;j++ )
        {
          var a = x + i;
          var b = y + j;  
          if( x + i < 0 || x + i >= maxX ) a = x - i;
          if( y + j < 0 || y + j >= maxY ) b = y - j;
          E_M_C += chrome[a][b];
        }
    }
  E_M_C = E_M_C*reverseDM;
  return E_M_C;

}

function expectationH(M,hue,x,y){//hue期望
    var reverseDM = 1/(M*M);
    var R = 100;
    var E_M_H = $M([
      [0],
      [0]
      ]);
               console.log('hue',hue);

    for (var i=-radius;i<=radius ;i++ )
      {
        for (var j=-radius;j<=radius ;j++ )
        {
        var a = x + i;
        var b = y + j;  
        if( x + i < 0 || x + i >= maxX ) a = x - i;
        if( y + j < 0 || y + j >= maxY ) b = y - j;
        var MM = $M([
          [Math.cos(hue[a][b]/360)],
          [Math.sin(hue[a][b]/360)]
          ]);
          // console.log('MM',MM);
        // E_M_H.dup(E_M_H.add(MM));
         E_M_H = E_M_H.add(MM);
         console.log('E_M_H',E_M_H);
      }
    }
    E_M_H = E_M_H.multiply(reverseDM);
    E_M_H = E_M_H.multiply(R);
    console.log('EMH',E_M_H);
    return E_M_H;

}

function changeImageData(width,height,orderData){//转换图像
    var imageRGB;
    var imageH = new Array;
    var imageC = new Array;
    var imageL = new Array;
    var chrome = new Array;
    var hue = new Array; 
    var lightness = new Array;
     for(var i =0,len = orderData.length; i<len;i+=4){
      // for(var i =0;i==0; i+=4){
        var red = orderData[i],//红色色深
        green = orderData[i+1],//绿色色深
        blue = orderData[i+2],//蓝色色深
        alpha = orderData[i+3];//透明度
        
        //因此RGB颜色就是(red, green, blue, alpha)
        var color = $M([[red],[green],[blue]]);
        // console.log('color', color);
        var hexColor = chroma(red,green,blue,'rgb');
        // console.log('hexcolor', hexColor);
        var hclColor = chroma(red,green,blue).hcl();
         // console.log('hclcolor', hclColor);//得到hcl

        if(hclColor[0]){
          imageH.push(hclColor[0]);
        }else{
            imageH.push(0);
        }
        if(hclColor[1]){
          imageC.push(hclColor[1]);
        }else{
          imageC.push(0);
        }
        imageL.push(hclColor[2]);

    }
    

    for(var i=0;i<height;i++){
      var rowH = new Array;
      var rowC = new Array;
      var rowL = new Array;
      for(var j=0;j<width;j++){
          rowH.push(imageH[i*width+j]);
          rowC.push(imageC[i*width+j]);
          rowL.push(imageL[i*width+j]);
      }
      hue.push(rowH);
      chrome.push(rowC);
      lightness.push(rowL);
    }
    console.log('hue',hue);
    return [hue,chrome,lightness];//第i行第j列的颜色
}


// function ToMat(image, height, width){//第一步，RGB矩阵转换为LCH矩阵
//      var dataL, dataC, dataH;
//      for(var i=0; i < height; ++i)
//      {
//       var rowL, rowC, rowH;
//       for(var j=0; j < width; ++j)
//       {
//        var lch = RGBToCIELCH(image[(i*width+j)*4+0], image[(i*width+j)*4+1], image[(i*width+j)*4+2]);
//        rowL.push(lch[0]);
//        rowC.push(lch[1]);
//        rowH.push(lch[2]);
//       }
//       dataL.push(rowL);
//       dataC.push(rowC);
//       dataH.push(rowH);
//      }

//      var L = $M(dataL);
//      var C = $M(dataC);
//      var H = $M(dataH);

//      return [L, C, H];
//     }


/*var image; 一维数组转二维数组
var dataL, dataC, dataH;
for(var i=0; i < height; ++i)
{
 var rowL, rowC, rowH;
 for(var j=0; j < width; ++j)
 {
  rowL.push(image[(i*width+j)*3+0]);
  rowC.push(image[(i*width+j)*3+1]);
  rowH.push(image[(i*width+j)*3+2]);
 }
 dataL.push(rowL);
 dataC.push(rowC);
 dataH.push(rowH);
}

var L = $M(dataL);
var C = $M(dataC);
var H = $M(dataH);*/



/**
 * Returns a function which will handle displaying information about the
 * image once the ImageInfo class has finished loading.
 */
function getImageInfoHandler(url) {
  return function() {
    renderUrl(url);
    renderThumbnail(url);
    renderCanvas(url);
    var imageinfo = ImageInfo.getAllFields(url);
    renderImageInfo(imageinfo);
    resizeWindow();
  };
};

/**
 * Load the image in question and display it, along with its metadata.
 */
document.addEventListener("DOMContentLoaded", function () {
  // The URL of the image to load is passed on the URL fragment.
  var imageUrl = window.location.hash.substring(1);
  if (imageUrl) {
    // Use the ImageInfo library to load the image and parse it.
    ImageInfo.loadInfo(imageUrl, getImageInfoHandler(imageUrl));
  }
});
