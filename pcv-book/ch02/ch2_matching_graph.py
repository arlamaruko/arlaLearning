# -*- coding: utf-8 -*-
from pylab import *
from PIL import Image
from PCV.localdescriptors import sift
from PCV.tools import imtools
import pydot

""" This is the example graph illustration of matching images from Figure 2-10.
To download the images, see ch2_download_panoramio.py."""

#download_path = "panoimages"  # set this to the path where you downloaded the panoramio images
#path = "/FULLPATH/panoimages/"  # path to save thumbnails (pydot needs the full system path)

download_path = "D:/Desktop/pcv-book-code-master/xxx/"  # set this to the path where you downloaded the panoramio images
path = "D:/Desktop/pcv-book-code-master/xxx/"  # path to save thumbnails (pydot needs the full system path)

# list of downloaded filenames
imlist = imtools.get_imlist(download_path)
print (imlist)
nbr_images = len(imlist)

# # extract features
# featlist = [imname[:-3] + 'sift' for imname in imlist]
# for i, imname in enumerate(imlist):
#    sift.process_image(imname, featlist[i])


# # extract matchscores
# matchscores = zeros((nbr_images, nbr_images))

# for i in range(nbr_images):
#     for j in range(i, nbr_images):  # only compute upper triangle
#         print 'comparing ', imlist[i], imlist[j]
#         l1, d1 = sift.read_features_from_file(featlist[i])
#         l2, d2 = sift.read_features_from_file(featlist[j])
#         matches = sift.match_twosided(d1, d2)
#         nbr_matches = sum(matches > 0)
#         print 'number of matches = ', nbr_matches
#         matchscores[i, j] = nbr_matches
# print "The match scores is: %d", matchscores

# np.savetxt("../matches.txt",matchscores)

matchscores = np.loadtxt("../matches.txt")


# copy values
for i in range(nbr_images):
    for j in range(i + 1, nbr_images):  # no need to copy diagonal
        matchscores[j, i] = matchscores[i, j]

threshold = 2  # min number of matches needed to create link

g = pydot.Dot(graph_type='graph')  # don't want the default directed graph

for i in range(nbr_images):
    for j in range(i + 1, nbr_images):
        if matchscores[i, j] > threshold:
            # first image in pair
            im = Image.open(imlist[i])
            im.thumbnail((100, 100))
            filename = path + str(i) + '-.jpg'
            im.save(filename)  # need temporary files of the right size
            g.add_node(pydot.Node(str(i), fontcolor='transparent', shape='rectangle', image=filename))
            print (filename)
            # second image in pair
            im = Image.open(imlist[j])
            im.thumbnail((100, 100))
            filename = path + str(j) + '-.jpg'
            im.save(filename)  # need temporary files of the right size
            g.add_node(pydot.Node(str(j), fontcolor='transparent', shape='rectangle', image=filename))

            g.add_edge(pydot.Edge(str(i), str(j)))

g.write_png('../nodes.png')