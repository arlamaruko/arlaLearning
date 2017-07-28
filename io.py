import os 
for filename in os.listdir(r"./picture"):
    print ( filename)     

import cv2                   #导入opencv库
img1 = cv2.imread(filenames,cv2.IMREAD_GRAYSCALE)   #读取图片，第二个参数表示以灰度图像读入
if img1 is None:                   #判断读入的img1是否为空，为空就继续下一轮循环
            continue
res1= cv2.resize(img1,(28,28))              #对图片进行缩放，第一个参数是读入的图片，第二个是制定的缩放大小
res1_1 = res1.reshape(1,784)/255       #将表示图片的二维矩阵转换成一维
res1_1_1 = res1_1.tolist()                     #将numpy.narray类型的矩阵转换成list
train_set_x.append(res1_1_1) 