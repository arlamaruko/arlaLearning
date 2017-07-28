from PIL import Image
from pylab import *

im = array(Image.open('../1/1001.jpg'))
imshow(im)
print 'Please click 3 points'
imshow(im)
x = ginput(3)
print 'You clicked:', x

show()

