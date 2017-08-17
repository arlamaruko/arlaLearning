# -*- coding: utf-8 -*-
import cherrypy
import pickle
from PCV.localdescriptors import sift
import urllib
import os
from numpy import *
#from PCV.tools.imtools import get_imlist
from PCV.imagesearch import imagesearch

"""
This is the image search demo in Section 7.6.
"""


class SearchDemo:

    def __init__(self):
        # 载入图像列表
        self.path = '../xxraw/'
        #self.path = 'D:/python_web/isoutu/first500/'
        self.imlist = [os.path.join(self.path,f) for f in os.listdir(self.path) if f.endswith('.jpg')]
        #self.imlist = get_imlist('./first500/')
        #self.imlist = get_imlist('E:/python/isoutu/first500/')
        self.nbr_images = len(self.imlist)
        self.ndx = range(self.nbr_images)

        # 载入词汇
        f = open('../xxraw/vocabulary.pkl', 'rb')
        self.voc = pickle.load(f)
        f.close()

        # 显示搜索返回的图像数
        self.maxres = 49

        # header and footer html
        self.header = """
            <!doctype html>
            <head>
            <title>Image search</title>
            </head>
            <body>
            """
        self.footer = """
            </body>
            </html>
            """

    def index(self, query=None):
        self.src = imagesearch.Searcher('../xxraw/testImaAdd.db', self.voc)

        html = self.header
        html += """
            <br />
            Click an image to search. <a href='?query='> Random selection </a> of images.
            <br /><br />
            """
        if query:
            # query the database and get top images
            #查询数据库，并获取前面的图像

            res = self.src.query(query)[:self.maxres]

            # load image features for query image
            #载入查询图像特征
            featlist = [self.imlist[i][:-3]+'sift' for i in range(self.nbr_images)]
            q_locs,q_descr = sift.read_features_from_file(featlist[query])
            fp = homography.make_homog(q_locs[:,:2].T)

            # RANSAC model for homography fitting
            #用单应性进行拟合建立RANSAC模型
            model = homography.RansacModel()
            rank = {}

            # load image features for result
            #载入候选图像的特征
            for ndx in res_reg[1:]:
                locs,descr = sift.read_features_from_file(featlist[ndx])  # because 'ndx' is a rowid of the DB that starts at 1
                # get matches
                matches = sift.match(q_descr,descr)
                ind = matches.nonzero()[0]
                ind2 = matches[ind]
                tp = homography.make_homog(locs[:,:2].T)
                # compute homography, count inliers. if not enough matches return empty list
                try:
                    H,inliers = homography.H_from_ransac(fp[:,ind],tp[:,ind2],model,match_theshold=4)
                except:
                    inliers = []
                # store inlier count
                rank[ndx] = len(inliers)

            # sort dictionary to get the most inliers first
            sorted_rank = sorted(rank.items(), key=lambda t: t[1], reverse=True)
            res_geom = [res_reg[0]]+[s[0] for s in sorted_rank]


            for i in range(self.maxres):
                imname = src.get_filename(res[i])
                html += "<a href='?query="+imname+"'>"
                html += "<img src='"+imname+"' width='200' />"
                html += "</a>"
            # show random selection if no query
            # 如果没有查询图像则随机显示一些图像
        else:
            random.shuffle(self.ndx)
            for i in self.ndx[:self.maxres]:
                imname = self.imlist[i]
                html += "<a href='?query="+imname+"'>"
                html += "<img src='"+imname+"' width='200' />"
                html += "</a>"

        html += self.footer
        return html

    index.exposed = True

#conf_path = os.path.dirname(os.path.abspath(__file__))
#conf_path = os.path.join(conf_path, "service.conf")
#cherrypy.config.update(conf_path)
#cherrypy.quickstart(SearchDemo())

cherrypy.quickstart(SearchDemo(), '/', config=os.path.join(os.path.dirname(__file__), 'service.conf'))