import cv2
import json
import os

def process_blueprint(image_path="sample.png"):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found")
        return []

    img = cv2.imread(image_path)
    if img is None:
        return []

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, 3.14159/180, threshold=30, minLineLength=20, maxLineGap=10)

    walls_data = []
    if lines is not None:
        for line in lines:
            # Safe unpack format (1D aur 2D array dono handle karega)
            coords = line[0] if len(line.shape) > 1 else line
            x1, y1, x2, y2 = coords
            walls_data.append({
                "x1": int(x1),
                "y1": int(y1),
                "x2": int(x2),
                "y2": int(y2)
            })

    return walls_data
