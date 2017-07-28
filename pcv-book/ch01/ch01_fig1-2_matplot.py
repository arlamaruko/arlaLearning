from PIL import Image
from pylab import *

im = array(Image.open('../1/1001.jpg'))

imshow(im)

x = [100, 100, 400, 400]
y = [200, 500, 200, 500]
plot(x, y, 'r*')

plot(x[:2], y[:2])

#axis('off')

title('Plotting: "empire.jpg"')
show()
