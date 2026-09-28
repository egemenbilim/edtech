import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
download_dir = os.path.expanduser('~/Downloads')
print("Download dir:", download_dir)
if os.path.exists(download_dir):
    for f in os.listdir(download_dir):
        print(" -", f)
