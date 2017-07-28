 # -*- coding: utf-8 -*-
from PIL import Image
from pylab import *

im = array(Image.open('../1/1001.jpg'))
print im.shape, im.dtype
im = array(Image.open('../1/1001.jpg').convert('L'),'f')
print im.shape, im.dtype