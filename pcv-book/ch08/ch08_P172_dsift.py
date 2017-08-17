# -*- coding: utf-8 -*-
from PCV.localdescriptors import sift, dsift
from pylab import  *
from PIL import Image

dsift.process_image_dsift('../xxraw/1149.jpg','empire.dsift',27,12,True)
l,d = sift.read_features_from_file('empire.dsift')
im = array(Image.open('../xxraw/1149.jpg'))
sift.plot_features(im,l,True)
title('dense SIFT')
show()