import os
import re

dir_path = r"C:\Users\Marcelina José\.gemini\antigravity\scratch\FinancasApp\app\src"
for root, dirs, files in os.walk(dir_path):
    for f in files:
        if f.endswith(".jsx"):
            fp = os.path.join(root, f)
            with open(fp, "r", encoding="utf-8", errors="ignore") as file:
                lines = file.readlines()
                for idx, line in enumerate(lines):
                    if "<select" in line:
                        print(f"File: {f}, Line {idx+1}: {line.strip()}")
