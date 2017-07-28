 # -*- coding: utf-8 -*-
from PCV.tools import imtools, pca
from PIL import Image, ImageDraw
from pylab import *

imlist = imtools.get_imlist('../xxxraw/')

for i in imlist:
	im = Image.open(i)
	im = im.transform((200,200),Image.EXTENT,(0,0,533,533))
	# im.thumbnail((88, 88))
	filename = i[:3]+i[4:]

	# print filename
	im.save(filename)  # need temporary files of the right size