# -*- coding: utf-8 -*-
import cv2

# 读入图像
im = cv2.imread('../xxxraw/1183.jpg')

# 打印图像尺寸
h, w = im.shape[:2]
print h, w

# 保存原jpg格式的图像为png格式图像
cv2.imwrite('ch10_P210_Reading-and-Writing-Images.png',im)