from __future__ import print_function
from PIL import Image
import cv2
import numpy as np
import math 
import glob
from shapely.geometry import Polygon
import os

zoom = 20
tileSize = 256
initialResolution = 2 * math.pi * 6378137 / tileSize
originShift = 2 * math.pi * 6378137 / 2.0
earthc = 6378137 * 2 * math.pi
factor = math.pow(2, zoom)
map_width = 256 * (2 ** zoom)


def grays(im):
    return cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)


def white_image(im):
    return cv2.bitwise_not(np.zeros(im.shape, np.uint8))


def pixels_per_mm(lat, length):
    return length / math.cos(lat * math.pi / 180) * earthc * 1000 / map_width


def sharp(gray):
    blur = cv2.bilateralFilter(gray, 5, sigmaColor=7, sigmaSpace=5)
    kernel_sharp = np.array((
        [-2, -2, -2],
        [-2, 17, -2],
        [-2, -2, -2]), dtype='int')
    return cv2.filter2D(blur, -1, kernel_sharp)


def contours_canny(cnts):
    cv2.drawContours(canny_contours, cnts, -1, 255, 1)
    for cnt in cnts:
        counters = 0
        cnt = np.array(cnt)
        cnt = np.reshape(cnt, (cnt.shape[0], cnt.shape[2]))
        pts = []
        if cv2.contourArea(cnt) > 10:
            for i in cnt:
                x, y = i
                if edged[y, x] == 255:
                    counters += 1
                    pts.append((x, y))
        if counters > 10:
            pts = np.array(pts)
            pts = pts.reshape(-1, 1, 2)
            cv2.polylines(canny_polygons, [pts], True, 0)


def contours_img(cnts):
    cv2.drawContours(image_contours, cnts, -1, 255, 1)
    for cnt in cnts:
        counter = 0
        cnt = np.array(cnt)
        cnt = np.reshape(cnt, (cnt.shape[0], cnt.shape[2]))
        pts = []
        if cv2.contourArea(cnt) > 5:
            for i in cnt:
                x, y = i
                if edged[y, x] == 255:
                    counter += 1
                    pts.append((x, y))
        if counter > 10:
            pts = np.array(pts)
            pts = pts.reshape(-1, 1, 2)
            cv2.polylines(image_polygons, [pts], True, 0)


def rotation(center_x, center_y, points, ang):
    angle = ang * math.pi / 180
    rotated_points = []
    for p in points:
        x, y = p
        x, y = x - center_x, y - center_y
        x, y = (x * math.cos(angle) - y * math.sin(angle), x * math.sin(angle) + y * math.cos(angle))
        x, y = x + center_x, y + center_y
        rotated_points.append((x, y))
    return rotated_points


def createLineIterator(P1, P2, img):
    imageH = img.shape[0]
    imageW = img.shape[1]
    P1X, P1Y = P1
    P2X, P2Y = P2
    dX = P2X - P1X
    dY = P2Y - P1Y
    dXa = np.abs(dX)
    dYa = np.abs(dY)
    itbuffer = np.empty(shape=(np.maximum(dYa, dXa), 3), dtype=np.float32)
    itbuffer.fill(np.nan)
    negY = P1Y > P2Y
    negX = P1X > P2X
    if P1X == P2X:
        itbuffer[:, 0] = P1X
        itbuffer[:, 1] = np.arange(P1Y - 1, P1Y - dYa - 1, -1) if negY else np.arange(P1Y + 1, P1Y + dYa + 1)
    elif P1Y == P2Y:
        itbuffer[:, 1] = P1Y
        itbuffer[:, 0] = np.arange(P1X - 1, P1X - dXa - 1, -1) if negX else np.arange(P1X + 1, P1X + dXa + 1)
    else:
        steepSlope = dYa > dXa
        if steepSlope:
            slope = dX.astype(float) / dY.astype(float)
            itbuffer[:, 1] = np.arange(P1Y - 1, P1Y - dYa - 1, -1) if negY else np.arange(P1Y + 1, P1Y + dYa + 1)
            itbuffer[:, 0] = (slope * (itbuffer[:, 1] - P1Y)).astype(int) + P1X
        else:
            slope = dY.astype(float) / dX.astype(float)
            itbuffer[:, 0] = np.arange(P1X - 1, P1X - dXa - 1, -1) if negX else np.arange(P1X + 1, P1X + dXa + 1)
            itbuffer[:, 1] = (slope * (itbuffer[:, 0] - P1X)).astype(int) + P1Y
    colX = itbuffer[:, 0]
    colY = itbuffer[:, 1]
    itbuffer = itbuffer[(colX >= 0) & (colY >= 0) & (colX < imageW) & (colY < imageH)]
    itbuffer[:, 2] = img[itbuffer[:, 1].astype(np.uint), itbuffer[:, 0].astype(np.uint)]
    return itbuffer


def panel_rotation(panels_series, solar_roof_area):
    global fname
    high_reso = cv2.pyrUp(solar_roof_area)
    rows, cols = high_reso.shape
    high_reso_new = cv2.pyrUp(new_image)

    panel_count = 0  

    for _ in range(panels_series - 2):
        for col in range(0, cols, l + 1):
            for row in range(0, rows, w + 1):
                solar_patch = high_reso[row:row + (w + 1) * pw + 1, col:col + ((l * pl) + 3)]
                r, c = solar_patch.shape
                patch_rotate = np.array([[col, row], [c + col, row], [c + col, r + row], [col, r + row]], np.int32)
                rotated_patch_points = rotation((col + c) / 2, row + r / 2, patch_rotate, solar_angle)
                rotated_patch_points = np.array(rotated_patch_points, np.int32)

                if (rotated_patch_points > 0).all():
                    solar_polygon = Polygon(rotated_patch_points)
                    polygon_points = np.array(solar_polygon.exterior.coords, np.int32)
                    patch_intensity_check = []

                    for j in range(rows):
                        for k in range(cols):
                            if cv2.pointPolygonTest(polygon_points, (k, j), False) == 1:
                                patch_intensity_check.append(high_reso[j, k])

                    if len(patch_intensity_check) > 0 and np.mean(patch_intensity_check) == 255:
                        solar_line_1 = createLineIterator(rotated_patch_points[0], rotated_patch_points[1], high_reso).astype(int)
                        solar_line_2 = createLineIterator(rotated_patch_points[3], rotated_patch_points[2], high_reso).astype(int)

                        line1_points, line2_points = [], []
                        if len(solar_line_2) > 10 and len(solar_line_1) > 10:
                            cv2.fillPoly(high_reso, [rotated_patch_points], 0)
                            cv2.polylines(high_reso_orig, [rotated_patch_points], 1, 0, 2)
                            cv2.fillPoly(high_reso_orig, [rotated_patch_points], (0, 0, 255))

                            for i in range(5, len(solar_line_1), 5):
                                line1_points.append(solar_line_1[i])
                            for i in range(5, len(solar_line_2), 5):
                                line2_points.append(solar_line_2[i])

                        for points1, points2 in zip(line1_points, line2_points):
                            x1, y1, _ = points1
                            x2, y2, _ = points2
                            cv2.line(high_reso_orig, (x1, y1), (x2, y2), (0, 0, 0), 1)
                            panel_count += 1  

        panels_series -= 1

    base_name = os.path.basename(fname)
    result = Image.fromarray(high_reso_orig)
    result.save(os.path.join("output", base_name))

    print(f"✅ {panel_count} individual solar panels placed in {base_name}")

if __name__ == "__main__":
    images = glob.glob('input/1.jpg')
    for fname in images:
        pl, pw, l, w, solar_angle = 4, 1, 8, 5, 30
        image = cv2.imread(fname)
        img = cv2.pyrDown(image)
        print(f"\nProcessing {fname} ...")
        high_reso_orig = cv2.pyrUp(image)
        canny_contours = white_image(image)
        image_contours = white_image(image)
        image_polygons = grays(canny_contours)
        canny_polygons = grays(canny_contours)
        grayscale = grays(image)
        sharp_image = sharp(grayscale)
        edged = cv2.Canny(sharp_image, 180, 240)
        thresh = cv2.threshold(sharp_image, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
        contours_img(cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)[-2])
        contours_canny(cv2.findContours(edged, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)[-2])
        solar_roof = cv2.bitwise_and(image_polygons, canny_polygons)
        new_image = white_image(image)
        panel_rotation(pl, solar_roof)
